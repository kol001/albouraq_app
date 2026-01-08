import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import LoginPage from "./pages/LoginPage";
import ListeParametre from "./pages/ListeParametre";
import ProtectedRoute from "./pages/ProtectedRoute";
import ParametreLayout from "./layouts/ListeParametreLayout";
import { parametresRoutes } from "./routes/Parametres.routes";
import { frontOfficeRoutes } from "./routes/FrontOffice.routes"; // Nouveau import

export function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const defaultRedirect = isAuthenticated
    ? user?.profiles?.some((p: any) => p.profile?.profil === 'ADMIN')
      ? "/parametre"
      : "/"
    : "/login";

  return (
    <BrowserRouter>
      <Routes>
        {/* FRONT OFFICE : Protégé, avec layout (si tu en veux un spécifique plus tard) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<ParametreLayout />}> {/* Tu pourras créer un FrontLayout plus tard si besoin */}
            {frontOfficeRoutes()}
          </Route>
        </Route>

        {/* Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultRedirect} replace /> : <LoginPage />}
        />

        {/* BACK OFFICE : Protégé + Layout */}
        <Route path="/parametre" element={<ProtectedRoute />}>
          <Route element={<ParametreLayout />}>
            <Route index element={<ListeParametre />} />
            {parametresRoutes()}
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}