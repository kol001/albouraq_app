import { Outlet } from 'react-router-dom';  // ← CRUCIAL : Importe Outlet

function ParametreLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Contenu principal : REND LES ENFANTS ! */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />  {/* ← ÇA : Injecte ListeParametre ou la page paramètre */}
      </main>
    </div>
  );
}

export default ParametreLayout;