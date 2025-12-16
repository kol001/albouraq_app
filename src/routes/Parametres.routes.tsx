import { Route } from "react-router-dom";

import Utilisateur from "../pages/parametres/Utilisateur";
import Profil from "../pages/parametres/profil";
import Autorisation from "../pages/parametres/autorisation";
import TypeTransaction from "../pages/parametres/type_transaction";
import Transaction from "../pages/parametres/Transaction";

export function parametresRoutes() {
  return [
    <Route key="utilisateur" path="utilisateur" element={<Utilisateur />} />,
    <Route key="profil" path="profil" element={<Profil />} />,
    <Route key="autorisation" path="autorisation" element={<Autorisation />} />,
    <Route key="type-transaction" path="type-transaction" element={<TypeTransaction />} />,
    <Route key="transaction" path="transaction" element={<Transaction />} />,
  ];
}
