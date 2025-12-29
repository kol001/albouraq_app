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
  FiPlus, FiActivity, FiPower,FiTrash2,FiEdit2, FiUsers, FiLoader, FiArrowLeft
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Traitement en cours...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiUsers className="text-indigo-600" /> Clients Facturés
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
      <div className="bg-white border border-gray-100 shadow-xl shadow-gray-100/40 overflow-hidden transition-all">
        {/* Wrapper avec scroll horizontal et scrollbar personnalisée */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-30">
              <tr className="uppercase text-[10px] font-black text-gray-400 tracking-[0.15em]">
                {/* Colonne FIGÉE à gauche */}
                <th className="sticky left-0 z-40 bg-gray-50 px-6 py-5 text-left border-b border-gray-100 whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  Client Facturé
                </th>
                
                {/* Colonnes standards */}
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap bg-indigo-50/10 text-indigo-500">Risque</th>
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap">Taux Base</th>
                
                {/* Groupe Vol */}
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap bg-gray-50/50 italic">Domestique</th>
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap bg-gray-50/50 italic">Régional</th>
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap bg-gray-50/50 italic">Long Courrier</th>
                
                {/* Groupe Crédit */}
                <th className="px-4 py-5 text-center border-b border-gray-100 whitespace-nowrap font-bold text-gray-500">Comptant</th>
                <th className="px-4 py-5 text-center border-b border-gray-100 whitespace-nowrap">Crd 15j</th>
                <th className="px-4 py-5 text-center border-b border-gray-100 whitespace-nowrap">Crd 30j</th>
                <th className="px-4 py-5 text-center border-b border-gray-100 whitespace-nowrap">Crd 60j</th>
                <th className="px-4 py-5 text-center border-b border-gray-100 whitespace-nowrap">Crd 90j</th>
                
                <th className="px-6 py-5 text-left border-b border-gray-100 whitespace-nowrap">Bénéficiaires</th>
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap">Statut</th>
                <th className="px-6 py-5 text-center border-b border-gray-100 whitespace-nowrap">Date Application</th>
                {/* Colonne FIGÉE à droite */}
                <th className="sticky right-0 z-40 bg-gray-50 px-6 py-5 text-right border-b border-gray-100 whitespace-nowrap shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50 bg-white">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-indigo-50/20 transition-colors group">
                  {/* CLIENT (FIGÉ) */}
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-indigo-50/5 transition-colors px-6 py-4 whitespace-nowrap border-r border-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-500 font-mono tracking-tighter mb-0.5 uppercase">#{client.code}</span>
                      <span className="text-sm font-black text-gray-900 uppercase leading-none">{client.libelle}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black text-gray-500 uppercase tracking-tighter italic">
                      {client.profilRisque || '—'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-800 text-xs tracking-tighter">
                    {client.tauxBase}
                  </td>

                  {/* VOLS */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-600 bg-gray-50/20">{client.volDomestique}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-600 bg-gray-50/20">{client.volRegional}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-600 bg-gray-50/20">{client.longCourrier}</td>

                  {/* CRÉDITS (Épurés avec opacité sur les zéros si besoin) */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-bold text-indigo-600">{client.auComptant}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-600">{client.credit15jrs}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-600">{client.credit30jrs}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-600">{client.credit60jrs}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-600">{client.credit90jrs}</td>

                  {/* BÉNÉFICIAIRES */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2 overflow-hidden">
                      {client.beneficiaires.slice(0, 3).map((link, idx) => (
                        <div key={idx} className="inline-flex items-center justify-center bg-white border-2 border-indigo-50 text-[8px] font-black text-indigo-600 uppercase shadow-sm" title={link.clientBeneficiaire?.libelle}>
                          {link.clientBeneficiaire?.libelle || '?'}
                        </div>
                      ))}
                      {client.beneficiaires.length > 3 && (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-[8px] font-black text-white border-2 border-white">
                          +{client.beneficiaires.length - 3}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* STATUT */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest ${
                      client.statut === 'ACTIF' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {client.statut}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-600">{new Date(client.dateApplication).toLocaleDateString('fr-FR')}</td>

                  {/* ACTIONS (FIGÉ) */}
                  <td className="sticky right-0 z-20 bg-white group-hover:bg-indigo-50/5 transition-colors px-6 py-4 whitespace-nowrap border-l border-gray-50 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/parametre/client-facture/${client.id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <FiEdit2 size={16} />
                        {/* Modifier */}
                      </button>
                      <button 
                        onClick={() => openAudit(client)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                      >
                        <FiActivity size={16} />
                      </button>
                      <button 
                        onClick={() => handleAction(client.statut === 'ACTIF' ? deactivateClientFacture : activateClientFacture, { id: client.id })}
                        className={`p-2 rounded-xl transition-all ${client.statut === 'ACTIF' ? 'text-amber-400 hover:bg-amber-50' : 'text-emerald-400 hover:bg-emerald-50'}`}
                      >
                        <FiPower size={16} />
                      </button>
                      <button 
                        onClick={() => window.confirm('Supprimer ?') && handleAction(deleteClientFacture, { id: client.id })}
                        className="p-2 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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