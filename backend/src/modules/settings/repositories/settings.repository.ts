import { prisma } from '../../../config/prisma.js';

export class SettingsRepository {
  async getValue(key: string): Promise<string | null> {
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async getAll() {
    return prisma.appSetting.findMany();
  }

  async setValue(key: string, value: string) {
    return prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
