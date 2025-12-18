import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProfile, fetchProfiles, activateProfile, deactivateProfile, deleteProfile, addAutorisationToProfile } from '../../app/profilesSlice'; // Ajouts
// import { fetchAutorisations } from '../../app/autorisationsSlice'; // Pour autorisations
import type { RootState, AppDispatch } from '../../app/store';
import type { Profile } from '../../app/profilesSlice';
import type { Autorisation } from '../../app/autorisationsSlice'; // Pour select

// Custom hook pour dispatch typé
const useAppDispatch = () => useDispatch<AppDispatch>();

const Profile = () => {
  const dispatch = useAppDispatch();
  const { data: profiles, loading, error: globalError } = useSelector((state: RootState) => state.profiles);
  const { data: autorisations } = useSelector((state: RootState) => state.autorisations);
  const { token } = useSelector((state: RootState) => state.auth);

  // États pour form création
  const [profil, setProfil] = useState('');
  const [status, setStatus] = useState('ACTIF');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // États pour form add autorisation
  const [selectedProfileIdAdd, setSelectedProfileIdAdd] = useState('');
  const [selectedAutorisationIdAdd, setSelectedAutorisationIdAdd] = useState('');
  const [addAuthError, setAddAuthError] = useState('');
  const [addAuthSuccess, setAddAuthSuccess] = useState('');

  // États pour messages actions (globaux)
  const [actionMessage, setActionMessage] = useState('');
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) {
      setSubmitError('Le champ "Profil" est requis');
      return;
    }
    if (!token) {
      setSubmitError('Token manquant – reconnectez-vous');
      return;
    }
    setSubmitError('');
    setSubmitSuccess('');
    const result = await dispatch(createProfile({ profil, status }));
    if (createProfile.fulfilled.match(result)) {
      setSubmitSuccess('Profil créé avec succès !');
      setProfil(''); // Reset form
      setStatus('ACTIF');
      // Re-fetch pour cohérence
      dispatch(fetchProfiles());
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  const handleSubmitAddAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileIdAdd || !selectedAutorisationIdAdd) {
      setAddAuthError('Sélectionnez un profil et une autorisation');
      return;
    }
    if (!token) {
      setAddAuthError('Token manquant');
      return;
    }
    setAddAuthError('');
    setAddAuthSuccess('');
    const result = await dispatch(addAutorisationToProfile({ profileId: selectedProfileIdAdd, autorisationId: selectedAutorisationIdAdd }));
    if (addAutorisationToProfile.fulfilled.match(result)) {
      setAddAuthSuccess('Autorisation ajoutée au profil !');
      setSelectedProfileIdAdd('');
      setSelectedAutorisationIdAdd('');
    } else {
      setAddAuthError('Erreur lors de l\'ajout');
    }
  };

  // Handlers pour actions
  const handleActivate = async (profileId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }

    // On lance l'activation
    const result = await dispatch(activateProfile({ profileId }));

    if (activateProfile.fulfilled.match(result)) {
      setActionMessage('Profil activé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de l\'activation');
      setIsActionSuccess(false);
    }
  };

  const handleDeactivate = async (profileId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }

    const result = await dispatch(deactivateProfile({ profileId }));

    if (deactivateProfile.fulfilled.match(result)) {
      setActionMessage('Profil désactivé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la désactivation');
      setIsActionSuccess(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!window.confirm('Confirmer la suppression de ce profil ?')) return;
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(deleteProfile({ profileId }));
    if (deleteProfile.fulfilled.match(result)) {
      setActionMessage('Profil supprimé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la suppression');
      setIsActionSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Profil</h2>
        <p>Chargement des profils...</p>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Profil</h2>
        <p className="text-red-500">Erreur globale: {globalError}</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Profil</h2>
        <p>Aucun profil trouvé.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Paramétrage Profil</h2>

      {/* Formulaire de création */}
      <form onSubmit={handleSubmitCreate} className="mb-6 p-4 bg-gray-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Ajouter un nouveau profil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Profil (ex: ADMIN)"
            value={profil}
            onChange={(e) => setProfil(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="ACTIF">ACTIF</option>
            <option value="INACTIF">INACTIF</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer'}
        </button>
        {submitError && <p className="text-red-500 mt-2">{submitError}</p>}
        {submitSuccess && <p className="text-green-500 mt-2">{submitSuccess}</p>}
      </form>

      {/* Form ajouter autorisation */}
      <form onSubmit={handleSubmitAddAuth} className="mb-6 p-4 bg-green-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Ajouter une autorisation à un profil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedProfileIdAdd}
            onChange={(e) => setSelectedProfileIdAdd(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un profil</option>
            {profiles.map((p: Profile) => (
              <option key={p.id} value={p.id}>{p.profil}</option>
            ))}
          </select>
          <select
            value={selectedAutorisationIdAdd}
            onChange={(e) => setSelectedAutorisationIdAdd(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner une autorisation</option>
            {autorisations.map((a: Autorisation) => (
              <option key={a.id} value={a.id}>{a.nom}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
        {addAuthError && <p className="text-red-500 mt-2">{addAuthError}</p>}
        {addAuthSuccess && <p className="text-green-500 mt-2">{addAuthSuccess}</p>}
      </form>

      {/* Message d'action global */}
      {actionMessage && (
        <div className={`mb-4 p-4 rounded ${isActionSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage}
          <button onClick={() => setActionMessage('')} className="ml-2 text-sm underline">Fermer</button>
        </div>
      )}

      {/* Tableau existant avec colonne Actions */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Création</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Activation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Désactivation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autorisations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateurs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile: Profile) => (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.profil}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(profile.dateCreation).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {profile.dateActivation ? new Date(profile.dateActivation).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {profile.dateDesactivation ? new Date(profile.dateDesactivation).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs ${profile.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {profile.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside space-y-1 max-h-20 overflow-y-auto">
                    {(profile.autorisations || []).map((aut) => (
                      <li key={aut.id} className="text-sm text-gray-700">
                        {aut.nom} {aut.privilege ? `(${aut.privilege.privilege}: ${aut.privilege.fonctionnalite})` : '(N/A)'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside space-y-1 max-h-20 overflow-y-auto">
                    {(profile.users || []).map((user) => (
                      <li key={user.id} className="text-sm text-gray-700">
                        {user.prenom} {user.nom} {user.email ? `(${user.email})` : '(N/A)'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                  {profile.status != 'ACTIF' && (
                    <button
                      onClick={() => handleActivate(profile.id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                    >
                      Activer
                    </button>
                  )}
                  {profile.status != 'INACTIF' && (
                    <button
                      onClick={() => handleDeactivate(profile.id)}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Désactiver
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(profile.id)}
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

export default Profile;