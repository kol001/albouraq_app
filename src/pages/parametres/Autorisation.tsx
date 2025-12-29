import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAutorisations } from '../../app/autorisationsSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const useAppDispatch = () => useDispatch<AppDispatch>();

const AutorisationPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: autorisations, loading,} = useSelector((state: RootState) => state.autorisations);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);

  const [activeTab, setActiveTab] = useState<'modules' | 'users'>('modules');

  // Dans AutorisationPage.tsx
  useEffect(() => {
    // On ne lance le chargement QUE si on n'a pas encore de données
    if (autorisations.length === 0 && !loading) {
      dispatch(fetchAutorisations());
    }
  }, [dispatch, autorisations.length, loading]);

  // On récupère le PREMIER élément du tableau pour le panneau
  const firstAuth = autorisations.length > 0 ? autorisations[0] : null;

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Retour et Titre */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
          <FiArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Paramètres d'Autorisation</h2>
      </div>

      {/* PANNEAU : Première Autorisation (Design Simple) */}
      {!loading && firstAuth && (
        <div className="mb-8 bg-white border border-gray-200  p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Autorisation enregistrée</p>
              <h3 className="text-lg font-bold text-gray-900">N° {firstAuth.numero}</h3>
              <p className="text-sm text-gray-500">
                date d'activation {new Date(firstAuth.date).toLocaleDateString('fr-FR')} à {new Date(firstAuth.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-sm text-gray-500">
                Date de desactivation {firstAuth.dateDesactivation ? new Date(firstAuth.dateDesactivation).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  }): ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              firstAuth.status === 'CREER' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600'
            }`}>
              Statut : {firstAuth.status}
            </span>
          </div>
        </div>
      )}

      {/* SÉLECTEUR DE VUE (Design Onglets simple) */}
      <div className="flex gap-6 mb-0">
        <button
          onClick={() => setActiveTab('modules')}
          className={`p-3 mb-5 bg-white text-sm font-bold transition-all rounded-tr-md border-b-2 ${
            activeTab === 'modules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Profils Modules
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`p-3 mb-5 bg-white text-sm font-bold transition-all rounded-tr-md border-b-2 ${
            activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Profils Utilisateurs
        </button>
      </div>

      {/* TABLEAU DES PROFILS */}
      <div className="bg-white  border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 text-indigo-600">Nom du profil</th>
              {activeTab === 'modules' ? (
                <>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Fonctionnalité</th>
                  <th className="px-6 py-4">Privilèges</th>
                </>
              ) : (
                <th className="px-6 py-4">Utilisateurs</th>
              )}
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profiles.map((prof) => (
              <tr key={prof.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-800 text-sm">{prof.profil}</span>
                </td>

                {/* Mode Modules */}
                {activeTab === 'modules' && (
                  <>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {prof.modules?.map((m) => (
                          <span key={m.module.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                            {m.module.nom}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {prof.modules?.map(m => m.module.description).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {prof.privileges?.map((p) => (
                          <span key={p.privilege.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {p.privilege.privilege}
                          </span>
                        ))}
                      </div>
                    </td>
                  </>
                )}

                {/* Mode Utilisateurs */}
                {activeTab === 'users' && (
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {prof.users?.map((u) => (
                        <span key={u.user.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                          {u.user.nom} {u.user.prenom}
                        </span>
                      ))}
                    </div>
                  </td>
                )}

                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/parametre/profil/${prof.id}`)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    MODIFIER
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">
            CHARGEMENT DES DONNÉES...
          </div>
        )}
      </div>
    </div>
  );
};

export default AutorisationPage;