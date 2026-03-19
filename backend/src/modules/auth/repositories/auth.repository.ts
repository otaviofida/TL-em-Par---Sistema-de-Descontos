import { prisma } from '../../../config/prisma.js';
import { Prisma } from '../../../generated/prisma/index.js';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { subscription: true } });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }

  async findUserByCpf(cpf: string) {
    return prisma.user.findUnique({ where: { cpf } });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  async deleteUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
