import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createProfile, 
  fetchProfiles, 
  activateProfile, 
  deactivateProfile, 
  deleteProfile, 
  addAutorisationToProfile, 
  updateProfile 
} from '../../app/profilesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Profile } from '../../app/profilesSlice';
import AuditModal from '../../components/AuditModal';
import { 
  FiShield, FiPlus, FiX, FiCheckCircle, 
  FiAlertCircle, FiLoader, FiUsers, FiLock 
} from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ProfileComponent = () => {
  const dispatch = useAppDispatch();
  const { data: profiles, error: globalError } = useSelector((state: RootState) => state.profiles);
  const { data: autorisations } = useSelector((state: RootState) => state.autorisations);

  // États UI
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'auth' | 'edit'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Form states
  const [profil, setProfil] = useState('');
  const [status, setStatus] = useState('ACTIF');
  const [selectedProfileIdAdd, setSelectedProfileIdAdd] = useState('');
  const [selectedAutorisationIdAdd, setSelectedAutorisationIdAdd] = useState('');
  const [editProfil, setEditProfil] = useState('');
  const [editingProfileId, setEditingProfileId] = useState('');

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setMessage({ text: '', isError: false });
    setEditingProfileId('');
    setProfil('');
    setEditProfil('');
  };

  const handleAction = async (actionFn: any, payload: any) => {
    setIsSubmitting(true);
    await dispatch(actionFn(payload));
    setIsSubmitting(false);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(createProfile({ profil, status }));
    if (createProfile.fulfilled.match(result)) {
      setMessage({ text: 'Profil créé avec succès !', isError: false });
      setTimeout(() => {
        dispatch(fetchProfiles());
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la création', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(updateProfile({ id: editingProfileId, profil: editProfil }));
    if (updateProfile.fulfilled.match(result)) {
      setMessage({ text: 'Profil mis à jour !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la modification', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleSubmitAddAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(addAutorisationToProfile({ 
      profileId: selectedProfileIdAdd, 
      autorisationId: selectedAutorisationIdAdd 
    }));
    if (addAutorisationToProfile.fulfilled.match(result)) {
      setMessage({ text: 'Autorisation ajoutée !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: 'Erreur lors de l\'ajout', isError: true });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay global */}
      {isSubmitting && activeModal === 'none' && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mise à jour...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiShield className="text-indigo-600" /> Profils & Rôles
          </h2>
          <p className="text-gray-500 font-medium italic">Gérez les accès et les permissions de sécurité du système.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveModal('auth')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
          >
            <FiLock size={18} /> Gérer Autorisations
          </button>
          <button
            onClick={() => setActiveModal('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <FiPlus size={20} /> Nouveau Profil
          </button>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold italic">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU PRINCIPAL */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Profil</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-left">Autorisations</th>
                <th className="px-6 py-5 text-left">Utilisateurs</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white font-medium">
              {profiles.map((profile: Profile) => (
                <tr key={profile.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{profile.profil}</div>
                    {/* <div className="text-[10px] text-gray-400 font-mono">ID: {profile.id.slice(0,8)}...</div> */}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      profile.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${profile.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {profile.status}
                    </span>
                  </td>
                  {/* Remplacez la cellule des autorisations par celle-ci */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {(profile.autorisations || []).length > 0 ? (
                        profile.autorisations.map((aut) => (
                          <span 
                            key={aut.id} 
                            className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter whitespace-nowrap"
                          >
                            {aut.nom}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">Aucune</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FiUsers className="text-gray-300" />
                      <span className="font-black">{(profile.users || []).length}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                      <button onClick={() => { setEditingProfileId(profile.id); setEditProfil(profile.profil); setActiveModal('edit'); }} className="text-blue-600 hover:underline">Modifier</button>
                      {profile.status !== 'ACTIF' ? (
                        <button onClick={() => handleAction(activateProfile, { profileId: profile.id })} className="text-green-600 hover:underline">Activer</button>
                      ) : (
                        <button onClick={() => handleAction(deactivateProfile, { profileId: profile.id })} className="text-amber-600 hover:underline">Désactiver</button>
                      )}
                      <button onClick={() => { setAuditEntityId(profile.id); setAuditEntityName(profile.profil); }} className="text-purple-600 hover:underline">Historique</button>
                      <button onClick={() => window.confirm('Supprimer ?') && handleAction(deleteProfile, { profileId: profile.id })} className="text-red-500 hover:underline border-l border-gray-100 pl-4">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RÉPARTITION UTILISATEURS */}
      <div className="mt-16 bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><FiUsers size={24}/></div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Membres par Profil</h3>
            <p className="text-sm text-gray-500 italic">Liste détaillée des utilisateurs affectés à chaque rôle.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={`card-${profile.id}`} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{profile.profil}</span>
                <span className="text-xs font-bold text-gray-400">{(profile.users || []).length} membre(s)</span>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {profile.users && profile.users.length > 0 ? (
                  profile.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 py-1">
                      <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-gray-100 uppercase">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-700">{user.prenom} {user.nom}</span>
                        <span className="text-[10px] text-gray-400 font-medium italic truncate w-32">{user.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-300 italic font-medium py-2">Aucun utilisateur rattaché</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS UNIFIÉS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {activeModal === 'create' ? 'Nouveau Profil' : activeModal === 'edit' ? 'Modifier Profil' : 'Autorisations'}
              </h3>
              <button onClick={closeModals} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <form 
              onSubmit={activeModal === 'create' ? handleSubmitCreate : activeModal === 'edit' ? handleSubmitEdit : handleSubmitAddAuth} 
              className="p-8 space-y-6"
            >
              {activeModal === 'auth' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Profil cible</label>
                    <select value={selectedProfileIdAdd} onChange={(e) => setSelectedProfileIdAdd(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" required>
                      <option value="">Sélectionner un profil</option>
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.profil}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Autorisation</label>
                    <select value={selectedAutorisationIdAdd} onChange={(e) => setSelectedAutorisationIdAdd(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all" required>
                      <option value="">Sélectionner une autorisation</option>
                      {autorisations.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom du profil</label>
                    <input 
                      type="text" 
                      placeholder="ex: ADMINISTRATEUR" 
                      value={activeModal === 'create' ? profil : editProfil} 
                      onChange={(e) => activeModal === 'create' ? setProfil(e.target.value) : setEditProfil(e.target.value)} 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase" 
                      required 
                    />
                  </div>
                  {activeModal === 'create' && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Status initial</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['ACTIF', 'INACTIF'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${
                              status === s 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                              : 'bg-white border-gray-100 text-gray-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-xs ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />} {message.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-400">Annuler</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`flex-1 py-4 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 ${
                    activeModal === 'auth' ? 'bg-amber-600 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'
                  }`}
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Confirmer'}
                </button>
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
        onClose={() => setAuditEntityId(null)}
      />
    </div>
  );
};

export default ProfileComponent;