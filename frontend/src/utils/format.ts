import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}
