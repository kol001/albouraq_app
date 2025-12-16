import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';  // ← Ajout pour TS
import { getUser } from '../features/selectors';  // Ton sélecteur (on le crée ci-dessous si besoin)
import type { RootState } from '../app/store';  // Pour typer le state

type Props = {
  children: ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const user = useSelector((state: RootState) => getUser(state));  // ← Typé explicitement
  const token = localStorage.getItem('token');

  // État loading : Si user est null mais token existe (en train de charger)
  if (token && !user) {
    return <div>Loading... (ou un Spinner component)</div>;  // ← Évite les redirects foireux
  }

  if (!user || !token) {
    return <Navigate to="/" replace />;  // "/" = login, adapte si c'est /login
  }

  return <>{children}</>;
};

export default ProtectedRoute;