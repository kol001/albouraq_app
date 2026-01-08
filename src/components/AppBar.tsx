import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHelpCircle, FiBell, FiUser, FiChevronDown, FiLogOut, FiX } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { logout } from '../app/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import logo from '../assets/logo.jpg';

const useAppDispatch = () => useDispatch<AppDispatch>();

export default function AppBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const paths = pathname.split("/").filter(Boolean);

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false); // Nouveau état pour le modal
  const userMenuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Récupération de l'utilisateur depuis Redux
  const user = useSelector((state: RootState) => state.auth.user);

  const segmentLabels: Record<string, string> = {
    "parametre": "Paramètres",
    "client-facture": "Clients Facturés",
    "client-beneficiaire": "Bénéficiaires",
    "profil": "Profils",
    "utilisateur": "Utilisateurs",
    "nouveau": "Création"
  };

  // Fermeture menu utilisateur au clic dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpenProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Calcul des profils actifs et modules accessibles
  const profilsActifs = user?.profiles
    ?.filter(p => p.status === 'ACTIF')
    ?.map(p => p.profile.profil) || [];

  const modulesAccessibles = user?.profiles
    ?.filter(p => p.status === 'ACTIF')
    ?.flatMap(p => p.profile.modules.map(m => m.module.nom)) || [];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8">
      <div className="h-16 flex items-center justify-between">
        {/* LEFT : Logo + Breadcrumb */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform overflow-hidden shadow-md">
              <img src={logo} alt="Logo Al Bouraq" className="h-full w-full object-cover rounded-md" />
            </div>
            <span className="font-bold text-gray-700 tracking-tight hidden sm:block">
              AL BOURAQ Travel
            </span>
          </Link>

          <nav className="hidden md:flex items-center text-sm font-medium">
            <div className="h-4 w-px bg-gray-200 mx-2" />
            <div className="flex items-center gap-2 text-gray-400">
              {paths.map((p, index) => {
                const isId = p.length > 15 || (/\d/.test(p) && p.length > 10);
                const displayLabel = isId
                  ? "Fiche Détails"
                  : (segmentLabels[p] || p.replace(/-/g, ' ').charAt(0).toUpperCase() + p.replace(/-/g, ' ').slice(1));

                const url = `/${paths.slice(0, index + 1).join("/")}`;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Link
                      to={url}
                      className={`capitalize transition-colors ${
                        index === paths.length - 1
                          ? "text-indigo-600 font-bold"
                          : "hover:text-gray-600"
                      }`}
                    >
                      {displayLabel}
                    </Link>
                    {index < paths.length - 1 && <span className="text-gray-300"> / </span>}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* RIGHT : Icons & User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button className="p-2 text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all">
              <FiHelpCircle size={18} />
            </button>
            <button className="relative p-2 text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all">
              <FiBell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </button>
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1" />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-3 p-1 pr-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
            >
              <div className="h-9 w-9 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                {/* {user ? user.prenom[0].toUpperCase() : 'A'} */}
                A
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none text-left">
                <span className="text-sm font-bold text-gray-800 italic">
                  {user ? `${user.prenom} ${user.nom}` : 'Administrateur'}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Online</span>
              </div>
              <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${openUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-5 py-3 border-b border-gray-50">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Mon Compte</p>
                </div>

                {/* Bouton Profil → ouvre le modal */}
                <button
                  onClick={() => {
                    setOpenProfileModal(true);
                    setOpenUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                >
                  <FiUser className="text-lg" /> Mon Profil
                </button>

                <div className="h-px bg-gray-50 mx-4 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <FiLogOut className="text-lg" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === MODAL PROFIL === */}
      {openProfileModal && user && (
        <div className="fixed top-100 inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* Header du modal */}
            <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white p-6 relative">
              <button
                onClick={() => setOpenProfileModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <FiX size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl font-black text-indigo-600 shadow-lg">
                  {user.prenom[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{user.prenom} {user.nom}</h2>
                  <p className="text-sm opacity-90">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 uppercase text-xs tracking-wider">Pseudo</p>
                  <p className="font-bold text-gray-800">{user.pseudo}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase text-xs tracking-wider">Département</p>
                  <p className="font-bold text-gray-800">{user.departement}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 uppercase text-xs tracking-wider">Statut du compte</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                    user.status === 'ACTIF'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>

              {profilsActifs.length > 0 && (
                <div>
                  <p className="text-gray-400 uppercase text-xs tracking-wider mb-2">Profils actifs</p>
                  <div className="flex flex-wrap gap-2">
                    {profilsActifs.map((profil, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                        {profil}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {modulesAccessibles.length > 0 && (
                <div>
                  <p className="text-gray-400 uppercase text-xs tracking-wider mb-2">Modules accessibles</p>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(modulesAccessibles)].map((module, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setOpenProfileModal(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}