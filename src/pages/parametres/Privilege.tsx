import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPrivilege, updatePrivilege, deletePrivilege, activatePrivilege, deactivatePrivilege, fetchAutorisationsByPrivilege } from '../../app/privilegesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Privilege, Autorisation } from '../../app/privilegesSlice';

const useAppDispatch = () => useDispatch<AppDispatch>();

const PrivilegeComponent = () => {
  const dispatch = useAppDispatch();
  const { data: privileges, loading, error: globalError } = useSelector((state: RootState) => state.privileges);

  // États création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [privilegeName, setPrivilegeName] = useState('');
  const [fonctionnalite, setFonctionnalite] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // États édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(null);
  const [editPrivilegeName, setEditPrivilegeName] = useState('');
  const [editFonctionnalite, setEditFonctionnalite] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Modal autorisations liées
  const [isAutorisationsModalOpen, setIsAutorisationsModalOpen] = useState(false);
  const [selectedPrivilegeAutorisations, setSelectedPrivilegeAutorisations] = useState<Autorisation[]>([]);
  const [selectedPrivilegeName, setSelectedPrivilegeName] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privilegeName || !fonctionnalite) {
      setCreateError('Tous les champs sont requis');
      return;
    }
    const result = await dispatch(createPrivilege({ privilege: privilegeName, fonctionnalite }));
    if (createPrivilege.fulfilled.match(result)) {
      setCreateSuccess('Privilège créé !');
      setTimeout(() => {
        setPrivilegeName('');
        setFonctionnalite('');
        setCreateSuccess('');
        setIsCreateModalOpen(false);
      }, 1500);
    } else {
      setCreateError('Erreur création');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrivilege || !editPrivilegeName || !editFonctionnalite) {
      setEditError('Tous les champs sont requis');
      return;
    }
    const result = await dispatch(updatePrivilege({
      id: editingPrivilege.id,
      privilege: editPrivilegeName,
      fonctionnalite: editFonctionnalite,
    }));
    if (updatePrivilege.fulfilled.match(result)) {
      setEditSuccess('Privilège modifié !');
      setTimeout(() => {
        setEditSuccess('');
        setIsEditModalOpen(false);
        setEditingPrivilege(null);
      }, 1500);
    } else {
      setEditError('Erreur modification');
    }
  };

  const openEdit = (p: Privilege) => {
    setEditingPrivilege(p);
    setEditPrivilegeName(p.privilege);
    setEditFonctionnalite(p.fonctionnalite);
    setIsEditModalOpen(true);
  };

  const openAutorisations = async (p: Privilege) => {
    const result = await dispatch(fetchAutorisationsByPrivilege({ id: p.id }));
    if (fetchAutorisationsByPrivilege.fulfilled.match(result)) {
      setSelectedPrivilegeAutorisations(result.payload.data);
      setSelectedPrivilegeName(p.privilege);
      setIsAutorisationsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer ce privilège ?')) {
      dispatch(deletePrivilege({ id }));
    }
  };

  const toggleStatus = (p: Privilege) => {
    if (p.status === 'ACTIF') {
      dispatch(deactivatePrivilege({ id: p.id }));
    } else {
      dispatch(activatePrivilege({ id: p.id }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Paramétrage privilèges</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nouveau Privilège
        </button>
      </div>

      {loading && <p className="text-center py-10">Chargement...</p>}
      {globalError && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{globalError}</div>}

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Privilège</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fonctionnalité</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autorisations</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.autorisations && Array.isArray(p.autorisations) && p.autorisations.length > 0 ? (
                          p.autorisations.map((aut: Autorisation) => (
                            <span key={aut.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                              {aut.nom}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Aucune autorisation</span>
                        )}
                      </div>
                    </td>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    p.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">
                    Modifier
                  </button>
                  <button onClick={() => toggleStatus(p)} className={`text-xs font-bold ${p.status === 'ACTIF' ? 'text-amber-600' : 'text-green-600'}`}>
                    {p.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => openAutorisations(p)} className="text-purple-600 hover:text-purple-800 text-xs font-bold">
                    Voir Autorisations
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-xs font-bold">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Ajouter un privilège</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Privilège</label>
                  <input
                    type="text"
                    placeholder="ex: LECTURE_TOTALE"
                    value={privilegeName}
                    onChange={(e) => setPrivilegeName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              {createError && <p className="text-red-500 text-sm mt-4 text-center">{createError}</p>}
              {createSuccess && <p className="text-green-500 text-sm mt-4 text-center font-medium">{createSuccess}</p>}
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm disabled:opacity-50 transition-colors">
                  {loading ? 'Création...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edition */}
      {isEditModalOpen && editingPrivilege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Modifier le privilège</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Privilège</label>
                  <input
                    type="text"
                    value={editPrivilegeName}
                    onChange={(e) => setEditPrivilegeName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalité</label>
                  <input
                    type="text"
                    value={editFonctionnalite}
                    onChange={(e) => setEditFonctionnalite(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              {editError && <p className="text-red-500 text-sm mt-4 text-center">{editError}</p>}
              {editSuccess && <p className="text-green-500 text-sm mt-4 text-center font-medium">{editSuccess}</p>}
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50 transition-colors">
                  {loading ? 'Modification...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Autorisations liées */}
      {isAutorisationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                Autorisations utilisant le privilège "{selectedPrivilegeName}"
              </h3>
              <button onClick={() => setIsAutorisationsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {selectedPrivilegeAutorisations.length === 0 ? (
                <p className="text-center text-gray-500">Aucune autorisation liée</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Module</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedPrivilegeAutorisations.map((aut) => (
                      <tr key={aut.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{aut.nom}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            aut.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {aut.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {aut.module ? aut.module.nom : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => setIsAutorisationsModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivilegeComponent;