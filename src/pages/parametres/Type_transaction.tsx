import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTransactionType,
  activateTransactionType,
  deactivateTransactionType,
  deleteTransactionType,
} from '../../app/transactionTypesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { 
  FiSettings, FiPlus, FiX, FiCheckCircle, 
  FiAlertCircle, FiActivity, FiLoader , FiArrowLeft
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { data: types, loading: globalLoading, error: globalError } = useSelector((state: RootState) => state.transactionTypes);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Chargement spécifique aux actions
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
    setIsSubmitting(true);
    const result = await dispatch(createTransactionType({ transactionType, event, executionMode }));

    if (createTransactionType.fulfilled.match(result)) {
      setMessage({ text: 'Type de transaction créé !', isError: false });
      setTimeout(() => {
        setTransactionType('AUTOMATIQUE');
        setEvent(EVENTS[0]);
        setExecutionMode('MANUEL');
        closeModals();
      }, 1500);
    } else {
      setMessage({ text: 'Erreur lors de la création', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleAction = async (actionFn: any, id: string) => {
    setIsSubmitting(true);
    await dispatch(actionFn({ id }));
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce type de transaction ?')) return;
    setIsSubmitting(true);
    await dispatch(deleteTransactionType({ id }));
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay de chargement global */}
      {isSubmitting && !isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Traitement en cours</p>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiSettings className="text-indigo-600" /> Types de Transaction
            </h2>
            <p className="text-gray-500 font-medium italic">Définissez les règles d'automatisation de vos flux de documents.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 w-fit"
        >
          <FiPlus size={20} /> Nouveau Type
        </button>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold italic">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU DES TYPES */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Événement Déclencheur</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode d'exécution</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white font-medium">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FiActivity size={18} />
                      </div>
                      <span className="text-gray-900 font-black tracking-tight uppercase text-sm">{type.transactionType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-indigo-700 font-mono bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100">
                      {type.event}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      type.executionMode === 'AUTOMATIQUE' 
                      ? 'text-purple-600 bg-purple-50 border-purple-100' 
                      : 'text-amber-600 bg-amber-50 border-amber-100'
                    }`}>
                      {type.executionMode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      type.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${type.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                      {type.status !== 'ACTIF' ? (
                        <button onClick={() => handleAction(activateTransactionType, type.id)} className="text-green-600 hover:text-green-800 transition-colors underline underline-offset-4 decoration-2">Activer</button>
                      ) : (
                        <button onClick={() => handleAction(deactivateTransactionType, type.id)} className="text-amber-600 hover:text-amber-800 transition-colors underline underline-offset-4 decoration-2">Désactiver</button>
                      )}
                      <button onClick={() => handleDelete(type.id)} className="text-red-500 hover:text-red-700 transition-colors border-l border-gray-100 pl-4 underline underline-offset-4 decoration-2">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {globalLoading && types.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <FiLoader className="animate-spin" size={30} />
              <p className="font-bold uppercase text-[10px] tracking-widest">Chargement des paramètres...</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALE DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">Nouveau Flux</h3>
              <button onClick={closeModals} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type de Flux</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                    required
                  >
                    {TRANSACTION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Événement Déclencheur</label>
                  <select
                    value={event}
                    onChange={(e) => setEvent(e.target.value as any)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                    required
                  >
                    {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mode d'Exécution</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['MANUEL', 'AUTOMATIQUE'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setExecutionMode(m as any)}
                        className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                          executionMode === m 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  <span className="text-xs font-black uppercase tracking-tight">{message.text}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={closeModals} 
                  className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Enregistrer'}
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