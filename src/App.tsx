import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ROUTES } from '@/shared/lib/config/routes';
import { ProtectedRoute } from '@/shared/components/providers/ProtectedRoute';
import { HomePage } from '@/pages/home/home';
import { LoginPage } from '@/pages/auth/login/login';
import { DashboardPage } from '@/pages/dashboard/dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />

        <Route
          path={ROUTES.LOGIN}
          element={
            <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
