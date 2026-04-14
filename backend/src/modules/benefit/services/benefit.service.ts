import { BenefitRepository } from '../repositories/benefit.repository.js';
import { CompanyRepository } from '../../company/repositories/company.repository.js';
import { EditionRepository } from '../../edition/repositories/edition.repository.js';
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../../../shared/errors/index.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';
import { prisma } from '../../../config/prisma.js';
import { NotificationService } from '../../notification/services/notification.service.js';
import { AuthRepository } from '../../auth/repositories/auth.repository.js';
import { sendEmail, reviewRequestEmailHtml } from '../../../config/email.js';
import { env } from '../../../config/env.js';
import { PushService } from '../../push/services/push.service.js';

const REVIEW_REQUEST_DELAY_MS = 2 * 60 * 60 * 1000;    // 2 horas (email + notificação in-app)
const PUSH_REVIEW_DELAY_MS    = 1 * 60 * 1000;          // TODO: alterar para 30 * 60 * 1000 (30 min) após teste

export class BenefitService {
  constructor(
    private benefitRepo = new BenefitRepository(),
    private companyRepo = new CompanyRepository(),
    private editionRepo = new EditionRepository(),
    private authRepo = new AuthRepository(),
    private pushService = new PushService(),
  ) {}

  /**
   * Valida benefício por QR Code
   * RN-QRC-03: Ordem de validação:
   *  1. Assinatura ativa (verificada via middleware requireActiveSubscription)
   *  2. Token QR válido
   *  3. Empresa ativa
   *  4. Edição vigente
   *  5. Empresa na edição
   *  6. Uso único por empresa/edição
   */
  async validateBenefit(userId: string, qrToken: string) {
    // 1. Verificar assinatura ativa
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new ForbiddenError('Você precisa de uma assinatura ativa.', 'SUBSCRIPTION_REQUIRED');
    }

    // 2. Buscar empresa pelo QR Token
    const company = await this.companyRepo.findByQrToken(qrToken);
    if (!company) {
      throw new NotFoundError('QR Code inválido. Tente novamente.', 'INVALID_QR_TOKEN');
    }

    // 3. Verificar se empresa está ativa
    if (company.status !== 'ACTIVE') {
      throw new ForbiddenError('Esta empresa não está participando no momento.', 'COMPANY_INACTIVE');
    }

    // 4. Buscar edição vigente
    const activeEdition = await this.editionRepo.findActive();
    if (!activeEdition) {
      throw new NotFoundError('Nenhuma edição ativa no momento.', 'NO_ACTIVE_EDITION');
    }

    // 5. Verificar se empresa participa da edição
    const companyInEdition = await prisma.companyEdition.findUnique({
      where: {
        companyId_editionId: { companyId: company.id, editionId: activeEdition.id },
      },
    });

    if (!companyInEdition) {
      throw new ForbiddenError('Esta empresa não participa da edição atual.', 'COMPANY_NOT_IN_EDITION');
    }

    // 6. Verificar se já usou (RN-QRC-06: idempotência)
    const existingRedemption = await this.benefitRepo.findRedemption(userId, company.id, activeEdition.id);
    if (existingRedemption) {
      throw new ConflictError('Você já utilizou este benefício nesta edição.', 'BENEFIT_ALREADY_USED');
    }

    // Tudo válido — gravar redemption
    const redemption = await this.benefitRepo.createRedemption({
      userId,
      companyId: company.id,
      editionId: activeEdition.id,
    });

    // Notificação automática de resgate
    NotificationService.notify(userId, {
      type: 'BENEFIT_REDEEMED',
      title: 'Benefício utilizado!',
      message: `Você usou seu benefício no ${company.name}. Aproveite!`,
      data: { companyId: company.id, companyName: company.name },
    }).catch(err => console.error('[NOTIFICATION] Erro ao criar notificação de resgate:', err));

    // Agenda push de avaliação após PUSH_REVIEW_DELAY_MS (teste: 1min / produção: 30min)
    this.schedulePushReviewRequest(userId, company.id, company.name);

    // Agenda email + notificação in-app de avaliação 2h depois
    this.scheduleReviewRequest(userId, company.id, company.name);

    return {
      redemptionId: redemption.id,
      company: redemption.company,
      benefit: redemption.company.benefitDescription,
      redeemedAt: redemption.redeemedAt,
      edition: redemption.edition,
    };
  }

  async getUserHistory(
    userId: string,
    pagination: PaginationParams,
    filters: { editionId?: string; search?: string; category?: string; startDate?: string; endDate?: string },
  ) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.benefitRepo.findUserHistory({
      userId,
      skip,
      take,
      editionId: filters.editionId,
      search: filters.search,
      category: filters.category,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    const formatted = data.map((r) => ({
      id: r.id,
      company: r.company,
      benefit: r.company.benefitDescription,
      edition: r.edition,
      redeemedAt: r.redeemedAt,
    }));

    return {
      data: formatted,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  private schedulePushReviewRequest(userId: string, companyId: string, companyName: string) {
    setTimeout(async () => {
      try {
        const existingReview = await prisma.review.findFirst({ where: { userId, companyId } });
        if (existingReview) return;

        const reviewLink = `${env.FRONTEND_URL}/empresas/${companyId}`;
        await this.pushService.sendToUser(userId, {
          title: '⭐ Como foi sua experiência?',
          message: `Avalie o ${companyName} e ajude outros assinantes!`,
          url: reviewLink,
        });

        console.log(`[PUSH_REVIEW] Push de avaliação enviado para user ${userId} — ${companyName}`);
      } catch (err) {
        console.error('[PUSH_REVIEW] Erro ao enviar push de avaliação:', err);
      }
    }, PUSH_REVIEW_DELAY_MS);
  }

  private scheduleReviewRequest(userId: string, companyId: string, companyName: string) {
    setTimeout(async () => {
      try {
        // Verifica se o usuário já avaliou antes de enviar
        const existingReview = await prisma.review.findFirst({
          where: { userId, companyId },
        });
        if (existingReview) return;

        // Notificação in-app
        await NotificationService.notify(userId, {
          type: 'REVIEW_REQUEST',
          title: 'Como foi sua experiência?',
          message: `Avalie o ${companyName} e ajude outros assinantes!`,
          data: { companyId, companyName },
        });

        // Email
        const user = await this.authRepo.findUserById(userId);
        if (user) {
          const reviewLink = `${env.FRONTEND_URL}/empresas/${companyId}`;
          sendEmail({
            to: user.email,
            subject: `⭐ Como foi no ${companyName}? Deixe sua avaliação!`,
            html: reviewRequestEmailHtml(user.name, companyName, reviewLink),
          });
        }
      } catch (err) {
        console.error('[REVIEW_REQUEST] Erro ao enviar pedido de avaliação:', err);
      }
    }, REVIEW_REQUEST_DELAY_MS);
  }
}
