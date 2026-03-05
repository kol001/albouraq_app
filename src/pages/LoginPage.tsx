import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Portail Client</h1>
        <p className="text-gray-500 text-sm mb-8">Bienvenue, veuillez vous connecter</p>

        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bouton simple de redirection sans vraie auth */}
        <button
          onClick={() => navigate("/menu")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
};

export default LoginPage;