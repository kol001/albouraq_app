import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientBeneficiaires,
  createClientBeneficiaire,
  updateClientBeneficiaire,
  activateClientBeneficiaire,
  deactivateClientBeneficiaire,
  deleteClientBeneficiaire,
} from '../../app/clientBeneficiairesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { ClientBeneficiaire } from '../../app/clientBeneficiairesSlice';
import { FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiLoader, FiUserCheck, FiTag } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientBeneficiairePage = () => {
  const dispatch = useAppDispatch();
  const { data: clients, loading, error: globalError } = useSelector((state: RootState) => state.clientBeneficiaires);

  // Load initial
  useEffect(() => {
    dispatch(fetchClientBeneficiaires());
  }, [dispatch]);

  // UI States
  const [activeModal, setActiveModal] = useState<'none' | 'form'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientBeneficiaire | null>(null);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Form States
  const [libelle, setLibelle] = useState('');
  const [statut, setStatut] = useState<'ACTIF' | 'INACTIF'>('ACTIF');

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setEditingClient(null);
    setLibelle('');
    setStatut('ACTIF');
    setMessage({ text: '', isError: false });
  };

  const handleAction = async (actionFn: any, payload: any) => {
    setIsSubmitting(true);
    await dispatch(actionFn(payload));
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dateApplication = new Date().toISOString(); // Date actuelle pour création

    if (editingClient) {
      // Update
      const result = await dispatch(updateClientBeneficiaire({ id: editingClient.id, libelle, statut }));
      if (updateClientBeneficiaire.fulfilled.match(result)) {
        setMessage({ text: 'Client bénéficiaire mis à jour !', isError: false });
        setTimeout(closeModals, 1500);
      } else {
        setMessage({ text: 'Une erreur est survenue.', isError: true });
      }
    } else {
      // Create
      const result = await dispatch(createClientBeneficiaire({ libelle, statut, dateApplication }));
      if (createClientBeneficiaire.fulfilled.match(result)) {
        setMessage({ text: 'Client bénéficiaire créé !', isError: false });
        setTimeout(closeModals, 1500);
      } else {
        setMessage({ text: 'Une erreur est survenue.', isError: true });
      }
    }
    setIsSubmitting(false);
  };

  const openEdit = (client: ClientBeneficiaire) => {
    setEditingClient(client);
    setLibelle(client.libelle);
    setStatut(client.statut);
    setActiveModal('form');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay loading */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Traitement...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiUserCheck className="text-indigo-600" /> Clients Bénéficiaires
          </h2>
          <p className="text-gray-500 font-medium italic">Gérez les bénéficiaires des transactions.</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setActiveModal('form'); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Nouveau Client Bénéficiaire
        </button>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold italic">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 text-left">Code</th>
              <th className="px-6 py-5 text-left">Libellé</th>
              <th className="px-6 py-5 text-left">Statut</th>
              <th className="px-6 py-5 text-left">Date d'application</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-xs font-mono font-black bg-gray-50 text-indigo-600 px-3 py-1 rounded-lg border border-gray-100">
                    <FiTag size={12} /> {client.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                      <FiUserCheck size={18} />
                    </div>
                    <span className="text-gray-900 font-black text-sm">{client.libelle}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    client.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${client.statut === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {client.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {new Date(client.dateApplication).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                    <button onClick={() => openEdit(client)} className="text-blue-600 hover:underline">Modifier</button>
                    <button 
                      onClick={() => handleAction(client.statut === 'ACTIF' ? deactivateClientBeneficiaire : activateClientBeneficiaire, { id: client.id })}
                      className={client.statut === 'ACTIF' ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'}
                    >
                      {client.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => { setAuditEntityId(client.id); setAuditEntityName(client.libelle); }}
                      className="text-purple-600 hover:underline"
                    >
                      Historique
                    </button>
                    <button onClick={() => window.confirm('Supprimer ?') && handleAction(deleteClientBeneficiaire, { id: client.id })} className="text-red-500 hover:underline border-l border-gray-100 pl-4">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && clients.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FiLoader className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement des clients bénéficiaires...</p>
          </div>
        )}
      </div>

      {/* MODALE FORMULAIRE */}
      {activeModal === 'form' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {editingClient ? 'Édition Client Bénéficiaire' : 'Nouveau Client Bénéficiaire'}
              </h3>
              <button onClick={closeModals} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Libellé</label>
                  <input 
                    type="text" 
                    placeholder="ex: Client bénéficiaire A" 
                    value={libelle} 
                    onChange={(e) => setLibelle(e.target.value)} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Statut</label>
                  <select 
                    value={statut} 
                    onChange={(e) => setStatut(e.target.value as 'ACTIF' | 'INACTIF')} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  >
                    <option value="ACTIF">ACTIF</option>
                    <option value="INACTIF">INACTIF</option>
                  </select>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-xs ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  {message.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-4 border border-gray-100 rounded-2xl font-black text-gray-400 uppercase text-xs tracking-widest hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal
        entity="CLIENT_BENEFICIAIRE"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={() => setAuditEntityId(null)}
      />
    </div>
  );
};

export default ClientBeneficiairePage;