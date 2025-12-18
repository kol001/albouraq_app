import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPrivilege } from '../../app/privilegesSlice';
import type { RootState, AppDispatch } from '../../app/store';
// import type { Privilege } from '../../app/privilegesSlice';

const useAppDispatch = () => useDispatch<AppDispatch>();

const PrivilegeComponent = () => {
  const dispatch = useAppDispatch();
  const { data: privileges, loading, error: globalError } = useSelector((state: RootState) => state.privileges);
  // const { token } = useSelector((state: RootState) => state.auth);

  // États locaux
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [privilege, setPrivilege] = useState('');
  const [fonctionnalite, setFonctionnalite] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privilege || !fonctionnalite) {
      setSubmitError('Tous les champs sont requis');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');

    const result = await dispatch(createPrivilege({ privilege, fonctionnalite }));
    
    if (createPrivilege.fulfilled.match(result)) {
      setSubmitSuccess('Privilège créé avec succès !');
      setTimeout(() => {
        setPrivilege('');
        setFonctionnalite('');
        setIsModalOpen(false); // Ferme la modal après succès
        setSubmitSuccess('');
      }, 1500);
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header avec bouton à droite */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Paramétrage privilèges</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nouveau Privilège
        </button>
      </div>

      {/* État de chargement ou d'erreur global */}
      {loading && privileges.length === 0 && <p className="text-center py-10">Chargement...</p>}
      {globalError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{globalError}</div>}

      {/* Liste / Tableau avec un design épuré */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Privilège</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fonctionnalité</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autorisations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {privileges.map((p) => (
              <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                    {p.privilege}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {p.fonctionnalite}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {p.autorisations.map((aut: any) => (
                      <span key={aut.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                        {aut.nom}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (Pop-up) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Ajouter un privilège</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Privilège</label>
                  <input 
                    type="text" 
                    placeholder="ex: LECTURE_TOTALE" 
                    value={privilege} 
                    onChange={(e) => setPrivilege(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalité</label>
                  <input 
                    type="text" 
                    placeholder="ex: Gestion des utilisateurs" 
                    value={fonctionnalite} 
                    onChange={(e) => setFonctionnalite(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required 
                  />
                </div>
              </div>

              {submitError && <p className="text-red-500 text-sm mt-4 text-center">{submitError}</p>}
              {submitSuccess && <p className="text-green-500 text-sm mt-4 text-center font-medium">{submitSuccess}</p>}

              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Création...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivilegeComponent;