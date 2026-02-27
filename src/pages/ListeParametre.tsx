import { Link } from "react-router-dom";
import { PARAMETRES } from "../constants/parametres";

function ListeParametre() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Liste des paramètres
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PARAMETRES.map((item) => (
          <Link
            key={item.path}
            to={`/listeparametre/parametres/${item.path}`}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ListeParametre;
