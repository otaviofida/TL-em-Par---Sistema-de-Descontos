import { Resend } from 'resend';
import { env } from './env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const LOGO_URL = `${env.FRONTEND_URL}/logo.png`;

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

function emailLayout(content: string): string {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0d0d0d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #0d0d0d; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">
          <!-- Header com logo -->
          <tr>
            <td align="center" style="padding: 0 0 24px;">
              <img src="${LOGO_URL}" alt="TL EM PAR" width="120" style="display: block; max-width: 120px; height: auto;" />
            </td>
          </tr>
          <!-- Card principal -->
          <tr>
            <td style="background: #1a1a1a; border-radius: 16px; padding: 36px 32px; border: 1px solid #2a2a2a;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 0 0;">
              <p style="color: #555; font-size: 12px; margin: 0; line-height: 1.5;">
                TL EM PAR — Clube de Benefícios Gastronômicos<br>
                &copy; ${year} Todos os direitos reservados
              </p>
              <p style="margin: 8px 0 0;">
                <a href="${env.FRONTEND_URL}" style="color: #feb621; font-size: 12px; text-decoration: none;">tlempar.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function emailButton(href: string, text: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 28px 0;">
        <a href="${href}" style="display: inline-block; background: #feb621; color: #1a1a1a; font-weight: 700; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-size: 16px; letter-spacing: 0.3px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

export function passwordResetEmailHtml(name: string, resetLink: string): string {
  return emailLayout(`
    <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 16px;">Olá, ${name}!</h2>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
    </p>
    ${emailButton(resetLink, '🔑 Redefinir Senha')}
    <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0; padding-top: 8px; border-top: 1px solid #2a2a2a;">
      Este link expira em <strong style="color: #feb621;">1 hora</strong>.<br>
      Se você não solicitou a redefinição, ignore este email.
    </p>
  `);
}

export function emailVerificationHtml(name: string, verifyLink: string): string {
  return emailLayout(`
    <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 16px;">Bem-vindo(a), ${name}! 👋</h2>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Obrigado por se cadastrar no <strong style="color: #feb621;">TL EM PAR</strong>!
      Para ativar sua conta, confirme seu email clicando no botão abaixo:
    </p>
    ${emailButton(verifyLink, '✉️ Confirmar Email')}
    <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0; padding-top: 8px; border-top: 1px solid #2a2a2a;">
      Este link expira em <strong style="color: #feb621;">24 horas</strong>.<br>
      Se você não criou esta conta, ignore este email.
    </p>
  `);
}

export function welcomeEmailHtml(name: string): string {
  return emailLayout(`
    <div style="text-align: center;">
      <p style="font-size: 48px; margin: 0 0 16px;">🎉</p>
      <h2 style="font-size: 22px; color: #ffffff; margin: 0 0 16px;">Bem-vindo(a) ao TL EM PAR, ${name}!</h2>
      <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
        Seu pagamento foi confirmado e sua assinatura já está <strong style="color: #22c55e;">ativa</strong>!
      </p>
      <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
        Agora você tem acesso a todos os <strong style="color: #feb621;">benefícios gastronômicos</strong>
        dos nossos restaurantes parceiros. Explore, aproveite e bom apetite! 🍽️
      </p>
      ${emailButton(`${env.FRONTEND_URL}/empresas`, '🍴 Ver Restaurantes')}
    </div>
  `);
}

export function emailVerifiedPaymentHtml(name: string): string {
  return emailLayout(`
    <div style="text-align: center;">
      <p style="font-size: 48px; margin: 0 0 16px;">✅</p>
      <h2 style="font-size: 22px; color: #ffffff; margin: 0 0 16px;">Email confirmado, ${name}!</h2>
      <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
        Sua conta foi verificada com sucesso. Agora é só realizar o pagamento para ativar sua assinatura
        e começar a aproveitar todos os <strong style="color: #feb621;">benefícios gastronômicos</strong>.
      </p>
      ${emailButton(`${env.FRONTEND_URL}/login`, '💳 Fazer Pagamento')}
    </div>
  `);
}

export function newEditionEmailHtml(name: string, editionName: string, loginLink: string): string {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 48px; margin: 0;">🍽️</p>
    </div>
    <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 16px;">Nova edição disponível!</h2>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Olá, ${name}! A edição <strong style="color: #feb621;">${editionName}</strong> acabou de ser ativada.
    </p>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Acesse o app e confira os restaurantes e benefícios desta edição!
    </p>
    ${emailButton(loginLink, '👀 Ver Edição')}
  `);
}

export function subscriptionExpiringEmailHtml(name: string, expirationDate: string, renewLink: string): string {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 48px; margin: 0;">⏳</p>
    </div>
    <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 16px;">Sua assinatura está acabando</h2>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Olá, ${name}! Sua assinatura do TL EM PAR está marcada para cancelamento em
      <strong style="color: #feb621;">${expirationDate}</strong>.
    </p>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Se quiser continuar aproveitando os benefícios, basta renovar sua assinatura.
    </p>
    ${emailButton(renewLink, '🔄 Renovar Assinatura')}
  `);
}

export function paymentFailedEmailHtml(name: string, portalLink: string): string {
  return emailLayout(`
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 48px; margin: 0;">⚠️</p>
    </div>
    <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 16px;">Problema com seu pagamento</h2>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Olá, ${name}! Não foi possível processar a cobrança da sua assinatura do TL EM PAR.
    </p>
    <p style="color: #b0b0b0; line-height: 1.7; font-size: 15px; margin: 0 0 8px;">
      Seu acesso aos benefícios ficará <strong style="color: #ef4444;">suspenso</strong> até que o pagamento seja regularizado.
      Atualize sua forma de pagamento para continuar aproveitando.
    </p>
    ${emailButton(portalLink, '💳 Atualizar Pagamento')}
  `);
}
