import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTransactionType,
  // fetchTransactionTypes,
  activateTransactionType,
  deactivateTransactionType,
  deleteTransactionType,
} from '../../app/transactionTypesSlice';
import type { RootState, AppDispatch } from '../../app/store';
// import type { TransactionType } from '../../app/transactionTypesSlice';

const useAppDispatch = () => useDispatch<AppDispatch>();

// Listes fixes pour les selects
const TRANSACTION_TYPES = ['AUTOMATIQUE', 'SEMI_AUTOMATIQUE', 'MANUEL'] as const;
const EVENTS = [
  'APPROBATION_BC_CLIENT',
  'CREATION_FACTURE_CLIENT',
  'CREATION_BC_FOURNISSEUR',
  'APPROBATION_BC_FOURNISSEUR',
  'CREATION_BR_FOURNISSEUR',
  'CREATION_FACTURE_FOURNISSEUR',
] as const;

const Type_transaction = () => {
  const dispatch = useAppDispatch();
  const { data: types, loading, error: globalError } = useSelector((state: RootState) => state.transactionTypes);
  const { token } = useSelector((state: RootState) => state.auth);

  // Form states
  const [transactionType, setTransactionType] = useState<'AUTOMATIQUE' | 'SEMI_AUTOMATIQUE' | 'MANUEL'>('AUTOMATIQUE');
  const [event, setEvent] = useState<typeof EVENTS[number]>(EVENTS[0]);
  const [executionMode, setExecutionMode] = useState<'MANUEL' | 'AUTOMATIQUE'>('MANUEL');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setSubmitError('Token manquant – reconnectez-vous');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');

    const result = await dispatch(createTransactionType({
      transactionType,
      event,
      executionMode,
    }));

    if (createTransactionType.fulfilled.match(result)) {
      setSubmitSuccess('Type de transaction créé avec succès !');
      setTransactionType('AUTOMATIQUE');
      setEvent(EVENTS[0]);
      setExecutionMode('MANUEL');
    } else {
      setSubmitError('Erreur lors de la création');
    }
  };

  const handleActivate = async (id: string) => {
    const result = await dispatch(activateTransactionType({ id }));
    if (activateTransactionType.fulfilled.match(result)) {
      setActionMessage('Type activé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de l\'activation');
      setIsActionSuccess(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    const result = await dispatch(deactivateTransactionType({ id }));
    if (deactivateTransactionType.fulfilled.match(result)) {
      setActionMessage('Type désactivé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la désactivation');
      setIsActionSuccess(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de ce type de transaction ?')) return;
    const result = await dispatch(deleteTransactionType({ id }));
    if (deleteTransactionType.fulfilled.match(result)) {
      setActionMessage('Type supprimé !');
      setIsActionSuccess(true);
    } else {
      setActionMessage('Erreur lors de la suppression');
      setIsActionSuccess(false);
    }
  };

  if (loading) return <div className="p-6"><p>Chargement...</p></div>;
  if (globalError) return <div className="p-6 text-red-500">Erreur: {globalError}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Paramétrage Type Transaction</h2>

      {/* Formulaire création */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Créer un nouveau type de transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Type de transaction</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="w-full p-2 border rounded"
              required
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Événement</label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value as any)}
              className="w-full p-2 border rounded"
              required
            >
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mode d'exécution</label>
            <select
              value={executionMode}
              onChange={(e) => setExecutionMode(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="MANUEL">MANUEL</option>
              <option value="AUTOMATIQUE">AUTOMATIQUE</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer'}
        </button>

        {submitError && <p className="text-red-500 mt-4">{submitError}</p>}
        {submitSuccess && <p className="text-green-500 mt-4">{submitSuccess}</p>}
      </form>

      {/* Message global actions */}
      {actionMessage && (
        <div className={`mb-6 p-4 rounded ${isActionSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage}
          <button onClick={() => setActionMessage('')} className="ml-4 underline text-sm">Fermer</button>
        </div>
      )}

      {/* Tableau */}
      {types.length === 0 ? (
        <p>Aucun type de transaction trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode exécution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{type.transactionType}</td>
                  <td className="px-6 py-4 text-sm">{type.event}</td>
                  <td className="px-6 py-4 text-sm">{type.executionMode}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${type.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(type.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 space-x-2">
                    {type.status !== 'ACTIF' && (
                      <button
                        onClick={() => handleActivate(type.id)}
                        disabled={loading}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                      >
                        Activer
                      </button>
                    )}
                    {type.status === 'ACTIF' && (
                      <button
                        onClick={() => handleDeactivate(type.id)}
                        disabled={loading}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Désactiver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={loading}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
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

export default Type_transaction;