import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTransaction,
  updateTransaction,
  activateTransaction,
  deactivateTransaction,
  deleteTransaction,
} from '../../app/transactionsSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Transaction } from '../../app/transactionsSlice';
import type { ModuleRef } from '../../app/commissionsSlice';
import { FiPlus, FiCalendar, FiClock, FiX, FiCheckCircle, FiAlertCircle, FiLoader, FiLayers } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const TransactionPage = () => {
  const dispatch = useAppDispatch();
  const { data: transactions, loading: transLoading } = useSelector((state: RootState) => state.transactions);
  const { data: modules, loading: modulesLoading } = useSelector((state: RootState) => state.modules);
  const { data: types, loading: typesLoading } = useSelector((state: RootState) => state.transactionTypes);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTrans, setEditingTrans] = useState<Transaction | null>(null);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Form states
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [dateApplication, setDateApplication] = useState('');

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const loading = transLoading || modulesLoading || typesLoading;

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingTrans(null);
    setSelectedModuleId('');
    setSelectedTypeId('');
    setDateApplication('');
    setMessage({ text: '', isError: false });
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    const payload = {
      moduleId: selectedModuleId,
      transactionId: selectedTypeId,
      dateApplication: new Date(dateApplication).toISOString(),
    };

    const action = editingTrans 
      ? updateTransaction({ id: editingTrans.id, ...payload })
      : createTransaction(payload);

    const result = await dispatch(action);

    if (createTransaction.fulfilled.match(result) || updateTransaction.fulfilled.match(result)) {
      setMessage({ text: editingTrans ? 'Mise à jour réussie !' : 'Transaction planifiée !', isError: false });
      setTimeout(closeModals, 1500);
    } else {
      setMessage({ text: 'Une erreur est survenue.', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleAction = async (actionFn: any, id: string) => {
    setIsSubmitting(true);
    await dispatch(actionFn({ id }));
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer définitivement cette planification ?')) return;
    setIsSubmitting(true);
    await dispatch(deleteTransaction({ id }));
    setIsSubmitting(false);
  };

  const openEdit = (trans: Transaction) => {
    setEditingTrans(trans);
    setSelectedModuleId(trans.moduleId || '');
    setSelectedTypeId(trans.transactionId || trans.transactiontype?.id || '');
    setDateApplication(trans.dateApplication.slice(0, 16));
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay global pour actions rapides */}
      {isSubmitting && !isModalOpen && (
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
            <FiCalendar className="text-indigo-600" /> Planification
          </h2>
          <p className="text-gray-500 font-medium italic">Programmez l'exécution des flux de transactions par module.</p>
        </div>
        <button
          onClick={() => { closeModals(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Programmer un flux
        </button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 text-left">Flux & Événement</th>
              <th className="px-6 py-5 text-left">Module Cible</th>
              <th className="px-6 py-5 text-left">Exécution</th>
              <th className="px-6 py-5 text-left">Planification</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {transactions.map((trans) => (
              <tr key={trans.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FiLayers size={18} /></div>
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 uppercase text-sm">{trans.transactiontype?.transactionType || 'N/A'}</span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{trans.transactiontype?.event || ''}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">
                  {trans.module ? `${trans.module.nom}` : 'N/A'}
                  <span className="block text-[10px] text-indigo-500 font-mono uppercase">{trans.module?.code}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                    trans.transactiontype?.executionMode === 'AUTOMATIQUE' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {trans.transactiontype?.executionMode || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-bold tracking-tight">
                    <FiClock className="text-indigo-300" />
                    {new Date(trans.dateApplication).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${trans.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${trans.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {trans.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                    <button onClick={() => openEdit(trans)} className="text-blue-600 hover:underline">Modifier</button>
                    <button
                      onClick={() => handleAction(trans.status === 'ACTIF' ? deactivateTransaction : activateTransaction, trans.id)}
                      className={trans.status === 'ACTIF' ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'}
                    >
                      {trans.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => { setAuditEntityId(trans.id); setAuditEntityName(trans.transactiontype?.transactionType || 'N/A'); }} className="text-purple-600 hover:underline">Historique</button>
                    <button onClick={() => handleDelete(trans.id)} className="text-red-500 hover:underline border-l border-gray-100 pl-4">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && transactions.length === 0 && (
          <div className="p-20 text-center"><FiLoader className="animate-spin mx-auto text-indigo-600" size={30} /></div>
        )}
      </div>

      {/* MODALE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {editingTrans ? 'Modifier Plan' : 'Nouveau Plan'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Module cible</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                >
                  <option value="">Sélectionner un module...</option>
                  {modules.map((m: ModuleRef) => (
                    <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type de Flux</label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                >
                  <option value="">Sélectionner un type...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.transactionType} — {t.event}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date d'application</label>
                <input
                  type="datetime-local"
                  value={dateApplication}
                  onChange={(e) => setDateApplication(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  required
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-xs ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />} {message.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-400">Annuler</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : editingTrans ? 'Mettre à jour' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal
        entity="TRANSACTION"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={() => setAuditEntityId(null)}
      />
    </div>
  );
};

export default TransactionPage;