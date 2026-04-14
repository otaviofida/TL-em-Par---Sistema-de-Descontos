import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { RegisterInput, LoginInput, UpdateProfileInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js';
import { UnauthorizedError, ConflictError, NotFoundError, AppError } from '../../../shared/errors/index.js';
import { JwtPayload } from '../../../shared/types/auth.js';
import { Role } from '../../../generated/prisma/index.js';

export class AuthService {
  constructor(private authRepo = new AuthRepository()) {}

  async register(data: RegisterInput) {
    const existingEmail = await this.authRepo.findUserByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Este email já está cadastrado.', 'EMAIL_ALREADY_EXISTS');
    }

    if (data.cpf) {
      const existingCpf = await this.authRepo.findUserByCpf(data.cpf);
      if (existingCpf) {
        throw new ConflictError('Este CPF já está cadastrado.', 'CPF_ALREADY_EXISTS');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.authRepo.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      gender: data.gender,
    });

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription: null },
      ...tokens,
    };
  }

  async login(data: LoginInput) {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos.', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha incorretos.', 'INVALID_CREDENTIALS');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: { id: userWithoutPassword.id, name: userWithoutPassword.name, email: userWithoutPassword.email, role: userWithoutPassword.role, subscription: userWithoutPassword.subscription ?? null },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    const storedToken = await this.authRepo.findRefreshToken(token);

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.', 'INVALID_REFRESH_TOKEN');
    }

    await this.authRepo.deleteRefreshToken(token);

    const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.role);

    return tokens;
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const updated = await this.authRepo.updateUser(userId, data);
    return { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const updated = await this.authRepo.updateUser(userId, { avatarUrl });
    return { id: updated.id, avatarUrl: updated.avatarUrl };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.authRepo.findUserByEmail(data.email);

    // Sempre retorna sucesso para não revelar se o email existe (segurança)
    if (!user) {
      return { message: 'Se o email estiver cadastrado, você receberá um link para redefinir a senha.' };
    }

    // Limpa tokens antigos/usados
    await this.authRepo.deleteExpiredPasswordResetTokens(user.id);

    // Gera token com validade de 1 hora
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.authRepo.createPasswordResetToken(user.id, token, expiresAt);

    // TODO: Integrar serviço de email (Resend/SendGrid/Nodemailer)
    // Por enquanto, loga o link no console (apenas em desenvolvimento)
    const resetLink = `${env.FRONTEND_URL}/redefinir-senha/${token}`;
    if (env.NODE_ENV === 'development') {
      console.log(`\n🔑 [PASSWORD RESET] Link para ${user.email}: ${resetLink}\n`);
    }

    return { message: 'Se o email estiver cadastrado, você receberá um link para redefinir a senha.' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const resetToken = await this.authRepo.findPasswordResetToken(data.token);

    if (!resetToken) {
      throw new AppError('Token inválido ou expirado.', 400, 'INVALID_RESET_TOKEN');
    }

    if (resetToken.used) {
      throw new AppError('Este link já foi utilizado.', 400, 'TOKEN_ALREADY_USED');
    }

    if (resetToken.expiresAt <= new Date()) {
      throw new AppError('Token expirado. Solicite um novo link.', 400, 'TOKEN_EXPIRED');
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(data.password, 12);
    await this.authRepo.updateUser(resetToken.userId, { password: hashedPassword });

    // Marca token como usado
    await this.authRepo.markPasswordResetTokenUsed(resetToken.id);

    // Invalida todas as sessões (refresh tokens)
    await this.authRepo.deleteUserRefreshTokens(resetToken.userId);

    return { message: 'Senha redefinida com sucesso.' };
  }

  private async generateTokens(userId: string, role: Role) {
    const payload: JwtPayload = { userId, role };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await this.authRepo.createRefreshToken(userId, refreshToken, refreshExpiresAt);

    return { accessToken, refreshToken };
  }
}
