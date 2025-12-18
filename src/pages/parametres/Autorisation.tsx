import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAutorisation, fetchAutorisations, assignProfileToAutorisation, activateAutorisation, deactivateAutorisation, deleteAutorisation } from '../../app/autorisationsSlice'; // Ajout fetch et assign
import type { RootState, AppDispatch } from '../../app/store';
import type { Autorisation } from '../../app/autorisationsSlice';
import type { Profile } from '../../app/profilesSlice'; // Pour select
import type { Privilege as PrivilegeType } from '../../app/privilegesSlice'; // Pour select (renommé pour éviter conflit)
import { fetchProfiles } from '../../app/profilesSlice';

// Custom hook pour dispatch typé
const useAppDispatch = () => useDispatch<AppDispatch>();

const Autorisation = () => {
  const dispatch = useAppDispatch();
  const { data: autorisations, loading, error: globalError } = useSelector((state: RootState) => state.autorisations);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);
  const { data: privileges } = useSelector((state: RootState) => state.privileges);
  const { token } = useSelector((state: RootState) => state.auth);

  // États pour form création
  const [nom, setNom] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // États pour form assignation
  const [selectedAuthId, setSelectedAuthId] = useState('');
  const [assignProfileId, setAssignProfileId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Nouveaux états pour messages actions (globaux)
  const [actionMessage, setActionMessage] = useState('');
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !selectedProfileId || !selectedPrivilegeId) {
      setSubmitError('Tous les champs sont requis');
      return;
    }
    if (!token) {
      setSubmitError('Token manquant');
      return;
    }
    setSubmitError('');
    setSubmitSuccess('');
    const result = await dispatch(createAutorisation({
      nom,
      profileId: selectedProfileId,
      privilegeId: selectedPrivilegeId
    })); // moduleId géré dans le thunk
    if (createAutorisation.fulfilled.match(result)) {
      setSubmitSuccess('Autorisation créée avec succès !');
      setNom('');
      setSelectedProfileId('');
      setSelectedPrivilegeId('');
      // Re-fetch pour cohérence
      dispatch(fetchAutorisations());
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthId || !assignProfileId) {
      setAssignError('Sélectionnez une autorisation et un profil');
      return;
    }
    if (!token) {
      setAssignError('Token manquant');
      return;
    }
    setAssignError('');
    setAssignSuccess('');
    const result = await dispatch(assignProfileToAutorisation({ authId: selectedAuthId, profileId: assignProfileId }));
    if (assignProfileToAutorisation.fulfilled.match(result)) {
      setAssignSuccess('Profil assigné à l\'autorisation avec succès !');
      setSelectedAuthId('');
      setAssignProfileId('');
      // Re-fetch auto géré dans le thunk

      // ← AJOUT CLÉ : On recharge les profils pour mettre à jour la liste des autorisations par profil
      dispatch(fetchProfiles());
    } else {
      setAssignError('Erreur lors de l\'assignation');
    }
  };

  const handleActivate = async (authId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(activateAutorisation({ authId }));
    if (activateAutorisation.fulfilled.match(result)) {
      setActionMessage('Autorisation activée !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de l\'activation');
      setIsActionSuccess(false);
    }
  };

  const handleDeactivate = async (authId: string) => {
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(deactivateAutorisation({ authId }));
    if (deactivateAutorisation.fulfilled.match(result)) {
      setActionMessage('Autorisation désactivée !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la désactivation');
      setIsActionSuccess(false);
    }
  };

  const handleDelete = async (authId: string) => {
    if (!window.confirm('Confirmer la suppression de cette autorisation ?')) return;
    if (!token) {
      setActionMessage('Token manquant');
      setIsActionSuccess(false);
      return;
    }
    const result = await dispatch(deleteAutorisation({ authId }));
    if (deleteAutorisation.fulfilled.match(result)) {
      setActionMessage('Autorisation supprimée !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la suppression');
      setIsActionSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Autorisations</h2>
        <p>Chargement des autorisations...</p>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage Autorisations</h2>
        <p className="text-red-500">Erreur: {globalError}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Paramétrage Autorisations</h2>

      {/* Form création */}
      <form onSubmit={handleSubmitCreate} className="mb-6 p-4 bg-gray-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Créer une nouvelle autorisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom (ex: GESTION_USERS)"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un profil</option>
            {profiles.map((p: Profile) => (
              <option key={p.id} value={p.id}>{p.profil}</option>
            ))}
          </select>
          <select
            value={selectedPrivilegeId}
            onChange={(e) => setSelectedPrivilegeId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un privilège</option>
            {privileges.map((p: PrivilegeType) => (
              <option key={p.id} value={p.id}>{p.privilege} - {p.fonctionnalite}</option>
            ))}
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

      {/* Nouveau formulaire d'assignation de profil à une autorisation */}
      <form onSubmit={handleSubmitAssign} className="mb-6 p-4 bg-blue-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Assigner un profil à une autorisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={assignProfileId}
            onChange={(e) => setAssignProfileId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner un profil</option>
            {profiles.map((p: Profile) => (
              <option key={p.id} value={p.id}>{p.profil} ({p.status})</option>
            ))}
          </select>
          <select
            value={selectedAuthId}
            onChange={(e) => setSelectedAuthId(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Sélectionner une autorisation</option>
            {autorisations.map((a: Autorisation) => (
              <option key={a.id} value={a.id}>{a.nom} ({a.privilege ? a.privilege.privilege : 'N/A'})</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
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
              <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autorisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateurs</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile: Profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.profil}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded text-xs ${profile.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {profile.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="list-disc list-inside space-y-1 max-h-20 overflow-y-auto">
                          {profile.autorisations.map((aut) => (
                            <li key={aut.id} className="text-sm text-gray-700">
                              {aut.nom} {aut.privilege ? `(${aut.privilege.privilege}: ${aut.privilege.fonctionnalite})` : '(N/A)'}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="list-disc list-inside space-y-1 max-h-20 overflow-y-auto">
                          {profile.users.map((user) => (
                            <li key={user.id} className="text-sm text-gray-700">
                              {user.prenom} {user.nom} {user.email ? `(${user.email})` : '(N/A)'}
                            </li>
                          ))}
                        </ul>
                      </td>
                    
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
      {autorisations.length === 0 ? (
        <p>Aucune autorisation trouvée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privilège</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {autorisations.map((aut: Autorisation) => (
                <tr key={aut.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aut.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {aut.profile ? aut.profile.profil : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {aut.privilege ? `${aut.privilege.privilege} - ${aut.privilege.fonctionnalite}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded text-xs ${aut.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {aut.status || 'N/A'} {/* Assume 'status' field ; adapte si absent */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                    {aut.status != 'ACTIF'  && (
                      <button
                        onClick={() => handleActivate(aut.id)}
                        disabled={loading}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                      >
                        Activer
                      </button>
                    )}
                    {aut.status != 'INACTIF'  && (
                      <button
                        onClick={() => handleDeactivate(aut.id)}
                        disabled={loading}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Désactiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(aut.id)}
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
      )}
    </div>
  );
};

export default Autorisation;