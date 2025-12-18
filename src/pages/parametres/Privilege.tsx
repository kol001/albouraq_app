import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPrivilege } from '../../app/privilegesSlice'; // Nouveau import
import type { RootState, AppDispatch } from '../../app/store';
import type { Privilege } from '../../app/privilegesSlice'; // Type

// Custom hook pour dispatch typé
const useAppDispatch = () => useDispatch<AppDispatch>();

const Privilege = () => {
  const dispatch = useAppDispatch();
  const { data: privileges, loading, error: globalError } = useSelector((state: RootState) => state.privileges);
  const { token } = useSelector((state: RootState) => state.auth);

  // États locaux pour le formulaire
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
    if (!token) {
      setSubmitError('Token manquant – reconnectez-vous');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    const result = await dispatch(createPrivilege({ privilege, fonctionnalite }));
    if (createPrivilege.fulfilled.match(result)) {
      setSubmitSuccess('Privilège créé avec succès !');
      setPrivilege(''); // Reset form
      setFonctionnalite('');
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  // ... (gestion loading/globalError reste identique)

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage privilèges</h2>
        <p>Chargement des privilèges...</p>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage privilèges</h2>
        <p className="text-red-500">Erreur globale: {globalError}</p>
      </div>
    );
  }

  if (privileges.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Paramétrage privilèges</h2>
        <p>Aucun privilège trouvé.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Paramétrage privilèges</h2>

      {/* Formulaire de création */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Ajouter un nouveau privilège</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Privilège (ex: LECTURE)"
            value={privilege}
            onChange={(e) => setPrivilege(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Fonctionnalité (ex: Voir les données)"
            value={fonctionnalite}
            onChange={(e) => setFonctionnalite(e.target.value)}
            className="p-2 border rounded"
            required
          />
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

      {/* Tableau existant */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privilège</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonctionnalité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autorisations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {privileges.map((privilege: Privilege) => (
              <tr key={privilege.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{privilege.privilege}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{privilege.fonctionnalite}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside space-y-1">
                    {privilege.autorisations.map((aut: { id: string; nom: string }) => (
                      <li key={aut.id} className="text-sm text-gray-700">{aut.nom}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Privilege;