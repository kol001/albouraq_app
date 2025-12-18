import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";

import LoginPage from "./pages/LoginPage";
import ListeParametre from "./pages/ListeParametre";
import ProtectedRoute from "./pages/ProtectedRoute";
import ParametreLayout from "./layouts/ListeParametreLayout";

import { parametresRoutes } from "./routes/Parametres.routes";

export function App() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/parametre" replace /> : <LoginPage />
          }
        />

        {/* parametre PROTÉGÉ */}
        <Route
          path="/parametre"
          element={
            <ProtectedRoute>
              <ParametreLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ListeParametre />} />

          {/* ROUTES PARAMÈTRES */}
          {parametresRoutes()}
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/parametre" : "/login"}
              replace
            />
          }
        />
        <Route path="/test" element={<div>TEST OK</div>} />
      </Routes>
    </BrowserRouter>
  );
}
