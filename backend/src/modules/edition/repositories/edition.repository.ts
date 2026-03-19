import { prisma } from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';

export class EditionRepository {
  async findById(id: string) {
    return prisma.edition.findUnique({ where: { id } });
  }

  async findActive() {
    const now = new Date();
    return prisma.edition.findFirst({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }

  async findAll(params: { skip: number; take: number }) {
    const [data, total] = await Promise.all([
      prisma.edition.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { startDate: 'desc' },
        include: { _count: { select: { companies: true, benefitRedemptions: true } } },
      }),
      prisma.edition.count(),
    ]);
    return { data, total };
  }

  async create(data: Prisma.EditionCreateInput) {
    return prisma.edition.create({ data });
  }

  async update(id: string, data: Prisma.EditionUpdateInput) {
    return prisma.edition.update({ where: { id }, data });
  }

  async linkCompanies(editionId: string, companyIds: string[]) {
    const data = companyIds.map((companyId) => ({
      editionId,
      companyId,
    }));

    return prisma.companyEdition.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async unlinkCompany(editionId: string, companyId: string) {
    return prisma.companyEdition.deleteMany({
      where: { editionId, companyId },
    });
  }

  async findEditionCompanies(editionId: string) {
    return prisma.companyEdition.findMany({
      where: { editionId },
      include: { company: true },
    });
  }

  async deactivateAllEditions() {
    return prisma.edition.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'FINISHED' },
    });
  }
}
