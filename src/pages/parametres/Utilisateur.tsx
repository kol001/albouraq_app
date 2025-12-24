import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createUser, 
  assignProfileToUser, 
  activateUser, 
  deactivateUser, 
  deleteUser, 
  updateUser 
} from '../../app/usersSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { User } from '../../app/usersSlice';
import AuditModal from '../../components/AuditModal';
import { 
  FiUserPlus, FiX, FiCheckCircle, FiAlertCircle, 
  FiLoader, FiUserCheck, FiMail, FiMapPin, FiArrowLeft
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const useAppDispatch = () => useDispatch<AppDispatch>();

const Utilisateur = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: users, error: globalError } = useSelector((state: RootState) => state.users);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);

  // UI States
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'assign' | 'edit'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Form states (Création / Édition)
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [departement, setDepartement] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editingUserId, setEditingUserId] = useState('');

  // Assignation
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setMessage({ text: '', isError: false });
    setEditingUserId('');
    // Reset form fields
    setEmail(''); setMotDePasse(''); setNom(''); setPrenom(''); setPseudo(''); setDepartement('');
  };

  const handleAction = async (actionFn: any, payload: any) => {
    setIsSubmitting(true);
    await dispatch(actionFn(payload));
    setIsSubmitting(false);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(createUser({ email, motDePasse, nom, prenom, pseudo, departement }));
    if (createUser.fulfilled.match(result)) {
      setMessage({ text: 'Utilisateur créé avec succès !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la création', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setIsSubmitting(true);
    const result = await dispatch(updateUser({
      id: editingUserId, email, nom, prenom, pseudo, departement, status: editStatus,
    }));
    if (updateUser.fulfilled.match(result)) {
      setMessage({ text: 'Utilisateur mis à jour !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: 'Erreur de modification', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(assignProfileToUser({ userId: selectedUserId, profileId: selectedProfileId }));
    if (assignProfileToUser.fulfilled.match(result)) {
      setMessage({ text: 'Profil assigné avec succès !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: "Erreur lors de l'assignation", isError: true });
    }
    setIsSubmitting(false);
  };

  const openEdit = (user: User) => {
    setEditingUserId(user.id);
    setPrenom(user.prenom);
    setNom(user.nom);
    setEmail(user.email);
    setPseudo(user.pseudo);
    setDepartement(user.departement);
    setEditStatus(user.status);
    setActiveModal('edit');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay global pour les actions de statut/suppression */}
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
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiUserCheck className="text-indigo-600" /> Annuaire Utilisateurs
            </h2>
            <p className="text-gray-500 font-medium italic">Gérez les comptes, les accès et les affectations par département.</p>
          </div>
        </div>
        <div className="flex gap-4">
          {/* <button
            onClick={() => setActiveModal('assign')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            🔑 Assigner Profil
          </button> */}
          <button
            onClick={() => setActiveModal('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <FiUserPlus size={20} /> Nouvel Utilisateur
          </button>
        </div>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold italic">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Utilisateur</th>
                <th className="px-6 py-5 text-left">Département</th>
                <th className="px-6 py-5 text-left">Statut</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white font-medium">
              {users.map((user: User) => (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{user.prenom} {user.nom}</div>
                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 uppercase">
                          <FiMail className="inline" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <FiMapPin className="text-gray-300" /> {user.departement}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4">
                    {user.profile ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase border border-gray-200">
                        {user.profile.profil}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300 italic font-bold">Non assigné</span>
                    )}
                  </td> */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                      <button onClick={() => openEdit(user)} className="text-blue-600 hover:underline">Modifier</button>
                      {user.status !== 'ACTIF' ? (
                        <button onClick={() => handleAction(activateUser, { userId: user.id })} className="text-green-600 hover:underline">Activer</button>
                      ) : (
                        <button onClick={() => handleAction(deactivateUser, { userId: user.id })} className="text-amber-600 hover:underline">Désactiver</button>
                      )}
                      <button onClick={() => { setAuditEntityId(user.id); setAuditEntityName(`${user.prenom} ${user.nom}`); }} className="text-purple-600 hover:underline">Historique</button>
                      <button onClick={() => window.confirm('Supprimer ?') && handleAction(deleteUser, { userId: user.id })} className="text-red-500 hover:underline border-l border-gray-100 pl-4">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS UNIFIÉS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {activeModal === 'create' ? 'Nouveau Membre' : activeModal === 'edit' ? 'Modifier Membre' : 'Assigner Profil'}
              </h3>
              <button onClick={closeModals} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <form 
              onSubmit={activeModal === 'create' ? handleSubmitCreate : activeModal === 'edit' ? handleSubmitEdit : handleSubmitAssign} 
              className="p-8 space-y-6"
            >
              {activeModal === 'assign' ? (
                <div className="space-y-6 py-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Utilisateur</label>
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" required>
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Profil à affecter</label>
                    <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" required>
                      <option value="">Sélectionner un profil</option>
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.profil}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <input type="text" placeholder="PRÉNOM" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                    <input type="text" placeholder="NOM" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                    <input type="email" placeholder="EMAIL PROFESSIONNEL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                  </div>
                  <div className="space-y-4">
                    {activeModal === 'create' && (
                      <input type="password" placeholder="MOT DE PASSE" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                    )}
                    <input type="text" placeholder="PSEUDO / IDENTIFIANT" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                    <input type="text" placeholder="DÉPARTEMENT" value={departement} onChange={(e) => setDepartement(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
                    {activeModal === 'edit' && (
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all">
                        <option value="ACTIF">ACTIF</option>
                        <option value="INACTIF">INACTIF</option>
                      </select>
                    )}
                  </div>
                </div>
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
                    activeModal === 'assign' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'
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
        entity="USER"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={() => setAuditEntityId(null)}
      />
    </div>
  );
};

export default Utilisateur;