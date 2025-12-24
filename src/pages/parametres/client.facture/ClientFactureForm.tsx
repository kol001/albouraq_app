import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // ← Important pour l'ID dans l'URL
import {
  createClientFacture,
  updateClientFacture,
  addBeneficiaireToClientFacture,
  removeBeneficiaireFromClientFacture,
  fetchClientFactures,
} from '../../../app/clientFacturesSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import { FiArrowLeft, FiTrash2, FiSearch, FiUserPlus ,FiLoader } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ClientFactureFormPage = () => {
  const { id } = useParams<{ id?: string }>(); // Si id présent → édition, sinon → création
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: clients } = useSelector((state: RootState) => state.clientFactures);
  const { data: allBeneficiaires } = useSelector((state: RootState) => state.clientBeneficiaires);

  const isEdit = !!id;
  const currentClient = clients.find(c => c.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [searchTerm, setSearchTerm] = useState('');

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

  // Chargement des données si édition
  useEffect(() => {
    if (isEdit && currentClient) {
      setFormData({
        code: currentClient.code,
        libelle: currentClient.libelle,
        profilRisque: currentClient.profilRisque,
        tauxBase: currentClient.tauxBase,
        volDomestique: currentClient.volDomestique,
        volRegional: currentClient.volRegional,
        longCourrier: currentClient.longCourrier,
        auComptant: currentClient.auComptant,
        credit15jrs: currentClient.credit15jrs,
        credit30jrs: currentClient.credit30jrs,
        credit60jrs: currentClient.credit60jrs,
        credit90jrs: currentClient.credit90jrs,
        statut: currentClient.statut
      });
    }
  }, [isEdit, currentClient]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    try {
      if (isEdit) {
        await dispatch(updateClientFacture({ id, ...formData }));
        setMessage({ text: 'Client Facture mis à jour avec succès !', isError: false });
      } else {
        await dispatch(createClientFacture({ ...formData, dateApplication: new Date().toISOString() }));
        setMessage({ text: 'Client Facture créé avec succès !', isError: false });
      }
      setTimeout(() => navigate('/parametre/client-facture'), 1500);
    } catch {
      setMessage({ text: 'Erreur lors de l’enregistrement.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBeneficiaire = async (beneficiaireId: string) => {
    if (isEdit) {
      setIsSubmitting(true);
      await dispatch(addBeneficiaireToClientFacture({ id: id!, beneficiaireId }));
      await dispatch(fetchClientFactures()); // Rafraîchit les données
      setIsSubmitting(false);
    }
  };

  const handleRemoveBeneficiaire = async (beneficiaireId: string) => {
    if (isEdit) {
      setIsSubmitting(true);
      await dispatch(removeBeneficiaireFromClientFacture({ id: id!, beneficiaireId }));
      await dispatch(fetchClientFactures());
      setIsSubmitting(false);
    }
  };

  const availableBeneficiaires = useMemo(() => {
    return allBeneficiaires.filter(ben =>
      !currentClient?.beneficiaires.some(l => l.clientBeneficiaireId === ben.id) &&
      (ben.libelle.toLowerCase().includes(searchTerm.toLowerCase()) || ben.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allBeneficiaires, currentClient, searchTerm]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header avec retour */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            {isEdit ? 'Modifier Client Facture' : 'Nouveau Client Facture'}
          </h2>
          <p className="text-gray-500 italic">Configurez les paramètres et bénéficiaires associés</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Colonne principale : Formulaire */}
        <div className="lg:col-span-8 space-y-8">
          {/* Identité & Risque */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Identité & Risque</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Code</label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black" required />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Libellé</label>
                <input type="text" value={formData.libelle} onChange={e => setFormData({ ...formData, libelle: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black" required />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Profil Risque</label>
                <select value={formData.profilRisque} onChange={e => setFormData({ ...formData, profilRisque: e.target.value as any })} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-medium">
                  <option value="FAIBLE">FAIBLE</option>
                  <option value="MOYEN">MOYEN</option>
                  <option value="ELEVE">ELEVE</option>
                </select>
              </div>
            </div>
          </section>

          {/* Conditions commerciales */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Conditions Commerciales (%)</h4>
            <div className="grid grid-cols-3 gap-6">
              {['tauxBase', 'volDomestique', 'volRegional', 'longCourrier', 'auComptant', 'credit15jrs', 'credit30jrs', 'credit60jrs', 'credit90jrs'].map(key => (
                <div key={key}>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(formData as any)[key]}
                    onChange={e => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-medium"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Colonne droite : Bénéficiaires */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">Bénéficiaires Associés</h4>

            {isEdit ? (
              <>
                <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-96">
                  {currentClient?.beneficiaires.map(link => (
                    <div key={link.clientBeneficiaireId} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border">
                      <div>
                        <p className="font-bold text-sm">{link.clientBeneficiaire?.libelle}</p>
                        <p className="text-xs text-gray-500">{link.clientBeneficiaire?.code}</p>
                      </div>
                      <button onClick={() => handleRemoveBeneficiaire(link.clientBeneficiaireId)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {(!currentClient || currentClient.beneficiaires.length === 0) && (
                    <p className="text-center text-gray-400 italic py-8">Aucun bénéficiaire</p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <div className="relative mb-4">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableBeneficiaires.map(ben => (
                      <button
                        key={ben.id}
                        onClick={() => handleAddBeneficiaire(ben.id)}
                        className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{ben.libelle}</p>
                          <p className="text-xs text-gray-500">{ben.code}</p>
                        </div>
                        <FiUserPlus className="text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-12 text-gray-500 italic">
                Les bénéficiaires pourront être ajoutés après la création du client.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boutons fixes en bas */}
      <div className=" mt-6 p-6">
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
            {isEdit ? 'Enregistrer les modifications' : 'Créer le client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientFactureFormPage;