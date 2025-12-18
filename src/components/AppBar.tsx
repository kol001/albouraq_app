import { Link, useLocation } from "react-router-dom";
import {
  FiHelpCircle,
  FiBell,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { logout } from '../app/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import {  useNavigate } from 'react-router-dom';

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
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setOpenUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction déconnexion
    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
    };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm px-6">
      <div className="h-14 flex items-center justify-between">

        {/* LEFT : Logo + Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {/* <img src="/logo.png" alt="Logo" className="h-8" /> */}
            <span className="font-semibold text-gray-800">Logo Albouraq</span>
          </Link>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center text-sm text-gray-500 gap-1">
            {paths.map((p, index) => (
              <span key={index} className="capitalize">
                {p}
                {index < paths.length - 1 && " / "}
              </span>
            ))}
          </nav>
        </div>

        {/* RIGHT : Icons */}
        <div className="flex items-center gap-4">

          {/* Help */}
          <button className="text-gray-600 hover:text-blue-600 transition">
            <FiHelpCircle size={20} />
          </button>

          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-blue-600 transition">
            <FiBell size={20} />
            {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              3
            </span> */}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
            >
              <FiUser size={20} />
              <FiChevronDown size={14} />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md">
                <Link
                  to="/profil"
                  onClick={() => setOpenUserMenu(false)}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profil
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
