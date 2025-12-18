import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../service/Axios'; // Assurez-vous que baseURL est 'http://192.168.1.124:6060' dans Axios.tsx

import { FiEye, FiEyeOff } from "react-icons/fi";



function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Pour le loading
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        motDePasse: password,
      });

      console.log("Réponse API:", response);

      if (response.data.success) {
        const { access_token, refresh_token, expiresIn } = response.data.data;

        // Stockage simple de l'access_token via le hook auth
        const tokenData = {
          token: access_token,
          user: {
            id: 'unknown', // Sans décodage, utilisez un placeholder si besoin
            email: email, // Utilise l'email saisi comme fallback
          },
        };
        login(tokenData);

        // Stockage du refresh_token et expiresIn en localStorage (simple, à adapter pour prod)
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('token_expiresIn', expiresIn.toString());

        navigate('/parametre');
      } else {
        setError('Échec de l\'authentification');
      }
    } catch (err: any) {
      console.error('Erreur API:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Connexion
        </h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Mot de passe
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 pr-10 border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );

}

export default LoginPage;