import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTransactionType,
  activateTransactionType,
  deactivateTransactionType,
  deleteTransactionType,
} from '../../app/transactionTypesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { FiSettings, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiActivity } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const TRANSACTION_TYPES = ['AUTOMATIQUE', 'SEMI_AUTOMATIQUE', 'MANUEL'] as const;
const EVENTS = [
  'APPROBATION_BC_CLIENT',
  'CREATION_FACTURE_CLIENT',
  'CREATION_BC_FOURNISSEUR',
  'APPROBATION_BC_FOURNISSEUR',
  'CREATION_BR_FOURNISSEUR',
  'CREATION_FACTURE_FOURNISSEUR',
] as const;

const TypeTransaction = () => {
  const dispatch = useAppDispatch();
  const { data: types, loading, error: globalError } = useSelector((state: RootState) => state.transactionTypes);
  
  // Modal & UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Form states
  const [transactionType, setTransactionType] = useState<'AUTOMATIQUE' | 'SEMI_AUTOMATIQUE' | 'MANUEL'>('AUTOMATIQUE');
  const [event, setEvent] = useState<typeof EVENTS[number]>(EVENTS[0]);
  const [executionMode, setExecutionMode] = useState<'MANUEL' | 'AUTOMATIQUE'>('MANUEL');

  const closeModals = () => {
    setIsModalOpen(false);
    setMessage({ text: '', isError: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createTransactionType({ transactionType, event, executionMode }));

    if (createTransactionType.fulfilled.match(result)) {
      setMessage({ text: 'Type de transaction créé avec succès !', isError: false });
      setTimeout(() => {
        setTransactionType('AUTOMATIQUE');
        setEvent(EVENTS[0]);
        setExecutionMode('MANUEL');
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la création', isError: true });
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiSettings className="text-indigo-600" /> Paramétrage Types de Transaction
          </h2>
          <p className="text-sm text-gray-500">Configurez les déclencheurs et les modes d'exécution des flux.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-fit"
        >
          <FiPlus size={20} /> Nouveau Type
        </button>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU DES TYPES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Workflow</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Événement Déclencheur</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-medium">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FiActivity size={16} />
                      </div>
                      <span className="text-gray-900 font-bold tracking-tight">{type.transactionType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      {type.event}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${type.executionMode === 'AUTOMATIQUE' ? 'text-purple-600 bg-purple-50' : 'text-amber-600 bg-amber-50'}`}>
                      {type.executionMode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${type.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      ● {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {type.status !== 'ACTIF' ? (
                      <button onClick={() => dispatch(activateTransactionType({ id: type.id }))} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase tracking-tight transition-colors">Activer</button>
                    ) : (
                      <button onClick={() => dispatch(deactivateTransactionType({ id: type.id }))} className="text-amber-600 hover:text-amber-800 text-xs font-bold uppercase tracking-tight transition-colors">Désactiver</button>
                    )}
                    <button onClick={() => window.confirm('Supprimer ce type ?') && dispatch(deleteTransactionType({ id: type.id }))} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-tight transition-colors border-l pl-3">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALE DE CRÉATION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Nouveau Type de Transaction</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type de Flux</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                  >
                    {TRANSACTION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Événement Déclencheur</label>
                  <select
                    value={event}
                    onChange={(e) => setEvent(e.target.value as any)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                  >
                    {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mode d'Exécution</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['MANUEL', 'AUTOMATIQUE'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setExecutionMode(m as any)}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                          executionMode === m 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {message.text && (
                <div className={`mt-2 p-4 rounded-xl flex items-center gap-3 animate-pulse ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={closeModals} 
                  className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  {loading ? 'Création...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeTransaction;