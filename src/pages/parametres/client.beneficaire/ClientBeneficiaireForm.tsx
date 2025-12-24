import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  updateClientBeneficiaire,
  fetchClientBeneficiaires,
} from '../../../app/clientBeneficiairesSlice';
import {
  addBeneficiaireToClientFacture,
  removeBeneficiaireFromClientFacture,
} from '../../../app/clientFacturesSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import { FiArrowLeft, FiTrash2, FiSearch, FiPlus, FiLoader } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientBeneficiaireFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: beneficiaires } = useSelector((state: RootState) => state.clientBeneficiaires);
  const { data: clientFactures } = useSelector((state: RootState) => state.clientFactures);

  const currentBeneficiaire = beneficiaires.find(b => b.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [searchFacture, setSearchFacture] = useState('');

  const [libelle, setLibelle] = useState('');
  const [statut, setStatut] = useState<'ACTIF' | 'INACTIF'>('ACTIF');

  useEffect(() => {
    if (currentBeneficiaire) {
    //   setLibelle(currentBeneficiaire.libelle);
    //   setStatut(currentBeneficiaire.statut);
    }
  }, [currentBeneficiaire]);

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
      setTimeout(() => navigate('/parametre/client-beneficiaire'), 1500);
    } else {
      setMessage({ text: 'Erreur lors de la sauvegarde.', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleAddClientFacture = async (clientFactureId: string) => {
    setIsSubmitting(true);
    await dispatch(addBeneficiaireToClientFacture({
      id: clientFactureId,
      beneficiaireId: id!
    }));
    await dispatch(fetchClientBeneficiaires());
    setIsSubmitting(false);
  };

  const handleRemoveClientFacture = async (clientFactureId: string) => {
    setIsSubmitting(true);
    await dispatch(removeBeneficiaireFromClientFacture({
      id: clientFactureId,
      beneficiaireId: id!
    }));
    await dispatch(fetchClientBeneficiaires());
    setIsSubmitting(false);
  };

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
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
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
        <div className={`mb-6 p-4 rounded-2xl ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Colonne gauche : Infos principales */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Informations Générales</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Libellé</label>
                <input
                  type="text"
                  value={libelle}
                  onChange={(e) => setLibelle(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black"
                />
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
        </div>

        {/* Colonne droite : Clients Factures liés */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Clients Factures Associés</h4>

            <div className="flex-1 space-y-3 mb-6 overflow-y-auto">
              {currentBeneficiaire.factures.map((f) => (
                <div key={f.clientFacture.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border">
                  <div>
                    <p className="font-bold text-sm">{f.clientFacture.libelle}</p>
                    <p className="text-xs text-gray-500">{f.clientFacture.code}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveClientFacture(f.clientFacture.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
              {currentBeneficiaire.factures.length === 0 && (
                <p className="text-center text-gray-400 italic py-12">Aucun client facture associé</p>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="relative mb-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un client facture..."
                  value={searchFacture}
                  onChange={(e) => setSearchFacture(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableClientFactures.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => handleAddClientFacture(cf.id)}
                    className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex justify-between items-center transition-all"
                  >
                    <div>
                      <p className="font-medium">{cf.libelle}</p>
                      <p className="text-xs text-gray-500">{cf.code}</p>
                    </div>
                    <FiPlus className="text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons fixes en bas */}
      <div className="mt-6 p-6">
        <div className="max-w-[1600px] mx-auto flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="px-8 py-4 border border-gray-300 rounded-2xl font-black text-gray-600 uppercase text-xs tracking-widest">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-3 uppercase text-xs tracking-widest"
          >
            {isSubmitting && <FiLoader className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientBeneficiaireFormPage;