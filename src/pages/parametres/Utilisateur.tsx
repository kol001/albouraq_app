import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, assignProfileToUser, activateUser, deactivateUser, deleteUser, updateUser } from '../../app/usersSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { User } from '../../app/usersSlice';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const Utilisateur = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error: globalError } = useSelector((state: RootState) => state.users);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);

  // État pour modals
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'assign' | 'edit'>('none');

  // États formulaires création
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [departement, setDepartement] = useState('');

  // États formulaires édition
  const [editEmail, setEditEmail] = useState('');
  const [editNom, setEditNom] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editPseudo, setEditPseudo] = useState('');
  const [editDepartement, setEditDepartement] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editingUserId, setEditingUserId] = useState('');

  // Assignation
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');

  // Message feedback
  const [message, setMessage] = useState({ text: '', isError: false });

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setMessage({ text: '', isError: false });
    setEditingUserId('');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createUser({ email, motDePasse, nom, prenom, pseudo, departement }));
    if (createUser.fulfilled.match(result)) {
      setMessage({ text: 'Utilisateur créé !', isError: false });
      setTimeout(() => {
        setEmail(''); setMotDePasse(''); setNom(''); setPrenom(''); setPseudo(''); setDepartement('');
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur de création', isError: true });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    const result = await dispatch(updateUser({
      id: editingUserId,
      email: editEmail,
      nom: editNom,
      prenom: editPrenom,
      pseudo: editPseudo,
      departement: editDepartement,
      status: editStatus,
    }));
    if (updateUser.fulfilled.match(result)) {
      setMessage({ text: 'Utilisateur modifié !', isError: false });
      setTimeout(() => {
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur de modification', isError: true });
    }
  };

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(assignProfileToUser({ userId: selectedUserId, profileId: selectedProfileId }));
    if (assignProfileToUser.fulfilled.match(result)) {
      setMessage({ text: 'Profil assigné !', isError: false });
      setTimeout(() => {
        setSelectedUserId(''); setSelectedProfileId('');
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur d\'assignation', isError: true });
    }
  };

  const openEdit = (user: User) => {
    setActiveModal('edit');
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditNom(user.nom);
    setEditPrenom(user.prenom);
    setEditPseudo(user.pseudo);
    setEditDepartement(user.departement);
    setEditStatus(user.status);
  };

  const openAudit = (user: User) => {
    setAuditEntityId(user.id);
    setAuditEntityName(`${user.prenom} ${user.nom}`);
  };

  const closeAudit = () => {
    setAuditEntityId(null);
    setAuditEntityName('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Paramétrage Utilisateur</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveModal('assign')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            🔑 Assigner Profil
          </button>
          <button
            onClick={() => setActiveModal('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            + Nouvel Utilisateur
          </button>
        </div>
      </div>

      {globalError && <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg">{globalError}</div>}

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Identité / Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Département</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Profil</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{user.prenom} {user.nom}</div>
                    <div className="text-xs text-gray-500">{user.email} ({user.pseudo})</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.departement}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.profile ? (
                      <span className="text-indigo-600 font-medium">{user.profile.profil}</span>
                    ) : (
                      <span className="text-gray-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => openEdit(user)} className="text-blue-600 hover:underline text-xs font-bold">Modifier</button>
                    {user.status !== 'ACTIF' && (
                      <button onClick={() => dispatch(activateUser({ userId: user.id }))} className="text-green-600 hover:underline text-xs font-bold">Activer</button>
                    )}
                    {user.status !== 'INACTIF' && (
                      <button onClick={() => dispatch(deactivateUser({ userId: user.id }))} className="text-yellow-600 hover:underline text-xs font-bold">Désactiver</button>
                    )}
                    <button
                      onClick={() => openAudit(user)}
                      className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                    >
                      Historique
                    </button>
                    <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteUser({ userId: user.id }))} className="text-red-500 hover:underline text-xs font-bold pl-2 border-l border-gray-200">Supprimer</button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Ajouter un utilisateur</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="Département" value={departement} onChange={(e) => setDepartement(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              {message.text && <p className={`mt-4 text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-colors shadow-lg disabled:opacity-50">
                  {loading ? 'Création...' : 'Créer utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Modifier l'utilisateur</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Prénom" value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="text" placeholder="Nom" value={editNom} onChange={(e) => setEditNom(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="email" placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="text" placeholder="Pseudo" value={editPseudo} onChange={(e) => setEditPseudo(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="text" placeholder="Département" value={editDepartement} onChange={(e) => setEditDepartement(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="ACTIF">ACTIF</option>
                  <option value="INACTIF">INACTIF</option>
                </select>
              </div>
              {message.text && <p className={`mt-4 text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-lg disabled:opacity-50">
                  {loading ? 'Modification...' : 'Modifier utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASSIGNATION */}
      {activeModal === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Assigner un Profil</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmitAssign} className="p-6 space-y-5">
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Sélectionner un utilisateur</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>)}
              </select>
              <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Sélectionner un profil</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.profil}</option>)}
              </select>
              {message.text && <p className={`text-center text-sm font-bold ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-lg">Confirmer l'assignation</button>
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
        onClose={closeAudit}
      />
    </div>
  );
};

export default Utilisateur;