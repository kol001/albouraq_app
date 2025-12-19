import { Route } from "react-router-dom";

import Utilisateur from "../pages/parametres/Utilisateur";
import Profile from "../pages/parametres/Profil";
import Autorisation from "../pages/parametres/Autorisation";
import TypeTransaction from "../pages/parametres/Type_transaction";
import Transaction from "../pages/parametres/Transaction";
import Privilege from "../pages/parametres/Privilege";
import Module from "../pages/parametres/Module";
import Commission from "../pages/parametres/Commission";
import Numerotation from "../pages/parametres/Numerotation";
import Modele from "../pages/parametres/Modele";
import Miles from "../pages/parametres/Miles";

export function parametresRoutes() {
  return [
    <Route key="privilege" path="privilege" element={<Privilege />} />,
    <Route key="utilisateur" path="utilisateur" element={<Utilisateur />} />,
    <Route key="profil" path="profil" element={<Profile />} />,
    <Route key="autorisation" path="autorisation" element={<Autorisation />} />,
    <Route key="type-transaction" path="type-transaction" element={<TypeTransaction />} />,
    <Route key="transaction" path="transaction" element={<Transaction />} />,
    <Route key="module" path="module" element={<Module />} />,
    <Route key="commission" path="commission" element={<Commission />} />,
    <Route key="numerotation" path="numerotation" element={<Numerotation />} />,
    <Route key="modele" path="modele" element={<Modele />} />,
    <Route key="miles" path="miles" element={<Miles />} />,
  ];
}
