import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ClientInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/menu")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Retour au menu</span>
        </button>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Informations Client
          </h1>

          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Prénom", placeholder: "Jean" },
              { label: "Nom", placeholder: "Dupont" },
              { label: "Email", placeholder: "jean@example.com" },
              { label: "Téléphone", placeholder: "+1 234 567 890" },
              { label: "Adresse", placeholder: "123 rue Principale" },
              { label: "Ville", placeholder: "Montréal" },
              { label: "Code postal", placeholder: "H1A 1A1" },
              { label: "Pays", placeholder: "Canada" },
            ].map(({ label, placeholder }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoPage;