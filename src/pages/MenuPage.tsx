import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";

const MenuPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-gray-800">Menu Principal</h1>
      <p className="text-gray-500 text-sm">Que souhaitez-vous faire ?</p>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        {/* Bouton vers la page d'insertion info client */}
        <button
          onClick={() => navigate("/client-info")}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition"
        >
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <UserCircle size={28} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">Informations Client</p>
            <p className="text-xs text-gray-500">Compléter ou modifier votre profil</p>
          </div>
        </button>

        {/* Bouton retour login */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-red-400 transition"
        >
          <div className="bg-red-100 text-red-500 p-3 rounded-xl">
            <LogOut size={28} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">Se déconnecter</p>
            <p className="text-xs text-gray-500">Retour à la page de connexion</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MenuPage;