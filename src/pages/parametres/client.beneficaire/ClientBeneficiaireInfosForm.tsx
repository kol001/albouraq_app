import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createClientBeneficiaireInfos,
  fetchClientBeneficiaireInfos,
  updateClientBeneficiaireInfo,
  type ClientBeneficiaireInfo,
} from '../../../app/portail_client/clientBeneficiaireInfosSlice';
import type { AppDispatch, RootState } from '../../../app/store';
import { FiArrowLeft, FiUpload, FiLoader, FiFileText, FiCalendar, FiEdit2, FiX } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

export default function ClientBeneficiaireInfosForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { list, loadingList, loading: isLoading } = useSelector((state: RootState) => state.clientBeneficiaireInfos);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [editingInfo, setEditingInfo] = useState<ClientBeneficiaireInfo | null>(null);

  // États du formulaire
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [clientType, setClientType] = useState<'ADULTE' | 'ENFANT' | 'BEBE' | 'JEUNE'>('ADULTE');
  const [typeDoc, setTypeDoc] = useState<'LAISSE_PASSER' | 'PASSEPORT'>('PASSEPORT');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [dateDelivranceDoc, setDateDelivranceDoc] = useState('');
  const [dateValiditeDoc, setDateValiditeDoc] = useState('');
  const [referenceCin, setReferenceCin] = useState('');
  const [dateDelivranceCin, setDateDelivranceCin] = useState('');
  const [dateValiditeCin, setDateValiditeCin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tel, setTel] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [cin, setCin] = useState<File | null>(null);

  // Chargement liste au montage
  useEffect(() => {
    if (id) dispatch(fetchClientBeneficiaireInfos(id));
  }, [id, dispatch]);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (editingInfo) {
      setPrenom(editingInfo.prenom);
      setNom(editingInfo.nom);
      setNationalite(editingInfo.nationalite || '');
      setClientType(editingInfo.clientType);
      setTypeDoc(editingInfo.typeDoc);
      setReferenceDoc(editingInfo.referenceDoc);
      setDateDelivranceDoc(editingInfo.dateDelivranceDoc.split('T')[0]);
      setDateValiditeDoc(editingInfo.dateValiditeDoc.split('T')[0]);
      if (editingInfo.referenceCin) setReferenceCin(editingInfo.referenceCin);
      if (editingInfo.dateDelivranceCin) setDateDelivranceCin(editingInfo.dateDelivranceCin.split('T')[0]);
      if (editingInfo.dateValiditeCin) setDateValiditeCin(editingInfo.dateValiditeCin.split('T')[0]);
      if (editingInfo.whatsapp) setWhatsapp(editingInfo.whatsapp);
      if (editingInfo.tel) setTel(editingInfo.tel);
      setDocument(null);
      setCin(null);
    }
  }, [editingInfo]);

  const toISODateString = (dateStr: string): string => dateStr ? `${dateStr}T00:00:00.000Z` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setMessage(null);

    const payload = {
      prenom,
      nom,
      nationalite: nationalite || '',
      clientType,
      typeDoc,
      referenceDoc,
      referenceCin: referenceCin || undefined,
      dateDelivranceDoc: toISODateString(dateDelivranceDoc),
      dateValiditeDoc: toISODateString(dateValiditeDoc),
      dateDelivranceCin: dateDelivranceCin ? toISODateString(dateDelivranceCin) : undefined,
      dateValiditeCin: dateValiditeCin ? toISODateString(dateValiditeCin) : undefined,
      whatsapp: whatsapp || undefined,
      tel: tel || undefined,
      document: document || undefined,
      cin: cin || undefined,
    };

    const result = editingInfo
      ? await dispatch(updateClientBeneficiaireInfo({ id: editingInfo.id, ...payload }))
      : await dispatch(createClientBeneficiaireInfos({ clientbeneficiaireId: id, ...payload }));

    if (createClientBeneficiaireInfos.fulfilled.match(result) || updateClientBeneficiaireInfo.fulfilled.match(result)) {
      setMessage({ text: `✅ ${editingInfo ? 'Modifications' : 'Nouvelles informations'} enregistrées !`, isError: false });
      setEditingInfo(null);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: result.payload as string || '❌ Erreur', isError: true });
    }
    setIsSubmitting(false);
    setDocument(null);
    setCin(null);
  };

  const handleEdit = (info: ClientBeneficiaireInfo) => {
    setEditingInfo(info);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingInfo(null);
  };

  const formatDate = (isoString: string) => isoString ? new Date(isoString).toLocaleDateString('fr-FR') : '-';

  const apiUrl = import.meta.env.VITE_API_URL || '';

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 mb-8 font-medium"
      >
        <FiArrowLeft size={24} /> Retour à l'édition du bénéficiaire
      </button>

      <h1 className="text-4xl font-black text-gray-900 mb-8">
        Informations Complémentaires du Bénéficiaire
      </h1>

      {message && (
        <div className={`mb-8 p-6 rounded-2xl text-white font-bold ${
          message.isError ? 'bg-red-600 animate-pulse' : 'bg-green-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulaire Création/Édition */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-10 space-y-8 mb-12">
        {editingInfo && (
          <div className="p-6 bg-linear-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <FiEdit2 size={24} />
              <span className="font-black text-xl">ÉDITION : {editingInfo.prenom} {editingInfo.nom}</span>
            </div>
            <button type="button" onClick={handleCancelEdit} className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-xl font-bold transition-all">
              <FiX size={20} /> Annuler
            </button>
          </div>
        )}

        {/* Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Prénom *</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                   className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Nom *</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                   className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Nationalité</label>
            <input type="text" value={nationalite} onChange={(e) => setNationalite(e.target.value)}
                   className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Type de client</label>
            <select value={clientType} onChange={(e) => setClientType(e.target.value as any)}
                    className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500">
              <option value="ADULTE">ADULTE</option>
              <option value="ENFANT">ENFANT</option>
              <option value="BEBE">BEBE</option>
              <option value="JEUNE">JEUNE</option>
            </select>
          </div>
        </div>

        {/* Document d'identité */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-black text-indigo-600 mb-6 flex items-center gap-2">
            <FiFileText size={24} /> Document d'identité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Type de document</label>
              <select value={typeDoc} onChange={(e) => setTypeDoc(e.target.value as any)}
                      className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500">
                <option value="PASSEPORT">PASSEPORT</option>
                <option value="LAISSE_PASSER">LAISSE_PASSER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Référence Document</label>
              <input type="text" value={referenceDoc} onChange={(e) => setReferenceDoc(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Date délivrance Doc.</label>
              <input type="date" value={dateDelivranceDoc} onChange={(e) => setDateDelivranceDoc(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Date validité Doc.</label>
              <input type="date" value={dateValiditeDoc} onChange={(e) => setDateValiditeDoc(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Référence CIN</label>
              <input type="text" value={referenceCin} onChange={(e) => setReferenceCin(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Date délivrance CIN</label>
              <input type="date" value={dateDelivranceCin} onChange={(e) => setDateDelivranceCin(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-600 uppercase mb-2">Date validité CIN</label>
              <input type="date" value={dateValiditeCin} onChange={(e) => setDateValiditeCin(e.target.value)}
                     className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">WhatsApp</label>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                   className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Téléphone</label>
            <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)}
                   className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Pièces jointes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Document principal (PDF)</label>
            {editingInfo?.document && !document && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-between">
                <a href={`${apiUrl}/${editingInfo.document}`} target="_blank" rel="noopener noreferrer"
                   className="text-green-800 font-semibold flex items-center gap-2 hover:underline">
                  <FiFileText size={20} /> Document actuel
                </a>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
              <FiUpload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">
                {document ? document.name : (editingInfo?.document ? 'Remplacer le document' : 'Cliquer pour uploader')}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setDocument(e.target.files![0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-600 uppercase mb-2">Copie CIN / Passeport (PDF)</label>
            {editingInfo?.cin && !cin && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-between">
                <a href={`${apiUrl}/${editingInfo.cin}`} target="_blank" rel="noopener noreferrer"
                   className="text-green-800 font-semibold flex items-center gap-2 hover:underline">
                  <FiFileText size={20} /> CIN actuelle
                </a>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
              <FiUpload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">
                {cin ? cin.name : (editingInfo?.cin ? 'Remplacer la CIN' : 'Cliquer pour uploader')}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files && setCin(e.target.files![0])}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row justify-end pt-8 gap-4">
          {editingInfo && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-12 py-5 bg-gray-200 text-gray-800 rounded-2xl font-black hover:bg-gray-300 transition-all flex items-center justify-center text-lg"
            >
              Annuler les modifications
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-16 py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-3 text-lg justify-center disabled:opacity-50"
          >
            {isSubmitting && <FiLoader className="animate-spin" size={20} />}
            {editingInfo ? 'Enregistrer les modifications' : 'Enregistrer les informations'}
          </button>
        </div>
      </form>

      {/* Liste des infos existantes */}
      <div className="bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-3xl font-black text-indigo-600 mb-8 flex items-center gap-3">
          <FiCalendar size={32} />
          Historique des informations complémentaires ({list.length})
        </h2>

        {loadingList ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-4xl text-indigo-600 mr-4" />
            <span className="text-xl text-gray-600">Chargement des informations...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-500 font-medium">Aucune information complémentaire enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {list.map((info) => (
              <div key={info.id} className="group relative border-2 border-gray-200 rounded-3xl p-8 hover:border-indigo-400 hover:shadow-2xl transition-all bg-gradient-to-b from-gray-50/50 to-white hover:from-indigo-50/50">
                {/* Bouton Modifier */}
                <button
                  onClick={() => handleEdit(info)}
                  className="absolute -top-3 right-6 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 group-hover:scale-105 z-10"
                >
                  <FiEdit2 size={20} />
                  Modifier
                </button>

                {/* Contenu */}
                <div className="flex justify-between items-start mb-6 pt-8">
                  <div>
                    <p className="font-black text-2xl text-gray-900">
                      {info.prenom} {info.nom}
                    </p>
                    <p className="text-lg text-indigo-600 font-semibold mt-1">{info.clientType} • {info.nationalite || 'Non spécifié'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Créé le {formatDate(info.createdAt)}</p>
                    {info.updatedAt !== info.createdAt && (
                      <p className="text-sm font-medium text-indigo-600">Modifié le {formatDate(info.updatedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
                  <div>
                    <p className="font-bold text-gray-800 mb-2">📄 Document principal</p>
                    <p><span className="font-semibold">Type :</span> <span className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 font-medium">{info.typeDoc}</span></p>
                    <p><span className="font-semibold">Réf. :</span> {info.referenceDoc}</p>
                    <p><span className="font-semibold">Validité :</span> {formatDate(info.dateDelivranceDoc)} → {formatDate(info.dateValiditeDoc)}</p>
                    {info.document && (
                      <a href={`${apiUrl}/${info.document}`} target="_blank" rel="noopener noreferrer"
                         className="mt-2 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-indigo-300">
                        <FiFileText /> Voir le document (PDF)
                      </a>
                    )}
                  </div>
                  <div>
                    {info.referenceCin && (
                      <>
                        <p className="font-bold text-gray-800 mb-2">🪪 CIN supplémentaire</p>
                        <p><span className="font-semibold">Réf. :</span> {info.referenceCin}</p>
                        <p><span className="font-semibold">Validité :</span> {formatDate(info.dateDelivranceCin || '')} → {formatDate(info.dateValiditeCin || '')}</p>
                        {info.cin && (
                          <a href={`${apiUrl}/${info.cin}`} target="_blank" rel="noopener noreferrer"
                             className="mt-2 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-indigo-300">
                            <FiFileText /> Voir la CIN (PDF)
                          </a>
                        )}
                      </>
                    )}
                    {(info.whatsapp || info.tel) && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                        <p className="font-semibold text-emerald-800">📱 Contact : {info.whatsapp || info.tel}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}