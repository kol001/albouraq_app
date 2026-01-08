import { FiArrowLeft, FiPlus, FiCheck,  FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  fetchClientBeneficiaireInfos,
  type ClientBeneficiaireInfo,
} from "../../../app/portail_client/clientBeneficiaireInfosSlice";
import { createDossierCommun } from "../../../app/front_office/dossierCommunSlice";

const useAppDispatch = () => useDispatch<AppDispatch>();

export default function DossierCommunForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: profiles } = useSelector((state: RootState) => state.profiles);
  const { data: clients } = useSelector((state: RootState) => state.clientFactures);
  const { list: infosList, loadingList: loadingInfos } = useSelector((state: RootState) => state.clientBeneficiaireInfos);
  const { loading: loadingCreate, error } = useSelector((state: RootState) => state.dossierCommun);

  // Sélections
  const [selectedClientFactureId, setSelectedClientFactureId] = useState<string | null>(null);
  const [selectedClientFactureLibelle, setSelectedClientFactureLibelle] = useState("");
  const [selectedBeneficiaireInfos, setSelectedBeneficiaireInfos] = useState<ClientBeneficiaireInfo[]>([]);
  const [selectedColabs, setSelectedColabs] = useState<{ userId: string; moduleId: string }[]>([]);

  // Champs manuels
  const [referenceTravelPlaner, setReferenceTravelPlaner] = useState("");
  const [description, setDescription] = useState("");
  const [contactPrincipal, setContactPrincipal] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Fetch infos quand on sélectionne un bénéficiaire (pour afficher la liste)
  const [displayedBeneficiaireId, setDisplayedBeneficiaireId] = useState<string | null>(null);

  {/* État pour la modale */}
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [payloadToSend, setPayloadToSend] = useState<any>(null);

  useEffect(() => {
    if (displayedBeneficiaireId) {
      dispatch(fetchClientBeneficiaireInfos(displayedBeneficiaireId));
    }
  }, [displayedBeneficiaireId, dispatch]);

  useEffect(() => {
    // if (success) {
    //   alert("Dossier Commun créé avec succès !");
    //   // Reset tout ou rediriger ?
    //   navigate(-1);
    // }
    if (error) {
      alert("Erreur : " + error);
    }
  }, [ error, dispatch, navigate]);

  const handleSelectClientFacture = (id: string, libelle: string) => {
    setSelectedClientFactureId(id);
    setSelectedClientFactureLibelle(libelle);
    setSelectedBeneficiaireInfos([]); // Reset bénéficiaires
  };

  const toggleBeneficiaireInfo = (info: ClientBeneficiaireInfo) => {
    setSelectedBeneficiaireInfos((prev) =>
      prev.find((i) => i.id === info.id)
        ? prev.filter((i) => i.id !== info.id)
        : [...prev, info]
    );
  };

  const toggleColabFromProfile = (moduleId: string, userIds: string[]) => {
    const newColabs = userIds.map((userId) => ({ userId, moduleId }));
    setSelectedColabs((prev) => {
      // On retire tous les colabs avec ce moduleId
      const filtered = prev.filter((c) => c.moduleId !== moduleId);
      // On ajoute les nouveaux
      return [...filtered, ...newColabs];
    });
  };

  const removeColab = (userId: string, moduleId: string) => {
    setSelectedColabs((prev) => prev.filter((c) => !(c.userId === userId && c.moduleId === moduleId)));
  };

  const handleSubmit = () => {
    if (!selectedClientFactureId) return alert("Veuillez sélectionner un Client Facturé");
    if (selectedBeneficiaireInfos.length === 0) return alert("Veuillez sélectionner au moins une information bénéficiaire");

    const payload = {
      referenceTravelPlaner,
      description,
      contactPrincipal,
      whatsapp: whatsapp || undefined,
      clientFactureId: selectedClientFactureId,
      colabs: selectedColabs,
      clients: selectedBeneficiaireInfos.map((info, index) => ({
        clientbeneficiaireInfoId: info.id,
        code: 1000 + index + 1, // Ex: 1001, 1002...
      })),
    };

    dispatch(createDossierCommun(payload));
  };

  const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '-');

  const handlePreview = () => {
    if (!selectedClientFactureId) {
      alert("⚠️ Veuillez sélectionner un Client Facturé");
      return;
    }
    if (selectedBeneficiaireInfos.length === 0) {
      alert("⚠️ Veuillez sélectionner au moins une information bénéficiaire");
      return;
    }

    const payload = {
      referenceTravelPlaner: referenceTravelPlaner || undefined,
      description: description || undefined,
      contactPrincipal: contactPrincipal || undefined,
      whatsapp: whatsapp || undefined,
      clientFactureId: selectedClientFactureId,
      colabs: selectedColabs,
      clients: selectedBeneficiaireInfos.map((info, index) => ({
        clientbeneficiaireInfoId: info.id,
        code: 1000 + index + 1,
      })),
    };

    setPayloadToSend(payload);
    setShowPreviewModal(true);
  };

  const confirmCreate = () => {
    if (!payloadToSend) return;

    dispatch(createDossierCommun(payloadToSend));
    setShowPreviewModal(false);
    setPayloadToSend(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 font-medium">
        <FiArrowLeft size={20} /> Retour
      </button>

      <h1 className="text-4xl font-black text-gray-900 mb-12">Création d'un Dossier Commun</h1>

      {/* Champs manuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div>
          <label className="block text-sm font-black uppercase text-gray-600 mb-2">Référence Travel Planner</label>
          <input
            type="text"
            value={referenceTravelPlaner}
            onChange={(e) => setReferenceTravelPlaner(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: REF-2026-001"
          />
        </div>
        <div>
          <label className="block text-sm font-black uppercase text-gray-600 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="Import/Export, Voyage groupe..."
          />
        </div>
        <div>
          <label className="block text-sm font-black uppercase text-gray-600 mb-2">Contact Principal</label>
          <input
            type="text"
            value={contactPrincipal}
            onChange={(e) => setContactPrincipal(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-black uppercase text-gray-600 mb-2">WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="+261 34 ..."
          />
        </div>
      </div>

      {/* Sélection Client Facturé */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-indigo-900 mb-6">1. Sélectionner le Client Facturé</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleSelectClientFacture(client.id, client.libelle)}
              className={`p-6 rounded-3xl border-4 text-left transition-all ${
                selectedClientFactureId === client.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-indigo-400 hover:shadow-lg'
              }`}
            >
              <p className="text-xs font-black text-indigo-600 uppercase">Client Facturé</p>
              <p className="font-black text-xl mt-2">{client.libelle}</p>
              <p className="text-sm text-gray-500 mt-1">#{client.id}</p>
              {selectedClientFactureId === client.id && <FiCheck className="absolute top-4 right-4 text-indigo-600" size={28} />}
            </button>
          ))}
        </div>
        {selectedClientFactureLibelle && (
          <p className="mt-6 text-lg font-bold text-green-600">✓ Client sélectionné : {selectedClientFactureLibelle}</p>
        )}
      </div>

      {/* Sélection Bénéficiaires */}
      {selectedClientFactureId && (
  <div className="mb-12">
    <h2 className="text-2xl font-black text-purple-900 mb-6">
      2. Sélectionner les Infos des Bénéficiaires
    </h2>

    {/* Grille des bénéficiaires */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {clients
        .find((c) => c.id === selectedClientFactureId)
        ?.beneficiaires.map((link) => {
          const benef = link.clientBeneficiaire;
          if (!benef) return null;

          const isActive = displayedBeneficiaireId === benef.id;
          const hasSelectedInfos = selectedBeneficiaireInfos.some(
            (i) => i.beneficiaireId === benef.id
          );

          return (
            <button
              key={benef.id}
              onClick={() => setDisplayedBeneficiaireId(benef.id)}
              className={`relative p-6 rounded-3xl transition-all transform hover:scale-105 shadow-md ${
                isActive
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-600'
                  : 'bg-white border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              <p className="font-black text-xl text-purple-900">{benef.libelle}</p>
              <p className="text-sm text-purple-700 mt-1">ID: #{benef.id}</p>
              
              {hasSelectedInfos && (
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {selectedBeneficiaireInfos.filter(i => i.beneficiaireId === benef.id).length}
                </div>
              )}
            </button>
          );
        })}
    </div>

    {/* Section des infos du bénéficiaire sélectionné */}
    {displayedBeneficiaireId && (
      <>
        <h3 className="text-2xl font-black text-purple-900 mb-6">
          Infos disponibles pour :{" "}
          {clients
            .find((c) => c.id === selectedClientFactureId)
            ?.beneficiaires.find((l) => l.clientBeneficiaire?.id === displayedBeneficiaireId)
            ?.clientBeneficiaire?.libelle}
        </h3>

        {loadingInfos ? (
          <p className="text-gray-600">Chargement des informations...</p>
        ) : infosList.length === 0 ? (
          <p className="text-gray-500 italic">Aucune information disponible pour ce bénéficiaire.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {infosList.map((info) => {
              const isSelected = selectedBeneficiaireInfos.some((i) => i.id === info.id);

              return (
                <div
                  key={info.id}
                  className={`relative bg-white rounded-3xl shadow-lg border-4 p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50 scale-105'
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                  onClick={() => toggleBeneficiaireInfo(info)}
                >
                  {/* Checkbox visible */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleBeneficiaireInfo(info)}
                    className="absolute top-6 right-6 w-8 h-8 text-green-600 rounded focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()} // pour éviter double trigger
                  />

                  <div className="pr-12">
                    <p className="font-black text-xl text-gray-900">
                      {info.prenom} {info.nom}
                    </p>
                    <p className="text-purple-700 font-semibold mt-2">
                      {info.typeDoc} – {info.referenceDoc}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      Créé le {formatDate(info.createdAt)}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute bottom-4 right-6">
                      <FiCheck size={28} className="text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    )}

    {/* Résumé détaillé des sélections */}
    {selectedBeneficiaireInfos.length > 0 && (
      <div className="mt-12 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-4 border-green-300 shadow-xl">
        <h3 className="text-2xl font-black text-green-900 mb-6">
          Résumé des Infos Sélectionnées ({selectedBeneficiaireInfos.length})
        </h3>

        <div className="space-y-6">
          {selectedBeneficiaireInfos.map((info) => {
            const benefLibelle = clients
              .find((c) => c.id === selectedClientFactureId)
              ?.beneficiaires.find((l) => l.clientBeneficiaire?.id === info.beneficiaireId)
              ?.clientBeneficiaire?.libelle;

            return (
              <div
                key={info.id}
                className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-md"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-black text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {info.prenom} {info.nom}
                    </p>
                    <p className="text-sm text-purple-700 font-medium">
                      {benefLibelle} • {info.typeDoc} – {info.referenceDoc}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ajouté le {formatDate(info.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleBeneficiaireInfo(info)}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  <FiTrash2 size={22} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-green-200 text-center">
          <p className="text-xl font-black text-green-900">
            {selectedBeneficiaireInfos.length} document{selectedBeneficiaireInfos.length > 1 ? 's' : ''} prêt{selectedBeneficiaireInfos.length > 1 ? 's' : ''} à être ajouté{selectedBeneficiaireInfos.length > 1 ? 's' : ''} au dossier
          </p>
        </div>
      </div>
    )}
  </div>
)}


      {/* Sélection Colabs – Nouvelle logique : checkboxes + auto-sélection du premier user */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-emerald-900 mb-8">
          3. Attribuer un Responsable par Module
        </h2>
        <p className="text-gray-700 mb-6">
          Cochez les modules à attribuer, puis sélectionnez <strong>un responsable</strong> pour chacun.
        </p>

        {profiles.length === 0 ? (
          <p className="text-gray-500 italic">Aucun profil chargé</p>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Collecte des modules uniques + users possibles */}
            {(() => {
              const modulesMap = new Map<
                string,
                { module: any; userIds: Set<string>; userDetails: Map<string, any> }
              >();

              profiles.forEach((prof) => {
                prof.modules?.forEach((m) => {
                  const moduleId = m.module.id;
                  if (!modulesMap.has(moduleId)) {
                    modulesMap.set(moduleId, {
                      module: m.module,
                      userIds: new Set(),
                      userDetails: new Map(),
                    });
                  }
                  prof.users?.forEach((u) => {
                    const user = u.user;
                    modulesMap.get(moduleId)!.userIds.add(user.id);
                    modulesMap.get(moduleId)!.userDetails.set(user.id, user);
                  });
                });
              });

              const uniqueModules = Array.from(modulesMap.entries())
                .map(([id, data]) => ({
                  id,
                  module: data.module,
                  users: Array.from(data.userDetails.entries()).map(([userId, user]) => ({
                    userId,
                    ...user,
                  })),
                }))
                .sort((a, b) => a.module.nom.localeCompare(b.module.nom));

              return (
                <div className="space-y-6">
                  {uniqueModules.map(({ id: moduleId, module, users }) => {
                    // Vérifie si le module est actuellement coché (i.e. a une attribution)
                    const isChecked = selectedColabs.some((c) => c.moduleId === moduleId);
                    const selectedColab = selectedColabs.find((c) => c.moduleId === moduleId);
                    const selectedUser = selectedColab
                      ? users.find((u) => u.userId === selectedColab.userId)
                      : null;

                    return (
                      <div
                        key={moduleId}
                        className={`bg-white rounded-3xl shadow-lg border-2 p-6 transition-all ${
                          isChecked ? 'border-emerald-400' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                // Cocher : sélectionner automatiquement le premier utilisateur si aucun n'est déjà choisi
                                const firstUserId = users[0]?.userId;
                                if (firstUserId && !selectedColab) {
                                  setSelectedColabs((prev) => [
                                    ...prev.filter((c) => c.moduleId !== moduleId),
                                    { moduleId, userId: firstUserId },
                                  ]);
                                }
                              } else {
                                // Décocher : supprimer l'attribution
                                setSelectedColabs((prev) =>
                                  prev.filter((c) => c.moduleId !== moduleId)
                                );
                              }
                            }}
                            className="mt-2 w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500"
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="font-black text-2xl text-emerald-900">{module.nom}</p>
                                <p className="text-sm text-gray-600">ID: {module.id}</p>
                              </div>
                              <p className="text-lg font-semibold text-gray-700">
                                {users.length} utilisateur{users.length > 1 ? 's' : ''} disponible
                                {users.length > 1 ? 's' : ''}
                              </p>
                            </div>

                            {/* Dropdown – visible seulement si le module est coché */}
                            {isChecked && (
                              <div className="mt-4">
                                <select
                                  value={selectedColab?.userId || users[0]?.userId || ""}
                                  onChange={(e) => {
                                    const newUserId = e.target.value;
                                    if (newUserId) {
                                      setSelectedColabs((prev) => {
                                        const filtered = prev.filter((c) => c.moduleId !== moduleId);
                                        return [...filtered, { userId: newUserId, moduleId }];
                                      });
                                    }
                                  }}
                                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all text-lg font-medium"
                                >
                                  {users.map((user) => (
                                    <option key={user.userId} value={user.userId}>
                                      {user.prenom} {user.nom} ({user.email || user.pseudo || 'sans email'})
                                    </option>
                                  ))}
                                </select>

                                {/* Affichage du responsable actuel */}
                                {selectedUser && (
                                  <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-800 font-black text-xl">
                                        {selectedUser.prenom[0]}{selectedUser.nom[0]}
                                      </div>
                                      <div>
                                        <p className="font-bold text-emerald-900">
                                          {selectedUser.prenom} {selectedUser.nom}
                                        </p>
                                        <p className="text-sm text-emerald-700">
                                          {selectedUser.email || selectedUser.pseudo || "Pas d'email"}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setSelectedColabs((prev) =>
                                          prev.filter((c) => c.moduleId !== moduleId)
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <FiTrash2 size={20} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Résumé rapide */}
        {selectedColabs.length > 0 && (
          <div className="mt-10 p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-300 text-center">
            <p className="font-black text-2xl text-emerald-900">
              {selectedColabs.length} module{selectedColabs.length > 1 ? 's' : ''} attribué
              {selectedColabs.length > 1 ? 's' : ''}
            </p>
            <p className="text-emerald-700 mt-2">Un responsable par module</p>
          </div>
        )}
      </div>

      {/* Bouton Création avec prévisualisation */}
      <div className="flex justify-end mt-12">
        <button
          onClick={handlePreview}
          disabled={!selectedClientFactureId || selectedBeneficiaireInfos.length === 0}
          className="px-16 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-2xl font-black rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={32} />
          Voir le JSON et Créer le Dossier
        </button>
      </div>

      {/* Modale de prévisualisation JSON */}
      {showPreviewModal && payloadToSend && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-3xl font-black text-gray-900">
                Prévisualisation du payload JSON
              </h3>
              <p className="text-gray-600 mt-2">
                Voici exactement ce qui sera envoyé au serveur via POST /dossier-commun
              </p>
            </div>

            <div className="p-8 bg-gray-50">
              <pre className="text-sm font-mono text-left whitespace-pre-wrap break-all bg-gray-900 text-green-400 p-6 rounded-2xl overflow-x-auto">
                {JSON.stringify(payloadToSend, null, 2)}
              </pre>
            </div>

            <div className="p-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPayloadToSend(null);
                }}
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-2xl font-black hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreate}
                disabled={loadingCreate}
                className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-3 disabled:opacity-70"
              >
                {loadingCreate ? (
                  <>Création en cours...</>
                ) : (
                  <>
                    <FiCheck size={24} />
                    Confirmer et Créer le Dossier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}