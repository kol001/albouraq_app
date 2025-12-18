import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, fetchUsers, assignProfileToUser, activateUser, deactivateUser, deleteUser } from '../../app/usersSlice'; // Ajout assignProfileToUser
import type { RootState, AppDispatch } from '../../app/store';
import type { User } from '../../app/usersSlice';
import type { Profile } from '../../app/profilesSlice'; // Pour select

// Custom hook pour dispatch typé
const useAppDispatch = () => useDispatch<AppDispatch>();

const Utilisateur = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error: globalError } = useSelector((state: RootState) => state.users);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);
  const { token } = useSelector((state: RootState) => state.auth);

  // États pour form création
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [departement, setDepartement] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // États pour form assignation
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Nouveaux états pour messages actions (globaux)
  const [actionMessage, setActionMessage] = useState('');
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !motDePasse || !nom || !prenom || !pseudo || !departement) {
      setSubmitError('Tous les champs sont requis');
      return;
    }
    if (!token) {
      setSubmitError('Token manquant – reconnectez-vous');
      return;
    }
    setSubmitError('');
    setSubmitSuccess('');
    const result = await dispatch(createUser({ email, motDePasse, nom, prenom, pseudo, departement }));
    if (createUser.fulfilled.match(result)) {
      setSubmitSuccess('Utilisateur créé avec succès !');
      setEmail(''); setMotDePasse(''); setNom(''); setPrenom(''); setPseudo(''); setDepartement('');
      // Re-fetch pour rafraîchir la liste depuis le serveur
      dispatch(fetchUsers());
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedProfileId) {
      setAssignError('Sélectionnez un utilisateur et un profil');
      return;
    }
    if (!token) {
      setAssignError('Token manquant – reconnectez-vous');
      return;
    }
    setAssignError('');
    setAssignSuccess('');
    const result = await dispatch(assignProfileToUser({ userId: selectedUserId, profileId: selectedProfileId }));
    if (assignProfileToUser.fulfilled.match(result)) {
      setAssignSuccess('Profil assigné avec succès !');
      setSelectedUserId('');
      setSelectedProfileId('');
      // Re-fetch auto géré dans le thunk, mais on peut en ajouter un si besoin
    } else {
      setAssignError('Erreur lors de l\'assignation');
    }
  };

  // Nouvelles handlers pour actions
  const handleActivate = async (userId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(activateUser({ userId }));
    if (activateUser.fulfilled.match(result)) {
      setActionMessage('Utilisateur activé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de l\'activation');
      setIsActionSuccess(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(deactivateUser({ userId }));
    if (deactivateUser.fulfilled.match(result)) {
      setActionMessage('Utilisateur désactivé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la désactivation');
      setIsActionSuccess(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(deleteUser({ userId }));
    if (deleteUser.fulfilled.match(result)) {
      setActionMessage('Utilisateur supprimé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la suppression');
      setIsActionSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Utilisateur</h2>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Utilisateur</h2>
        <p className="text-red-500">Erreur: {globalError}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Utilisateur</h2>
        <p>Aucun utilisateur trouvé.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Paramétrage Utilisateur</h2>

      {/* Formulaire de création */}
      <form onSubmit={handleSubmitCreate} className="mb-6 p-4 bg-gray-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Ajouter un nouvel utilisateur</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" required />
          <input type="password" placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Département (ex: IT)" value={departement} onChange={(e) => setDepartement(e.target.value)} className="p-2 border rounded" required />
        </div>
        <button type="submit" disabled={loading} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {loading ? 'Création...' : 'Créer'}
        </button>
        {submitError && <p className="text-red-500 mt-2">{submitError}</p>}
        {submitSuccess && <p className="text-green-500 mt-2">{submitSuccess}</p>}
      </form>

      {/* Nouveau formulaire d'assignation de profil */}
      <form onSubmit={handleSubmitAssign} className="mb-6 p-4 bg-blue-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Assigner un profil à un utilisateur</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un utilisateur</option>
            {users.map((u: User) => (
              <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>
            ))}
          </select>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un profil</option>
            {profiles.map((p: Profile) => (
              <option key={p.id} value={p.id}>{p.profil} ({p.status})</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
          {loading ? 'Assignation...' : 'Assigner'}
        </button>
        {assignError && <p className="text-red-500 mt-2">{assignError}</p>}
        {assignSuccess && <p className="text-green-500 mt-2">{assignSuccess}</p>}
      </form>

      {/* Liste des profils (référence) */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Profils disponibles</h3>
        {profiles.length === 0 ? (
          <p>Aucun profil.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th> */}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Profil</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p: Profile) => (
                  <tr key={p.id} className="border-t">
                    {/* <td className="px-4 py-2 text-sm">{p.id}</td> */}
                    <td className="px-4 py-2 text-sm">{p.profil}</td>
                    <td className="px-4 py-2 text-sm">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Message d'action global (nouveau) */}
      {actionMessage && (
        <div className={`mb-4 p-4 rounded ${isActionSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage}
          <button onClick={() => setActionMessage('')} className="ml-2 text-sm underline">Fermer</button>
        </div>
      )}

      {/* Tableau avec colonne Actions (nouveau) */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pseudo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Création</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Activation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Désactivation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* Nouveau */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.pseudo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.departement}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs ${user.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.profile ? user.profile.profil : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.dateCreation).toLocaleDateString()}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.dateActivation ? new Date(user.dateActivation).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.dateDesactivation ? new Date(user.dateDesactivation).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                  {user.status != 'ACTIF' && (
                    <button
                      onClick={() => handleActivate(user.id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                    >
                      Activer
                    </button>
                  )}
                  {user.status != 'INACTIF' && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Désactiver
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={loading}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Utilisateur;