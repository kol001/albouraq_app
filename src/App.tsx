import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";

import LoginPage from "./pages/LoginPage";
import ListeParametre from "./pages/ListeParametre";
import ProtectedRoute from "./pages/ProtectedRoute";
import DashboardLayout from "./layouts/ListeParametreLayout";

import { ParametresRoutes } from "./routes/parametres.routes";

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
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        {/* DASHBOARD PROTÉGÉ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ListeParametre />} />

          {/* ROUTES PARAMÈTRES */}
          <ParametresRoutes />
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
