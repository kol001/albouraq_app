import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../service/Axios';
import { FiEye, FiEyeOff, FiLoader, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const SLIDES = [
  {
    title: "Bienvenu",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    title: "Explorez le Monde",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
  },
  {
    title: "Gestion Simplifiée",
    description: "Sunt in culpa qui officia deserunt mollit anim id est laborum. Nous vous accompagnons dans chaque étape de votre voyage professionnel."
  }
];

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Slider Automatique
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { email, motDePasse: password });
      if (response.data.success) {
        const { access_token, refresh_token, expiresIn } = response.data.data;
        login({ token: access_token, user: { id: 'unknown', email } });
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('token_expiresIn', expiresIn.toString());
        navigate('/parametre');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      
      {/* IMAGE DE FOND AVEC OVERLAY SOMBRE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" 
          alt="Nature"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 shadow-inner"></div>
      </div>

      {/* HEADER : LOGO & BOUTON EXTERNE */}
      <header className="relative z-20 flex justify-between items-center p-8 lg:px-16">
        <h1 className="text-white text-xl font-bold tracking-tight">Logo Al Bouraq</h1>
        <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all text-sm font-medium">
          Allez vers le site web <FiArrowRight className="bg-white/20 rounded-full p-1" size={20} />
        </button>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-8 lg:px-24 pb-20">
        
        {/* GAUCHE : SLIDER TEXTE */}
        <div className="w-full lg:w-1/2 text-white mb-12 lg:mb-0 lg:pr-12">
          <div key={currentSlide} className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-5xl font-bold mb-6">{SLIDES[currentSlide].title}</h2>
            <p className="text-lg leading-relaxed opacity-90 max-w-lg">
              {SLIDES[currentSlide].description}
            </p>
          </div>
          
          {/* Indicateurs du Slider (Petits points) */}
          <div className="flex gap-3 mt-10">
            {SLIDES.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* DROITE : FORMULAIRE FLOTTANT */}
        <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-14 animate-in zoom-in duration-500">
          <div className="mb-10">
            <h3 className="text-3xl font-medium text-gray-800 mb-4">Bonjour,</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-all"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de Pass</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-xs text-gray-400 hover:underline font-medium">Mots de pass oublier ?</button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex justify-center items-center"
            >
              {isLoading ? <FiLoader className="animate-spin text-xl" /> : "Se Connecter"}
            </button>
          </form>

          {/* DIVISEUR SUPPORT */}
          <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-300 uppercase tracking-widest font-bold">Vous Voulez contactez le support</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* BOUTON WHATSAPP */}
          <button className="w-full border border-gray-200 text-gray-400 py-3 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-medium text-sm">
            <FaWhatsapp size={20} className="text-green-500" /> Whatsapp
          </button>
        </div>
      </main>

      {/* FOOTER COLLÉ EN BAS */}
      <footer className="relative z-20 px-16 py-8 text-white/50 text-[10px] uppercase tracking-widest flex justify-between">
        <p>© 2025 Al Bouraq Voyage • All Rights Reserved</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;