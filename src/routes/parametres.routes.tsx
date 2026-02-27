import { Route } from "react-router-dom";

// pages paramètres
import Utilisateur from "../pages/parametres/Utilisateur";
import Profil from "../pages/parametres/profil";
import Autorisation from "../pages/parametres/autorisation";
import TypeTransaction from "../pages/parametres/type_transaction";

export const ParametresRoutes = () => {
  return (
    <Route path="parametres">
      <Route path="utilisateur" element={<Utilisateur />} />
      <Route path="profil" element={<Profil />} />
      <Route path="autorisation" element={<Autorisation />} />
      <Route path="type-transaction" element={<TypeTransaction/>} />

      {/* ajoute ici les autres paramètres */}
    </Route>
  );
};
