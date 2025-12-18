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
import { FiPlus, FiCalendar, FiClock, FiX, FiCheckCircle, FiAlertCircle,  FiTrash2, } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const TransactionPage = () => {
  const dispatch = useAppDispatch();
  const { data: transactions, loading: transLoading } = useSelector((state: RootState) => state.transactions);
  const { data: types, loading: typesLoading } = useSelector((state: RootState) => state.transactionTypes);

  // États UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrans, setEditingTrans] = useState<Transaction | null>(null);
  const [message, setMessage] = useState({ text: '', isError: false });

  // États Formulaires
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [dateApplication, setDateApplication] = useState('');

  const loading = transLoading || typesLoading;

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingTrans(null);
    setMessage({ text: '', isError: false });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createTransaction({
      transactionId: selectedTypeId,
      dateApplication: new Date(dateApplication).toISOString(),
    }));

    if (createTransaction.fulfilled.match(result)) {
      showFeedback('Transaction planifiée avec succès !');
      setSelectedTypeId('');
      setDateApplication('');
      setTimeout(closeModals, 1500);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrans) return;
    const result = await dispatch(updateTransaction({
      id: editingTrans.id,
      dateApplication: new Date(dateApplication).toISOString(),
    }));

    if (updateTransaction.fulfilled.match(result)) {
      showFeedback('Mise à jour effectuée !');
      setTimeout(closeModals, 1500);
    }
  };

  const showFeedback = (txt: string, isErr = false) => {
    setMessage({ text: txt, isError: isErr });
  };

  const openEdit = (trans: Transaction) => {
    setEditingTrans(trans);
    setDateApplication(trans.dateApplication.slice(0, 16));
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCalendar className="text-indigo-600" /> Planification des Transactions
          </h2>
          <p className="text-sm text-gray-500">Gérez les dates d'application et les statuts des flux transactionnels.</p>
        </div>
        <button 
          onClick={() => { setEditingTrans(null); setDateApplication(''); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Programmer une transaction
        </button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type & Événement</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date d'Application</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.map((trans) => (
              <tr key={trans.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{trans.transactiontype.transactionType}</span>
                    <span className="text-[11px] text-gray-400 font-mono uppercase">{trans.transactiontype.event}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${trans.transactiontype.executionMode === 'AUTOMATIQUE' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                    {trans.transactiontype.executionMode}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <FiClock className="text-gray-300" />
                    {new Date(trans.dateApplication).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${trans.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${trans.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {trans.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(trans)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Modifier">
                      {/* <FiEdit3 size={16} /> */}
                      Modifier
                    </button>
                    <button 
                      onClick={() => trans.status === 'ACTIF' ? dispatch(deactivateTransaction({id: trans.id})) : dispatch(activateTransaction({id: trans.id}))}
                      className={`p-2 rounded-lg transition-all ${trans.status === 'ACTIF' ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600' : 'text-green-400 hover:bg-green-50 hover:text-green-600'}`}
                      title={trans.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    >
                      {/* <FiPower size={16} /> */}
                      {trans.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteTransaction({id: trans.id}))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALE UNIQUE (CREATION / EDITION) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTrans ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={editingTrans ? handleUpdate : handleCreate} className="p-8 space-y-5">
              {!editingTrans && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type de Flux cible</label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                    required
                  >
                    <option value="">Sélectionner un type...</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.transactionType} - {t.event}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date et Heure d'application</label>
                <input
                  type="datetime-local"
                  value={dateApplication}
                  onChange={(e) => setDateApplication(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                  required
                />
              </div>

              {/* Message Feedback */}
              {message.text && (
                <div className={`mt-2 p-4 rounded-xl flex items-center gap-3 ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModals} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {loading ? 'Envoi...' : editingTrans ? 'Mettre à jour' : 'Programmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;