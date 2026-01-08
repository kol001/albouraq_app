import { useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  updateClientBeneficiaire,
  fetchClientBeneficiaires,
} from '../../../app/back_office/clientBeneficiairesSlice';
import {
  addBeneficiaireToClientFacture,
  removeBeneficiaireFromClientFacture,
} from '../../../app/back_office/clientFacturesSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import { FiArrowLeft, FiTrash2, FiSearch, FiPlus, FiLoader, FiChevronUp, FiChevronDown, FiUserPlus} from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ScrollIndicator = ({ listRef }: { listRef: React.RefObject<HTMLDivElement | null> }) => {
    const scroll = (direction: 'up' | 'down') => {
      listRef.current?.scrollBy({ 
        top: direction === 'up' ? -120 : 120, 
        behavior: 'smooth' 
      });
    };

    return (
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button type="button" onClick={() => scroll('up')} className="p-1 hover:bg-white hover:shadow-sm rounded text-indigo-600 transition-all">
          <FiChevronUp size={14} />
        </button>
        <button type="button" onClick={() => scroll('down')} className="p-1 hover:bg-white hover:shadow-sm rounded text-indigo-600 transition-all">
          <FiChevronDown size={14} />
        </button>
      </div>
    );
  };

const ClientBeneficiaireFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: beneficiaires } = useSelector((state: RootState) => state.clientBeneficiaires);
  const { data: clientFactures } = useSelector((state: RootState) => state.clientFactures);

  const scrollAssocRef = useRef<HTMLDivElement>(null);
  const scrollAvailRef = useRef<HTMLDivElement>(null);

  const currentBeneficiaire = beneficiaires.find(b => b.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [searchFacture, setSearchFacture] = useState('');

  const [libelle, setLibelle] = useState(currentBeneficiaire?.libelle ?? '');

  const [statut, setStatut] = useState<'ACTIF' | 'INACTIF'>(
    (currentBeneficiaire?.statut as 'ACTIF' | 'INACTIF') ?? 'ACTIF'
  );

  const isFormInvalid = !libelle.trim();

  const handleSubmit = async () => {
    if (!currentBeneficiaire) return;

    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    const result = await dispatch(updateClientBeneficiaire({
      id: currentBeneficiaire.id,
      libelle,
      statut
    }));

    if (updateClientBeneficiaire.fulfilled.match(result)) {
      setMessage({ text: 'Modifications enregistrées avec succès !', isError: false });
      setTimeout(() => navigate(-1), 1500);
    } else {
      setMessage({ text: 'Erreur lors de la sauvegarde.', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleAddClientFacture = async (clientFactureId: string) => {
    setIsSubmitting(true);
    const result = await dispatch(addBeneficiaireToClientFacture({
      id: clientFactureId,
      beneficiaireId: id!
    }));
    
    if (addBeneficiaireToClientFacture.fulfilled.match(result)) {
      setMessage({ text: 'Association réussie !', isError: false });
      // On efface le message après 2 secondes pour ne pas polluer l'écran
      setTimeout(() => setMessage({ text: '', isError: false }), 2000);
    }
    
    await dispatch(fetchClientBeneficiaires());
    setIsSubmitting(false);
  };

  const handleRemoveClientFacture = async (clientFactureId: string) => {
    setIsSubmitting(true);

    const result = await dispatch(removeBeneficiaireFromClientFacture({
      id: clientFactureId,
      beneficiaireId: id!
    }));
    
    if (removeBeneficiaireFromClientFacture.fulfilled.match(result)) {
      setMessage({ text: 'Association supprimée !', isError: false });
      // On efface le message après 2 secondes pour ne pas polluer l'écran
      setTimeout(() => setMessage({ text: '', isError: false }), 2000);
    }
    await dispatch(removeBeneficiaireFromClientFacture({
      id: clientFactureId,
      beneficiaireId: id!
    }));
    await dispatch(fetchClientBeneficiaires());
    setIsSubmitting(false);
  };


  const hasChanges = useMemo(() => {
    if (!currentBeneficiaire) return false;
    return libelle !== currentBeneficiaire.libelle || statut !== currentBeneficiaire.statut;
  }, [libelle, statut, currentBeneficiaire]);

  const availableClientFactures = useMemo(() => {
    const linkedIds = currentBeneficiaire?.factures.map(f => f.clientFacture.id) || [];
    return clientFactures.filter(cf =>
      !linkedIds.includes(cf.id) &&
      (cf.libelle.toLowerCase().includes(searchFacture.toLowerCase()) ||
       cf.code.toLowerCase().includes(searchFacture.toLowerCase()))
    );
  }, [clientFactures, currentBeneficiaire, searchFacture]);

  if (!currentBeneficiaire) {
    return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  }


  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header avec retour */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-all">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Édition : {currentBeneficiaire.libelle}
          </h2>
          <p className="text-gray-500 italic">Code : {currentBeneficiaire.code}</p>
        </div>
      </div>

      {message.text && (
        <div className={`fixed top-20 right-20 z-100 p-8 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {message.isError ? <FiTrash2 /> : <FiUserPlus />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Colonne gauche : Infos principales */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white border border-gray-100 p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Informations Générales</h4>
            <div className="space-y-6">
              <div className={`relative transition-all ${!libelle ? 'ring-2 ring-red-100' : ''}`}>
                <input
                  type="text"
                  placeholder="NOM DU BÉNÉFICIAIRE"
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value.toUpperCase())} // Force majuscule pour la cohérence
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
                {!libelle && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-400">REQUIS</span>}
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as 'ACTIF' | 'INACTIF')}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-medium"
                >
                  <option value="ACTIF">ACTIF</option>
                  <option value="INACTIF">INACTIF</option>
                </select>
              </div>
            </div>
          </section>

          {/* Boutons d'action en bas */}
          <div className="max-w-[1600px] mx-auto flex justify-end gap-4 mt-12">
            {/* <button 
              onClick={() => navigate(-1)} 
              className="px-8 py-4 border border-gray-300 rounded-2xl font-black text-gray-600 uppercase text-xs tracking-widest hover:bg-gray-50 transition-all"
            >
              Annuler
            </button> */}

            {/* Nouveau bouton : Informations complémentaires */}
            <button
              onClick={() => navigate(`infos`)}
              className="px-10 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
            >
              <FiUserPlus size={18} />
              Informations Complémentaires
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges || isFormInvalid}
              className={`px-12 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 uppercase text-xs tracking-widest transition-all ${
                hasChanges && !isFormInvalid
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting && <FiLoader className="animate-spin" />}
              {hasChanges ? 'Enregistrer les modifications' : 'Aucune modification'}
            </button>
          </div>
        </div>

        {/* Colonne droite : Clients Factures liés */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-100 p-8 h-full flex flex-col rounded-3xl">
            
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Clients Facturés Associés</h4>
              {/* Flèches pour la liste du haut (Associés) */}
              {currentBeneficiaire.factures.length > 3 && <ScrollIndicator listRef={scrollAssocRef} />}
            </div>

            {/* Liste 1 : Associés */}
            <div 
              ref={scrollAssocRef}
              className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[400px] scroll-smooth custom-scrollbar"
            >
              {currentBeneficiaire.factures.map((f) => (
                <div key={f.clientFacture.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-indigo-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{f.clientFacture.libelle}</p>
                    <p className="text-xs text-gray-500 font-mono">CODE: {f.clientFacture.code}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveClientFacture(f.clientFacture.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
              {currentBeneficiaire.factures.length === 0 && (
                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 italic text-sm">Aucun client facturé associé</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disponibles pour association</p>
                {/* Flèches pour la liste du bas (Disponibles) */}
                {availableClientFactures.length > 3 && <ScrollIndicator listRef={scrollAvailRef} />}
              </div>

              <div className="relative mb-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un client facturé..."
                  value={searchFacture}
                  onChange={(e) => setSearchFacture(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Liste 2 : Disponibles */}
              <div 
                ref={scrollAvailRef}
                className="max-h-64 overflow-y-auto space-y-2 scroll-smooth custom-scrollbar"
              >
                {availableClientFactures.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => handleAddClientFacture(cf.id)}
                    className="w-full text-left p-4 hover:bg-indigo-50 rounded-2xl flex justify-between items-center transition-all border border-transparent hover:border-indigo-100 group"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-700">{cf.libelle}</p>
                      <p className="text-xs text-gray-400">{cf.code}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <FiPlus size={16} />
                    </div>
                  </button>
                ))}
                {availableClientFactures.length === 0 && searchFacture && (
                  <p className="text-center text-xs text-gray-400 py-4 italic">Aucun résultat pour cette recherche</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBeneficiaireFormPage;