import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHelpCircle, FiBell, FiUser, FiChevronDown, FiLogOut, FiSettings } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { logout } from '../app/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';

const useAppDispatch = () => useDispatch<AppDispatch>();

export default function AppBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const paths = pathname.split("/").filter(Boolean);
  
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8">
      <div className="h-16 flex items-center justify-between">

        {/* LEFT : Logo + Breadcrumb */}
        <div className="flex items-center gap-8">
          {/* Logo avec style */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg group-hover:rotate-6 transition-transform">
              <span className="font-black text-xl italic text-white">B</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight hidden sm:block">
              Al bouraq
            </span>
          </Link>

          {/* Breadcrumb amélioré */}
          <nav className="hidden md:flex items-center text-sm font-medium">
            <div className="h-4 w-px bg-gray-200 mx-2" /> {/* Séparateur vertical */}
            <div className="flex items-center gap-2 text-gray-400">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
              {paths.map((p, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-300">/</span>
                  <span className={`capitalize ${index === paths.length - 1 ? "text-indigo-600 font-semibold" : "hover:text-gray-600 transition-colors"}`}>
                    {p.replace(/-/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* RIGHT : Icons & User */}
        <div className="flex items-center gap-3">
          
          {/* Aide & Notifications */}
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
              <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                JD
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none text-left">
                <span className="text-sm font-bold text-gray-800 italic">Administrateur</span>
                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Online</span>
              </div>
              <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${openUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Mon Compte</p>
                </div>
                
                <Link
                  to="/profil"
                  onClick={() => setOpenUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FiUser className="text-lg" /> Profil
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setOpenUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FiSettings className="text-lg" /> Paramètres
                </Link>

                <div className="h-px bg-gray-50 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <FiLogOut className="text-lg" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}