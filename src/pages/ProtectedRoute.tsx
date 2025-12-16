import type { ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from '../app/store'; // Make sure to import your RootState type

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;