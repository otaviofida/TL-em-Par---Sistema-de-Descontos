import { Resend } from 'resend';
import { env } from './env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn(`[EMAIL] Resend não configurado. Email para ${params.to} não enviado.`);
    if (env.NODE_ENV === 'development') {
      console.log(`[EMAIL] Subject: ${params.subject}`);
      console.log(`[EMAIL] HTML: ${params.html.substring(0, 200)}...`);
    }
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    console.log(`[EMAIL] Enviado para ${params.to} — id: ${result.data?.id ?? 'N/A'}`);
    if (result.error) {
      console.error(`[EMAIL] Erro Resend:`, result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[EMAIL] Erro ao enviar para ${params.to}:`, error);
    return false;
  }
}

export function passwordResetEmailHtml(name: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">TL EM PAR</h1>
      <p style="color: #feb621; font-size: 14px; margin: 4px 0 0;">Clube de Benefícios Gastronômicos</p>
    </div>
    <h2 style="font-size: 18px; color: #1a1a1a;">Olá, ${name}!</h2>
    <p style="color: #555; line-height: 1.6;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}" style="display: inline-block; background: #feb621; color: #1a1a1a; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
        Redefinir Senha
      </a>
    </div>
    <p style="color: #888; font-size: 13px; line-height: 1.5;">
      Este link expira em <strong>1 hora</strong>.<br>
      Se você não solicitou a redefinição, ignore este email.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #aaa; font-size: 11px; text-align: center;">TL EM PAR &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`.trim();
}

export function emailVerificationHtml(name: string, verifyLink: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">TL EM PAR</h1>
      <p style="color: #feb621; font-size: 14px; margin: 4px 0 0;">Clube de Benefícios Gastronômicos</p>
    </div>
    <h2 style="font-size: 18px; color: #1a1a1a;">Bem-vindo(a), ${name}!</h2>
    <p style="color: #555; line-height: 1.6;">Obrigado por se cadastrar no TL EM PAR! Para ativar sua conta, confirme seu email clicando no botão abaixo:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${verifyLink}" style="display: inline-block; background: #feb621; color: #1a1a1a; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
        Confirmar Email
      </a>
    </div>
    <p style="color: #888; font-size: 13px; line-height: 1.5;">
      Este link expira em <strong>24 horas</strong>.<br>
      Se você não criou esta conta, ignore este email.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #aaa; font-size: 11px; text-align: center;">TL EM PAR &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`.trim();
}

export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">TL EM PAR</h1>
      <p style="color: #feb621; font-size: 14px; margin: 4px 0 0;">Clube de Benefícios Gastronômicos</p>
    </div>
    <h2 style="font-size: 18px; color: #1a1a1a;">Email confirmado, ${name}! 🎉</h2>
    <p style="color: #555; line-height: 1.6;">Sua conta está ativa. Agora você pode assinar o clube e aproveitar todos os benefícios gastronômicos da sua cidade.</p>
    <p style="color: #555; line-height: 1.6;">Bom apetite!</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #aaa; font-size: 11px; text-align: center;">TL EM PAR &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`.trim();
}

export function newEditionEmailHtml(name: string, editionName: string, loginLink: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">TL EM PAR</h1>
      <p style="color: #feb621; font-size: 14px; margin: 4px 0 0;">Clube de Benefícios Gastronômicos</p>
    </div>
    <h2 style="font-size: 18px; color: #1a1a1a;">Nova edição disponível! 🍽️</h2>
    <p style="color: #555; line-height: 1.6;">Olá, ${name}! A edição <strong>${editionName}</strong> acabou de ser ativada.</p>
    <p style="color: #555; line-height: 1.6;">Acesse o app e confira os restaurantes e benefícios desta edição!</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${loginLink}" style="display: inline-block; background: #feb621; color: #1a1a1a; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
        Ver Edição
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #aaa; font-size: 11px; text-align: center;">TL EM PAR &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`.trim();
}

export function subscriptionExpiringEmailHtml(name: string, expirationDate: string, renewLink: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">TL EM PAR</h1>
      <p style="color: #feb621; font-size: 14px; margin: 4px 0 0;">Clube de Benefícios Gastronômicos</p>
    </div>
    <h2 style="font-size: 18px; color: #1a1a1a;">Sua assinatura está acabando ⏳</h2>
    <p style="color: #555; line-height: 1.6;">Olá, ${name}! Sua assinatura do TL EM PAR está marcada para cancelamento em <strong>${expirationDate}</strong>.</p>
    <p style="color: #555; line-height: 1.6;">Se quiser continuar aproveitando os benefícios, basta renovar sua assinatura.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${renewLink}" style="display: inline-block; background: #feb621; color: #1a1a1a; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
        Renovar Assinatura
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #aaa; font-size: 11px; text-align: center;">TL EM PAR &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`.trim();
}
