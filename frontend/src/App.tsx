import { Routes, Route, Navigate } from 'react-router-dom';

import { InstallPrompt } from './components/InstallPrompt';
import { AuthLayout } from './components/layout/AuthLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicOnlyRoute, PrivateRoute, AdminRoute, SubscriptionRoute } from './components/layout/RouteGuards';

// Public
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { SubscriptionSuccessPage } from './pages/public/SubscriptionSuccessPage';
import { SubscriptionCancelledPage } from './pages/public/SubscriptionCancelledPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Subscriber
import { DashboardPage } from './pages/subscriber/DashboardPage';
import { CheckoutPage } from './pages/subscriber/CheckoutPage';
import { CompaniesPage } from './pages/subscriber/CompaniesPage';
import { CompanyDetailPage } from './pages/subscriber/CompanyDetailPage';
import { ValidateBenefitPage } from './pages/subscriber/ValidateBenefitPage';
import { HistoryPage } from './pages/subscriber/HistoryPage';
import { ProfilePage } from './pages/subscriber/ProfilePage';

// Admin
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminCompanyFormPage } from './pages/admin/AdminCompanyFormPage';
import { AdminEditionsPage } from './pages/admin/AdminEditionsPage';
import { AdminEditionFormPage } from './pages/admin/AdminEditionFormPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminRedemptionsPage } from './pages/admin/AdminRedemptionsPage';
import { AdminMetricsPage } from './pages/admin/AdminMetricsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminMarketingPage } from './pages/admin/AdminMarketingPage';

export function App() {
  return (
    <>
    <InstallPrompt />
    <Routes>
      {/* Public routes (redirect to /painel if already authenticated) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha/:token" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Public (no auth required) */}
      <Route path="/assinatura/sucesso" element={<SubscriptionSuccessPage />} />
      <Route path="/assinatura/cancelado" element={<SubscriptionCancelledPage />} />

      {/* Subscriber routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<SubscriptionRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/painel" element={<DashboardPage />} />
            <Route path="/empresas" element={<CompaniesPage />} />
            <Route path="/empresas/:id" element={<CompanyDetailPage />} />
            <Route path="/validar" element={<ValidateBenefitPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/assinar" element={<CheckoutPage />} />
          </Route>
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/empresas" element={<AdminCompaniesPage />} />
          <Route path="/admin/empresas/nova" element={<AdminCompanyFormPage />} />
          <Route path="/admin/empresas/:id/editar" element={<AdminCompanyFormPage />} />
          <Route path="/admin/edicoes" element={<AdminEditionsPage />} />
          <Route path="/admin/edicoes/nova" element={<AdminEditionFormPage />} />
          <Route path="/admin/edicoes/:id/editar" element={<AdminEditionFormPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/usuarios/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/assinaturas" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/metricas" element={<AdminMetricsPage />} />
          <Route path="/admin/validacoes" element={<AdminRedemptionsPage />} />
          <Route path="/admin/avaliacoes" element={<AdminReviewsPage />} />
          <Route path="/admin/marketing" element={<AdminMarketingPage />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}
