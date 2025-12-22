import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientFactures,
  createClientFacture,
  updateClientFacture,
  activateClientFacture,
  deactivateClientFacture,
  deleteClientFacture,
  addBeneficiaireToClientFacture,
  removeBeneficiaireFromClientFacture,
} from '../../app/clientFacturesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { 
  FiPlus, FiX, FiTag, FiTrash2, FiSearch, FiUserPlus, FiUsers, FiLoader, FiInfo
} from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';
import type { ClientFacture } from '../../app/clientFacturesSlice';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientFacturePage = () => {
  const dispatch = useAppDispatch();
  
  const { data: clients, loading, error: globalError } = useSelector((state: RootState) => state.clientFactures);
  const { data: allBeneficiaires } = useSelector((state: RootState) => state.clientBeneficiaires);

  const [activeModal, setActiveModal] = useState<'none' | 'form'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [searchTerm, setSearchTerm] = useState('');

  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const currentClient = useMemo(() => 
    clients.find(c => c.id === editingClientId) || null
  , [clients, editingClientId]);

  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const [formData, setFormData] = useState({
    code: 'CLT-001',
    libelle: '',
    profilRisque: 'FAIBLE' as 'FAIBLE' | 'MOYEN' | 'ELEVE',
    tauxBase: 0,
    volDomestique: 3,
    volRegional: 2,
    longCourrier: 1,
    auComptant: 0,
    credit15jrs: 0.5,
    credit30jrs: 1,
    credit60jrs: 2,
    credit90jrs: 3,
    statut: 'ACTIF' as 'ACTIF' | 'INACTIF'
  });

  useEffect(() => {
    dispatch(fetchClientFactures());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      code: 'CLT-001', libelle: '', profilRisque: 'FAIBLE',
      tauxBase: 0, volDomestique: 3, volRegional: 2, longCourrier: 1,
      auComptant: 0, credit15jrs: 0.5, credit30jrs: 1, credit60jrs: 2, credit90jrs: 3,
      statut: 'ACTIF'
    });
    setEditingClientId(null);
    setSearchTerm('');
    setMessage({ text: '', isError: false });
  };

  const openEdit = (client: any) => {
    setEditingClientId(client.id);
    setFormData({
      code: client.code,
      libelle: client.libelle,
      profilRisque: client.profilRisque,
      tauxBase: client.tauxBase,
      volDomestique: client.volDomestique,
      volRegional: client.volRegional,
      longCourrier: client.longCourrier,
      auComptant: client.auComptant,
      credit15jrs: client.credit15jrs,
      credit30jrs: client.credit30jrs,
      credit60jrs: client.credit60jrs,
      credit90jrs: client.credit90jrs,
      statut: client.statut
    });
    setActiveModal('form');
  };

  const handleAction = async (actionFn: any, payload: any) => {
    setIsSubmitting(true);
    await dispatch(actionFn(payload));
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingClientId) {
      const result = await dispatch(updateClientFacture({ id: editingClientId, ...formData }));
      if (updateClientFacture.fulfilled.match(result)) {
        setMessage({ text: 'Client mis à jour !', isError: false });
        setTimeout(() => setActiveModal('none'), 1500);
      }
    } else {
      const result = await dispatch(createClientFacture({ ...formData, dateApplication: new Date().toISOString() }));
      if (createClientFacture.fulfilled.match(result)) {
        setMessage({ text: 'Client créé ! Vous pouvez maintenant y ajouter des bénéficiaires.', isError: false });
        setTimeout(() => setActiveModal('none'), 2000);
      }
    }
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

  const availableBeneficiaires = useMemo(() => {
    return allBeneficiaires.filter(ben => {
      const alreadyLinked = currentClient?.beneficiaires.some(link => link.clientBeneficiaireId === ben.id);
      const matchesSearch = ben.libelle.toLowerCase().includes(searchTerm.toLowerCase()) || ben.code.toLowerCase().includes(searchTerm.toLowerCase());
      return !alreadyLinked && matchesSearch;
    });
  }, [allBeneficiaires, currentClient, searchTerm]);

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
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiUsers className="text-indigo-600" /> Clients Factures
          </h2>
          <p className="text-gray-500 font-medium italic">Paramétrage des comptes et gestion des bénéficiaires.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setActiveModal('form'); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
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
                    <button onClick={() => openEdit(client)} className="text-blue-600 hover:underline">Modifier</button>
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

      {activeModal === 'form' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                {editingClientId ? 'Configuration Client Facture' : 'Nouveau Client Facture'}
              </h3>
              <button onClick={() => setActiveModal('none')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                <div className="lg:col-span-8 space-y-8">
                  <section>
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">Identité & Risque</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Code</label>
                        <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black focus:ring-4 focus:ring-indigo-500/10 outline-none" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Libellé</label>
                        <input type="text" value={formData.libelle} onChange={e => setFormData({...formData, libelle: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black focus:ring-4 focus:ring-indigo-500/10 outline-none" required />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Profil Risque</label>
                        <select value={formData.profilRisque} onChange={e => setFormData({...formData, profilRisque: e.target.value as any})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black outline-none">
                          <option value="FAIBLE">FAIBLE</option>
                          <option value="MOYEN">MOYEN</option>
                          <option value="ELEVE">ELEVE</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b pb-2">Conditions Commerciales (%)</h4>
                    <div className="grid grid-cols-3 gap-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100">
                      {['tauxBase', 'volDomestique', 'volRegional', 'longCourrier', 'auComptant', 'credit15jrs', 'credit30jrs', 'credit60jrs', 'credit90jrs'].map(key => (
                        <div key={key}>
                          <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">{key}</label>
                          <input type="number" step="0.01" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: parseFloat(e.target.value)})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-black text-sm outline-none" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* COLONNE DROITE : BÉNÉFICIAIRES (Conditionnelle) */}
                <div className="lg:col-span-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col">
                  {editingClientId ? (
                    <>
                      <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-4">Bénéficiaires Associés</h4>
                      <div className="flex-1 space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
                        {currentClient?.beneficiaires.map((link) => (
                          <div key={link.clientBeneficiaireId} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-gray-800">{link.clientBeneficiaire?.libelle}</span>
                              <span className="text-[9px] font-bold text-gray-400">{link.clientBeneficiaire?.code}</span>
                            </div>
                            <button type="button" onClick={() => handleAction(removeBeneficiaireFromClientFacture, { id: currentClient.id, beneficiaireId: link.clientBeneficiaireId })} className="text-red-400 hover:text-red-600 p-1.5"><FiTrash2 size={14}/></button>
                          </div>
                        ))}
                        {currentClient?.beneficiaires.length === 0 && (
                          <div className="text-center py-10 text-gray-300 italic text-xs font-bold">Aucun lien établi</div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="relative mb-4">
                          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" placeholder="Ajouter un bénéficiaire..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {availableBeneficiaires.map(ben => (
                            <button
                              key={ben.id}
                              type="button"
                              onClick={() => handleAction(addBeneficiaireToClientFacture, { id: editingClientId, beneficiaireId: ben.id })}
                              className="w-full flex items-center justify-between p-3 hover:bg-indigo-600 hover:text-white rounded-xl transition-all group text-left"
                            >
                              <span className="text-[10px] font-black uppercase">{ben.libelle}</span>
                              <FiUserPlus />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                      <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full mb-4">
                        <FiInfo size={32} />
                      </div>
                      <h5 className="text-sm font-black text-gray-800 uppercase mb-2">Note de création</h5>
                      <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
                        L'association des bénéficiaires se fait uniquement après la création du client facturé.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {message.text && (
                  <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveModal('none')} className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Annuler</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

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