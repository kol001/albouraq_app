import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClientBeneficiaires,
  createClientBeneficiaire,
  updateClientBeneficiaire,
  activateClientBeneficiaire,
  deactivateClientBeneficiaire,
  deleteClientBeneficiaire,
} from '../../app/clientBeneficiairesSlice';
import {
  addBeneficiaireToClientFacture,
  removeBeneficiaireFromClientFacture,
} from '../../app/clientFacturesSlice'; // ← Ajout important
import type { RootState, AppDispatch } from '../../app/store';
import type { ClientBeneficiaire } from '../../app/clientBeneficiairesSlice';
import { FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiLoader, FiUserCheck, FiTag, FiSearch, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';
import { useNavigate } from 'react-router-dom';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientBeneficiairePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: beneficiaires, loading, error: globalError } = useSelector((state: RootState) => state.clientBeneficiaires);
  const { data: clientFactures } = useSelector((state: RootState) => state.clientFactures); // ← Pour la liste et recherche

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

  // Gestion des Clients Factures liés
  const [searchFacture, setSearchFacture] = useState('');

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  // États pour la recherche globale
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    codeBen: true,
    libelleBen: true,
    codeFact: false,
    libelleFact: false,
  });

  // Fonction pour basculer les filtres
  const toggleFilter = (filter: keyof typeof searchFilters) => {
    setSearchFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const closeModals = () => {
    setActiveModal('none');
    setEditingClient(null);
    setLibelle('');
    setStatut('ACTIF');
    setSearchFacture('');
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

    const dateApplication = new Date().toISOString();

    if (editingClient) {
      const result = await dispatch(updateClientBeneficiaire({ id: editingClient.id, libelle, statut }));
      if (updateClientBeneficiaire.fulfilled.match(result)) {
        setMessage({ text: 'Client bénéficiaire mis à jour !', isError: false });
        setTimeout(closeModals, 1500);
      } else {
        setMessage({ text: 'Une erreur est survenue.', isError: true });
      }
    } else {
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

  // const openEdit = (client: ClientBeneficiaire) => {
  //   setEditingClient(client);
  //   setLibelle(client.libelle);
  //   setStatut(client.statut);
  //   setActiveModal('form');
  // };

  // Clients Factures disponibles (non déjà liés + recherche)
  const availableClientFactures = useMemo(() => {
    if (!editingClient) return [];
    const linkedFactureIds = editingClient.factures.map(f => f.clientFacture.id);
    return clientFactures.filter(cf =>
      !linkedFactureIds.includes(cf.id) &&
      (cf.libelle.toLowerCase().includes(searchFacture.toLowerCase()) ||
       cf.code.toLowerCase().includes(searchFacture.toLowerCase()))
    );
  }, [clientFactures, editingClient, searchFacture]);

  // Ajouter un Client Facture au Bénéficiaire
  const handleAddClientFacture = async (clientFactureId: string) => {
    if (editingClient) {
      setIsSubmitting(true);
      const result = await dispatch(addBeneficiaireToClientFacture({
        id: clientFactureId,
        beneficiaireId: editingClient.id
      }));

      if (addBeneficiaireToClientFacture.fulfilled.match(result)) {
        // Rafraîchir la liste des bénéficiaires pour voir le nouveau lien
        await dispatch(fetchClientBeneficiaires());
      }
      setIsSubmitting(false);
    }
  };

  const handleRemoveClientFacture = async (clientFactureId: string) => {
    if (editingClient) {
      setIsSubmitting(true);
      const result = await dispatch(removeBeneficiaireFromClientFacture({
        id: clientFactureId,
        beneficiaireId: editingClient.id
      }));

      if (removeBeneficiaireFromClientFacture.fulfilled.match(result)) {
        // Rafraîchir après suppression
        await dispatch(fetchClientBeneficiaires());
      }
      setIsSubmitting(false);
    }
  };


  const filteredBeneficiaires = useMemo(() => {
    if (!globalSearch) return beneficiaires;

    const search = globalSearch.toLowerCase();
    
    return beneficiaires.filter((ben) => {
      // Vérification Bénéficiaire
      const matchCodeBen = searchFilters.codeBen && ben.code.toLowerCase().includes(search);
      const matchLibelleBen = searchFilters.libelleBen && ben.libelle.toLowerCase().includes(search);

      // Vérification Client Facturé (dans la liste des factures liées)
      const matchCodeFact = searchFilters.codeFact && ben.factures.some(f => 
        f.clientFacture.code.toLowerCase().includes(search)
      );
      const matchLibelleFact = searchFilters.libelleFact && ben.factures.some(f => 
        f.clientFacture.libelle.toLowerCase().includes(search)
      );

      return matchCodeBen || matchLibelleBen || matchCodeFact || matchLibelleFact;
    });
  }, [beneficiaires, globalSearch, searchFilters]);

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
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiUserCheck className="text-indigo-600" />Clients Bénéficiaires
            </h2>
            <p className="text-gray-500 font-medium italic">Gérez les bénéficiaires et leurs clients facturés.</p>
          </div>
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

      {/* BARRE DE RECHERCHE AVANCÉE */}
      <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
          <input
            type="text"
            placeholder="Recherche globale avancée..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mr-2">Chercher dans :</span>
          
          {[
            { id: 'codeBen', label: 'Code Bénéficiaire', color: 'blue' },
            { id: 'libelleBen', label: 'Libélle Bénéficiaire', color: 'blue' },
            { id: 'codeFact', label: 'Code Facturé', color: 'emerald' },
            { id: 'libelleFact', label: 'Libélle Facturé', color: 'emerald' },
          ].map((filter) => (
            <label 
              key={filter.id} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                searchFilters[filter.id as keyof typeof searchFilters] 
                ? `bg-${filter.color}-50 border-${filter.color}-200 text-${filter.color}-700 shadow-sm` 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={searchFilters[filter.id as keyof typeof searchFilters]}
                onChange={() => toggleFilter(filter.id as keyof typeof searchFilters)}
              />
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                searchFilters[filter.id as keyof typeof searchFilters] ? `bg-${filter.color}-500 border-transparent` : 'border-gray-300'
              }`}>
                {searchFilters[filter.id as keyof typeof searchFilters] && <FiCheckCircle className="text-white" size={10} />}
              </div>
              <span className="text-xs font-black uppercase tracking-tighter">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white border border-gray-100 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 text-left">Code client Bénéficiaire</th>
              <th className="px-6 py-5 text-left">Libellé client Bénéficiaire</th>
              <th className="px-6 py-5 text-left">Code Client Facturé</th>
              <th className="px-6 py-5 text-left">Libellé Client Facturé</th>
              <th className="px-6 py-5 text-left">Statut</th>
              <th className="px-6 py-5 text-left">Date Application</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {filteredBeneficiaires.map((client) => (
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
                  <div className="flex flex-wrap gap-2">
                    {client.factures.map((f) => (
                      <span key={f.clientFacture.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                        {f.clientFacture.code}
                      </span>
                    ))}
                    {client.factures.length === 0 && <span className="text-gray-400 italic text-xs">Aucun</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {client.factures.map((f) => (
                      <span key={f.clientFacture.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                        {f.clientFacture.libelle}
                      </span>
                    ))}
                    {client.factures.length === 0 && <span className="text-gray-400 italic text-xs">Aucun</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    client.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 
                    client.statut === 'CREER' ? 'bg-blue-100 text-blue-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      client.statut === 'ACTIF' ? 'bg-green-500' : 
                      client.statut === 'CREER' ? 'bg-blue-500' : 
                      'bg-red-500'
                    }`} />
                    {/* Affichage du texte : 'Créé' si le statut est 'CREER' */}
                    {client.statut === 'CREER' ? 'Créé' : client.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {new Date(client.dateApplication).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-4 text-[11px] font-black uppercase tracking-tighter">
                    <button 
                      onClick={() => navigate(`/parametre/client-beneficiaire/${client.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
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
                      Tracer
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
        {loading && beneficiaires.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FiLoader className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Chargement des clients bénéficiaires...</p>
          </div>
        )}

        {filteredBeneficiaires.length === 0 && !loading && (
          <tr>
            <td colSpan={7} className="p-20 text-center">
              <p className="text-gray-400 font-medium italic">Aucun résultat ne correspond à votre recherche.</p>
            </td>
          </tr>
        )}
      </div>

      {/* MODALE FORMULAIRE */}
      {activeModal === 'form' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {editingClient ? 'Édition Client Bénéficiaire' : 'Nouveau Client Bénéficiaire'}
              </h3>
              <button onClick={closeModals} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Section Clients Factures liés (uniquement en édition) */}
              {editingClient && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-black text-gray-800 uppercase mb-4">Clients Factures Associés</h4>
                  <div className="space-y-3 mb-6">
                    {editingClient.factures.map((f) => (
                      <div key={f.clientFacture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                        <div>
                          <p className="font-bold text-sm">{f.clientFacture.libelle}</p>
                          <p className="text-xs text-gray-500">{f.clientFacture.code}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveClientFacture(f.clientFacture.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {editingClient.factures.length === 0 && (
                      <p className="text-center text-gray-400 italic py-4">Aucun client facture associé</p>
                    )}
                  </div>

                  <div>
                    <div className="relative mb-3">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Rechercher un client facture à ajouter..."
                        value={searchFacture}
                        onChange={(e) => setSearchFacture(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {availableClientFactures.map((cf) => (
                        <button
                          key={cf.id}
                          type="button"
                          onClick={() => handleAddClientFacture(cf.id)}
                          className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-sm">{cf.libelle}</p>
                            <p className="text-xs text-gray-500">{cf.code}</p>
                          </div>
                          <FiPlus className="text-indigo-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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