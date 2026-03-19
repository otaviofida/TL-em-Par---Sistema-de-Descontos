import { EditionRepository } from '../repositories/edition.repository.js';
import { CreateEditionInput, UpdateEditionInput, LinkCompaniesInput } from '../schemas/edition.schema.js';
import { NotFoundError, AppError } from '../../../shared/errors/index.js';
import { PaginationParams, getPrismaSkipTake } from '../../../shared/helpers/pagination.js';
import { prisma } from '../../../config/prisma.js';

export class EditionService {
  constructor(private editionRepo = new EditionRepository()) {}

  async create(data: CreateEditionInput) {
    return this.editionRepo.create({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  async update(id: string, data: UpdateEditionInput) {
    const edition = await this.editionRepo.findById(id);
    if (!edition) {
      throw new NotFoundError('Edição não encontrada.');
    }

    // RN-EDI-06: Apenas 1 edição pode estar ativa por vez
    if (data.status === 'ACTIVE') {
      await this.editionRepo.deactivateAllEditions();
    }

    const updated = await this.editionRepo.update(id, {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status as any,
    });

    // Auto-vincular todas as empresas ativas à edição quando ativada
    if (data.status === 'ACTIVE') {
      const activeCompanies = await prisma.company.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      if (activeCompanies.length > 0) {
        await this.editionRepo.linkCompanies(id, activeCompanies.map(c => c.id));
      }
    }

    return updated;
  }

  async findAll(pagination: PaginationParams) {
    const { skip, take } = getPrismaSkipTake(pagination);
    const { data, total } = await this.editionRepo.findAll({ skip, take });
    return {
      data,
      meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findById(id: string) {
    const edition = await this.editionRepo.findById(id);
    if (!edition) {
      throw new NotFoundError('Edição não encontrada.');
    }
    return edition;
  }

  async linkCompanies(editionId: string, data: LinkCompaniesInput) {
    const edition = await this.editionRepo.findById(editionId);
    if (!edition) {
      throw new NotFoundError('Edição não encontrada.');
    }

    return this.editionRepo.linkCompanies(editionId, data.companyIds);
  }

  async unlinkCompany(editionId: string, companyId: string) {
    const edition = await this.editionRepo.findById(editionId);
    if (!edition) {
      throw new NotFoundError('Edição não encontrada.');
    }

    return this.editionRepo.unlinkCompany(editionId, companyId);
  }

  async getEditionCompanies(editionId: string) {
    const edition = await this.editionRepo.findById(editionId);
    if (!edition) {
      throw new NotFoundError('Edição não encontrada.');
    }

    return this.editionRepo.findEditionCompanies(editionId);
  }
}
