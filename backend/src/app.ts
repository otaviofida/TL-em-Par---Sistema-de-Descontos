import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Routes
import { authRoutes } from './modules/auth/routes/auth.routes.js';
import { companyRoutes } from './modules/company/routes/company.routes.js';
import { editionRoutes } from './modules/edition/routes/edition.routes.js';
import { benefitRoutes } from './modules/benefit/routes/benefit.routes.js';
import { subscriptionRoutes } from './modules/subscription/routes/subscription.routes.js';
import { adminRoutes } from './modules/admin/routes/admin.routes.js';
import { reviewRoutes } from './modules/review/routes/review.routes.js';
import { notificationRoutes } from './modules/notification/routes/notification.routes.js';

const app = express();

// Trust proxy (Nginx reverse proxy)
app.set('trust proxy', 1);

// Security
app.use(helmet());

const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Muitas requisições. Tente novamente em breve.' } },
});

// Rate limiting para rotas sensíveis
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Muitas tentativas. Tente novamente em 15 minutos.' } },
});

// Webhook do Stripe precisa de raw body — montar ANTES do json parser
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Apply global rate limit
app.use('/api', globalLimiter);

// Apply stricter rate limit to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rate limit para validação de benefício (RN-SEC-06)
const benefitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Muitas tentativas de validação. Aguarde um momento.' } },
});
app.use('/api/benefits/validate', benefitLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin/editions', editionRoutes);
app.use('/api/benefits', benefitRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
