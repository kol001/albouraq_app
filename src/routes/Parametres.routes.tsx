import { Route } from "react-router-dom";

import Utilisateur from "../pages/parametres/Utilisateur";
import Profile from "../pages/parametres/Profil";
import Autorisation from "../pages/parametres/Autorisation";
import TypeTransaction from "../pages/parametres/Type_transaction";
import Transaction from "../pages/parametres/Transaction";
import Privilege from "../pages/parametres/Privilege";


export function parametresRoutes() {
  return [
    <Route key="privilege" path="privilege" element={<Privilege />} />,
    <Route key="utilisateur" path="utilisateur" element={<Utilisateur />} />,
    <Route key="profil" path="profil" element={<Profile />} />,
    <Route key="autorisation" path="autorisation" element={<Autorisation />} />,
    <Route key="type-transaction" path="type-transaction" element={<TypeTransaction />} />,
    <Route key="transaction" path="transaction" element={<Transaction />} />,
  ];
}
