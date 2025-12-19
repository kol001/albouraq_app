import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile, fetchProfiles, activateProfile, deactivateProfile, deleteProfile, addAutorisationToProfile, updateProfile } from '../../app/profilesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Profile } from '../../app/profilesSlice';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ProfileComponent = () => {
  const dispatch = useAppDispatch();
  const { data: profiles, loading, error: globalError } = useSelector((state: RootState) => state.profiles);
  const { data: autorisations } = useSelector((state: RootState) => state.autorisations);

  // États modals
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'auth' | 'edit'>('none');

  // Création
  const [profil, setProfil] = useState('');
  const [status, setStatus] = useState('ACTIF');

  // Ajout autorisation
  const [selectedProfileIdAdd, setSelectedProfileIdAdd] = useState('');
  const [selectedAutorisationIdAdd, setSelectedAutorisationIdAdd] = useState('');

  // Édition
  const [editProfil, setEditProfil] = useState('');
  const [editingProfileId, setEditingProfileId] = useState('');

  // Message
  const [message, setMessage] = useState({ text: '', isError: false });

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setMessage({ text: '', isError: false });
    setEditingProfileId('');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createProfile({ profil, status }));
    if (createProfile.fulfilled.match(result)) {
      setMessage({ text: 'Profil créé avec succès !', isError: false });
      setTimeout(() => {
        setProfil('');
        setStatus('ACTIF');
        dispatch(fetchProfiles());
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la création', isError: true });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileId || !editProfil) {
      setMessage({ text: 'Nom du profil requis', isError: true });
      return;
    }
    const result = await dispatch(updateProfile({ id: editingProfileId, profil: editProfil }));
    if (updateProfile.fulfilled.match(result)) {
      setMessage({ text: 'Profil modifié avec succès !', isError: false });
      setTimeout(() => {
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la modification', isError: true });
    }
  };

  const handleSubmitAddAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(addAutorisationToProfile({ profileId: selectedProfileIdAdd, autorisationId: selectedAutorisationIdAdd }));
    if (addAutorisationToProfile.fulfilled.match(result)) {
      setMessage({ text: 'Autorisation ajoutée !', isError: false });
      setTimeout(() => {
        setSelectedProfileIdAdd('');
        setSelectedAutorisationIdAdd('');
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de l\'ajout', isError: true });
    }
  };

  const openEdit = (profile: Profile) => {
    setActiveModal('edit');
    setEditingProfileId(profile.id);
    setEditProfil(profile.profil);
  };

  const openAudit = (profile: Profile) => {
    setAuditEntityId(profile.id);
    setAuditEntityName(profile.profil);
  };

  const closeAudit = () => {
    setAuditEntityId(null);
    setAuditEntityName('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Paramétrage Profils</h2>
          <p className="text-sm text-gray-500">Gérez les rôles et les permissions associées.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveModal('auth')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2"
          >
            🛡️ Gérer Autorisations
          </button>
          <button
            onClick={() => setActiveModal('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
          >
            + Nouveau Profil
          </button>
        </div>
      </div>

      {globalError && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100">{globalError}</div>}

      {/* TABLEAU PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Profil</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Autorisations</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateurs</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {profiles.map((profile: Profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 uppercase tracking-tight">{profile.profil}</div>
                    <div className="text-[10px] text-gray-400">Créé le {new Date(profile.dateCreation).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      profile.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {profile.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(profile.autorisations || []).slice(0, 3).map(aut => (
                        <span key={aut.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          {aut.nom}
                        </span>
                      ))}
                      {(profile.autorisations || []).length > 3 && (
                        <span className="text-[10px] text-gray-400">+{profile.autorisations.length - 3} plus</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-bold">{(profile.users || []).length}</span> membre(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(profile)} className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Modifier</button>
                    {profile.status !== 'ACTIF' ? (
                      <button onClick={() => dispatch(activateProfile({ profileId: profile.id }))} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase">Activer</button>
                    ) : (
                      <button onClick={() => dispatch(deactivateProfile({ profileId: profile.id }))} className="text-amber-600 hover:text-amber-800 text-xs font-bold uppercase">Désactiver</button>
                    )}
                    <button
                      onClick={() => openAudit(profile)}
                      className="text-purple-600 hover:text-purple-800 text-xs font-bold uppercase"
                    >
                      Historique
                    </button>
                    <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteProfile({ profileId: profile.id }))} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RÉCAP UTILISATEURS PAR PROFIL (inchangé) */}
      <div className="mt-12 mb-10">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Répartition des Utilisateurs par Profil</h3>
          <p className="text-sm text-gray-500">Liste exhaustive des membres rattachés à chaque rôle système.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Profil</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Membres rattachés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {profiles.map((profile: Profile) => (
                <tr key={`row-user-${profile.id}`} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold uppercase w-fit border border-indigo-100">
                        {profile.profil}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium pl-1">
                        {(profile.users || []).length} Utilisateur(s)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {profile.users && profile.users.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {profile.users.map((user) => (
                          <div key={user.id} className="flex items-center gap-3 group">
                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              {user.prenom.charAt(0)}{user.nom.charAt(0)}
                            </div>
                            <div className="flex flex-col leading-tight">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                                {user.prenom} {user.nom}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono italic">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 italic text-sm py-2">
                        <span className="text-lg">∅</span> Aucun utilisateur rattaché
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRÉATION */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Nouveau Profil</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du profil</label>
                <input type="text" placeholder="ex: ADMINISTRATEUR" value={profil} onChange={(e) => setProfil(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status initial</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="ACTIF">ACTIF</option>
                  <option value="INACTIF">INACTIF</option>
                </select>
              </div>
              {message.text && <p className={`text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Modifier le Profil</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du profil</label>
                <input
                  type="text"
                  placeholder="ex: MANAGER"
                  value={editProfil}
                  onChange={(e) => setEditProfil(e.target.value)}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {message.text && <p className={`text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT AUTORISATION */}
      {activeModal === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Ajouter une Autorisation</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitAddAuth} className="p-6 space-y-4">
              <select value={selectedProfileIdAdd} onChange={(e) => setSelectedProfileIdAdd(e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500" required>
                <option value="">Sélectionner un profil</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.profil}</option>)}
              </select>
              <select value={selectedAutorisationIdAdd} onChange={(e) => setSelectedAutorisationIdAdd(e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500" required>
                <option value="">Sélectionner une autorisation</option>
                {autorisations.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              {message.text && <p className={`text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-semibold shadow-lg">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal
        entity="PROFILE"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={closeAudit}
      />
    </div>
  );
};

export default ProfileComponent;