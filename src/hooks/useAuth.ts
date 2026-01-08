import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { login, logout } from '../app/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);

  const handleLogin = (tokenData: { 
  token: string; 
    user: { 
      id: string; 
      email: string; 
      nom: string; 
      prenom: string; 
      profiles: string[]; 
      pseudo: string; 
      departement: string; 
      dateCreation: string; 
      dateActivation: string | null; 
      dateDesactivation: string | null; 
      status: string;
      autorisation: any[];  // Add this line
    } 
  }) => {
    dispatch(login(tokenData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return { isAuthenticated, token, user, login: handleLogin, logout: handleLogout };
}