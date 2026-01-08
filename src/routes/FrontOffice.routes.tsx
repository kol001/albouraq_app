import { Route } from "react-router-dom";
import HomePage from "../pages/front_office/HomePage";
import DossierCommunForm from "../pages/front_office/dossiers-communs/DossierCommunForm";
import DossierCommunDetail from "../pages/front_office/dossiers-communs/DossierCommunDetail";

// Tu pourras ajouter d'autres pages plus tard (ex: TransactionForm, etc.)
export function frontOfficeRoutes() {
  return (
    <>
      {/* Page d'accueil du front */}
      <Route index element={<HomePage />} />

      {/* Création d'un nouveau dossier commun */}
      <Route path="dossiers-communs/nouveau" element={<DossierCommunForm />} />

      {/* Détail d'un dossier commun existant */}
      <Route path="dossiers-communs/:id" element={<DossierCommunDetail />} />

      {/* Tu pourras ajouter d'autres routes ici plus tard */}
      {/* Exemple futur : */}
      {/* <Route path="dossiers-communs/:id/transaction/nouveau" element={<TransactionForm />} /> */}
    </>
  );
}