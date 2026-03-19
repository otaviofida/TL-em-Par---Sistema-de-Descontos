import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Loading } from '../ui/Loading';
import { useEffect } from 'react';

export function PrivateRoute() {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function SubscriptionRoute() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading || !user) return <Loading />;

  const hasActiveSubscription = user.subscription?.status === 'ACTIVE';
  const isCheckoutPage = location.pathname === '/assinar';

  if (!hasActiveSubscription && !isCheckoutPage) {
    return <Navigate to="/assinar" replace />;
  }

  if (hasActiveSubscription && isCheckoutPage) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isLoading || !user) return <Loading />;
  if (user.role !== 'ADMIN') return <Navigate to="/painel" replace />;

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/painel'} replace />;
  }
  return <Outlet />;
}
