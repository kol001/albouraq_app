import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientFactures,
  activateClientFacture,
  deactivateClientFacture,
  deleteClientFacture,
} from '../../app/clientFacturesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { 
  FiPlus, FiTag, FiUsers, FiLoader, FiArrowLeft
} from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';
import type { ClientFacture } from '../../app/clientFacturesSlice';
import { useNavigate } from 'react-router-dom';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientFacturePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: clients } = useSelector((state: RootState) => state.clientFactures);

  const [isSubmitting, setIsSubmitting] = useState(false);


  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  useEffect(() => {
    dispatch(fetchClientFactures());
  }, [dispatch]);

  const handleAction = async (actionFn: any, payload: any) => {
    setIsSubmitting(true);
    await dispatch(actionFn(payload));
    setIsSubmitting(false);
  };

  const openAudit = (clientFacture: ClientFacture) => {
      setAuditEntityId(clientFacture.id);
      setAuditEntityName(clientFacture.libelle);
    };

  const closeAudit = () => {
    setAuditEntityId(null);
    setAuditEntityName('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* OVERLAY DE CHARGEMENT ACTION */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Traitement en cours...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiUsers className="text-indigo-600" /> Clients Facturers
            </h2>
            <p className="text-gray-500 font-medium italic">Paramétrage des comptes et gestion des bénéficiaires.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/parametre/client-facture/nouveau')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
          <FiPlus size={20} /> Nouveau Client
        </button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 text-left">Code</th>
              <th className="px-6 py-5 text-left">Libellé</th>
              <th className="px-6 py-5 text-left">Risque</th>
              <th className="px-6 py-5 text-left">Bénéficiaires</th>
              <th className="px-6 py-5 text-left">Statut</th>
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
                <td className="px-6 py-4 font-black text-gray-900 text-sm uppercase">{client.libelle}</td>
                <td className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">{client.profilRisque}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {client.beneficiaires.slice(0, 2).map((link) => (
                      <span key={link.clientBeneficiaireId} className="px-2 py-0.5 bg-gray-100 text-[10px] rounded-md font-bold text-gray-600 uppercase border border-gray-200">
                        {link.clientBeneficiaire?.libelle}
                      </span>
                    ))}
                    {client.beneficiaires.length > 2 && <span className="text-[10px] font-bold text-indigo-600">+{client.beneficiaires.length - 2}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${client.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {client.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3 text-[11px] font-black uppercase tracking-tighter">
                    <button onClick={() => navigate(`/parametre/client-facture/${client.id}`)} className="text-blue-600 hover:underline">
                      Modifier
                    </button>
                    <button onClick={() => handleAction(client.statut === 'ACTIF' ? deactivateClientFacture : activateClientFacture, { id: client.id })} className="text-amber-600 hover:underline">Désactiver</button>
                    <button onClick={() => openAudit(client)} className="text-purple-600 hover:text-purple-800">Historique</button>
                    <button onClick={() => window.confirm('Supprimer ?') && handleAction(deleteClientFacture, { id: client.id })} className="text-red-500 hover:underline">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AuditModal
        entity="CLIENT_FACTURE"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={closeAudit}
      />
    </div>
  );
};

export default ClientFacturePage;