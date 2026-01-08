import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

function ProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Si pas connecté → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si connecté mais n'a pas le profile "ADMIN" → redirige vers front office
  const hasAdminProfile = user?.profiles?.some(
    (p: any) => p.profile?.profil === 'ADMIN'
  );

  if (!hasAdminProfile) {
    return <Navigate to="/" replace />;
  }

  // Sinon, laisse passer (affiche le layout + Outlet)
  return <Outlet />;
}

export default ProtectedRoute;