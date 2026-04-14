// Resposta padrão da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  subscription?: SubscriptionInfo;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Subscription
export interface SubscriptionInfo {
  id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// Company
export interface Company {
  id: string;
  name: string;
  description?: string;
  category?: string;
  logoUrl?: string;
  coverUrl?: string;
  address?: string;
  city?: string;
  phone?: string;
  instagram?: string;
  benefitDescription?: string;
  benefitRules?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  qrToken?: string;
  alreadyUsed?: boolean;
  usedAt?: string | null;
  avgRating?: number;
  reviewCount?: number;
}

// Edition
export interface Edition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'FINISHED';
  _count?: {
    companies: number;
    benefitRedemptions: number;
  };
}

// Benefit Redemption
export interface BenefitRedemption {
  id: string;
  company: { id: string; name: string; logoUrl?: string };
  benefit: string;
  edition: { id: string; name: string };
  redeemedAt: string;
}

export interface BenefitValidationResult {
  redemptionId: string;
  company: { id: string; name: string };
  benefit: string;
  redeemedAt: string;
  edition: { id: string; name: string };
}

// Review
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
  company?: { id: string; name: string; logoUrl?: string };
}

export interface ReviewStats {
  avgRating: number;
  reviewCount: number;
}

// Admin Dashboard
export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCompanies: number;
  activeCompanies: number;
  totalRedemptions: number;
  redemptionsThisMonth: number;
  currentEdition: { id: string; name: string; redemptionCount: number } | null;
  topCompanies: { id: string; name: string; logoUrl: string | null; redemptionCount: number }[];
}

// Notification
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: string;
  createdAt: string;
}

// Marketing Push
export interface MarketingPush {
  id: string;
  title: string;
  message: string;
  url?: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  sentCount: number;
  failCount: number;
  createdBy: string;
  createdAt: string;
  admin?: { name: string };
}
