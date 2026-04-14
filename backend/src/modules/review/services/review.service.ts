import { ReviewRepository } from '../repositories/review.repository.js';
import { CompanyRepository } from '../../company/repositories/company.repository.js';
import { EditionRepository } from '../../edition/repositories/edition.repository.js';
import { BenefitRepository } from '../../benefit/repositories/benefit.repository.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../shared/errors/index.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';
import { CreateReviewInput } from '../schemas/review.schema.js';

export class ReviewService {
  constructor(
    private reviewRepo = new ReviewRepository(),
    private companyRepo = new CompanyRepository(),
    private editionRepo = new EditionRepository(),
    private benefitRepo = new BenefitRepository(),
  ) {}

  /**
   * Cria avaliação — regras:
   *  1. Empresa deve existir e estar ativa
   *  2. Deve haver edição ativa
   *  3. Usuário deve ter resgatado benefício nesta empresa/edição
   *  4. Apenas uma avaliação por usuário/empresa/edição
   */
  async create(userId: string, input: CreateReviewInput) {
    const company = await this.companyRepo.findById(input.companyId);
    if (!company || company.status !== 'ACTIVE') {
      throw new NotFoundError('Empresa não encontrada.');
    }

    const activeEdition = await this.editionRepo.findActive();
    if (!activeEdition) {
      throw new NotFoundError('Nenhuma edição ativa no momento.', 'NO_ACTIVE_EDITION');
    }

    // Verificar se já resgatou benefício
    const redemption = await this.benefitRepo.findRedemption(userId, input.companyId, activeEdition.id);
    if (!redemption) {
      throw new ForbiddenError('Você precisa utilizar o benefício antes de avaliar.', 'BENEFIT_NOT_REDEEMED');
    }

    // Verificar se já avaliou
    const existing = await this.reviewRepo.findByUserCompanyEdition(userId, input.companyId, activeEdition.id);
    if (existing) {
      throw new ConflictError('Você já avaliou esta empresa nesta edição.', 'REVIEW_ALREADY_EXISTS');
    }

    const review = await this.reviewRepo.create({
      userId,
      companyId: input.companyId,
      editionId: activeEdition.id,
      rating: input.rating,
      comment: input.comment,
    });

    return review;
  }

  async listByCompany(companyId: string, pagination: PaginationParams) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.reviewRepo.findByCompany({ companyId, skip, take });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async getCompanyStats(companyId: string) {
    return this.reviewRepo.getCompanyStats(companyId);
  }

  // Admin
  async listAll(pagination: PaginationParams, filters: { companyId?: string; userId?: string }) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.reviewRepo.findAll({ skip, take, ...filters });

    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async delete(id: string) {
    const review = await this.reviewRepo.findById(id);
    if (!review) {
      throw new NotFoundError('Avaliação não encontrada.');
    }
    await this.reviewRepo.delete(id);
  }
}
