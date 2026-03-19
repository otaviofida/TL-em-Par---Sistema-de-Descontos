export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado.',
  CPF_ALREADY_EXISTS: 'Este CPF já está cadastrado.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  INVALID_REFRESH_TOKEN: 'Sessão expirada. Faça login novamente.',
  SUBSCRIPTION_REQUIRED: 'Você precisa de uma assinatura ativa.',
  INVALID_QR_TOKEN: 'QR Code inválido. Tente novamente.',
  COMPANY_INACTIVE: 'Esta empresa não está participando no momento.',
  NO_ACTIVE_EDITION: 'Nenhuma edição ativa no momento.',
  COMPANY_NOT_IN_EDITION: 'Esta empresa não participa da edição atual.',
  BENEFIT_ALREADY_USED: 'Você já utilizou este benefício nesta edição.',
  UNAUTHORIZED: 'Acesso não autorizado.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  VALIDATION_ERROR: 'Verifique os dados informados.',
  INTERNAL_ERROR: 'Erro interno. Tente novamente mais tarde.',
  NOT_FOUND: 'Recurso não encontrado.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  COMPANY_NOT_FOUND: 'Empresa não encontrada.',
  EDITION_NOT_FOUND: 'Edição não encontrada.',
};

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { code?: string; message?: string } } } };
    const code = axiosError.response?.data?.error?.code;
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    const message = axiosError.response?.data?.error?.message;
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}

export function getErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { code?: string } } } };
    return axiosError.response?.data?.error?.code ?? null;
  }
  return null;
}
