import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function DossierCommunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 font-medium"
      >
        <FiArrowLeft size={20} />
        Retour
      </button>

      <h1 className="text-4xl font-black text-gray-900 mb-8">
        Dossier Commun N°{id}
      </h1>

      <div className="bg-white rounded-3xl shadow-lg p-10">
        <p className="text-gray-600 text-lg">Détail du dossier en cours...</p>
      </div>
    </div>
  );
}