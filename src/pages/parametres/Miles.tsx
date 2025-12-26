// src/pages/parametres/Miles.tsx
import { useEffect, useState } from 'react';
import {
  fetchMiles,
  createMiles,
  updateModulesForMiles,
  addBorneToLatest,
  updateBorneMiles,
  deleteBorneMiles,
  activateMiles, deactivateMiles
} from '../../app/milesSlice';
// Add this import at the top with other imports
import type { BorneMiles } from '../../app/milesSlice';
import { FiArrowLeft, FiXCircle, FiPlus} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../app/store';
import type { RootState } from '../../app/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useAppDispatch = () => useDispatch<AppDispatch>();

interface NewBorne {
  borneCaInf: number;
  borneCaSup: number;
  miles: number;
}

const MilesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: milesList, loading } = useSelector((state: RootState) => state.miles);
  const { data: allModules } = useSelector((state: RootState) => state.modules);

  // --- ÉTAT POUR LES ONGLETS ---
  const [activeTab, setActiveTab] = useState<'calcul' | 'perimetre'>('calcul');

  // --- ÉTATS POUR LA VISIBILITÉ ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddTrancheForm, setShowAddTrancheForm] = useState(false);

  // Formulaire création
  const [bornes, setBornes] = useState<NewBorne[]>([
    { borneCaInf: 0, borneCaSup: 1000, miles: 100 },
  ]);

  // Formulaire ajout d'une seule borne au barème actuel
  const [newBorne, setNewBorne] = useState<NewBorne>({
    borneCaInf: 0,
    borneCaSup: 0,
    miles: 0,
  });

  // État temporaire pour les modifications en cours (uniquement les changements non sauvegardés)
  const [pendingModules, setPendingModules] = useState<Record<string, Set<string>>>({});

  // Gestion de l'édition d'une borne
  const [editingBorneId, setEditingBorneId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<BorneMiles>>({});

  useEffect(() => {
    dispatch(fetchMiles());
  }, [dispatch]);

  // TRI : on trie par date de création décroissante
  const sortedMilesList = [...milesList].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Le plus récent (premier après tri)
  const latestMiles = sortedMilesList[0];

  const addBorneRow = () => {
    setBornes([...bornes, { borneCaInf: 0, borneCaSup: 0, miles: 0 }]);
  };

  const removeBorneRow = (index: number) => {
    if (bornes.length > 1) {
      setBornes(bornes.filter((_, i) => i !== index));
    }
  };

  const updateBorne = (index: number, field: keyof NewBorne, value: number) => { 
    const updated = [...bornes];
    updated[index][field] = value;
    setBornes(updated);
  };

  const handleCreate = () => {
    dispatch(createMiles(bornes));
    setBornes([{ borneCaInf: 0, borneCaSup: 1000, miles: 100 }]);
  };

  // Toggle local (sans toucher au store tout de suite)
  const togglePendingModule = (milesId: string, moduleId: string) => {
    setPendingModules((prev) => {
      const set = new Set(prev[milesId] || []);
      if (set.has(moduleId)) {
        set.delete(moduleId);
      } else {
        set.add(moduleId);
      }
      return { ...prev, [milesId]: set };
    });
  };

  // Calcul des modules actuellement sélectionnés (store + pending)
  const getCurrentModulesForMiles = (milesId: string): string[] => {
    const miles = milesList.find((m) => m.id === milesId);
    if (!miles) return [];

    const base = miles.Module.map((mod) => mod.id);
    const pending = pendingModules[milesId] || new Set<string>();

    // On applique les changements locaux
    return base
      .filter((id) => !pending.has(id)) // retire ceux décochés
      .concat(Array.from(pending).filter((id) => !base.includes(id))); // ajoute ceux cochés
  };

  const handleSaveModules = (milesId: string) => {
    const newSelectedIds = getCurrentModulesForMiles(milesId);
    dispatch(updateModulesForMiles({ milesId, newModuleIds: newSelectedIds }));

    // On vide les pending après sauvegarde
    setPendingModules((prev) => {
      const newPrev = { ...prev };
      delete newPrev[milesId];
      return newPrev;
    });
  };

  const handleDeleteBorne = (borneId: string) => {
    dispatch(deleteBorneMiles(borneId));
  };

  const hasPendingChanges = (milesId: string) => {
    return !!pendingModules[milesId] && pendingModules[milesId].size > 0;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* TITRE PRINCIPAL AVEC BOUTON DE CRÉATION */}
      <div className="flex flex-col gap-6 mb-8">
        {/* Barre d'outils supérieure */}
        <div className="flex items-center justify-between">
          
          {/* Groupe Gauche : Retour + Titre */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)} 
              className="group p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200"
              title="Retour"
            >
              <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Gestion des Bornes Miles
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Configurez vos barèmes et tranches de points
              </p>
            </div>
          </div>

          {/* Groupe Droite : Action */}
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm ${
              showCreateForm 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 shadow-md active:scale-95'
            }`}
          >
            {showCreateForm ? (
              <>
                <FiXCircle size={18} />
                Annuler la création
              </>
            ) : (
              <>
                <FiPlus size={18} />
                Nouveau barème
              </>
            )}
          </button>
        </div>
        
        {/* Séparateur subtil optionnel */}
        <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent w-full" />
      </div>
      {/* === frmulaire de Création === */}
      {showCreateForm && (
        <div className="bg-white shadow-md border border-gray-200 p-6 mt-8 ml-8 mr-8">
          <h2 className="text-xl font-semibold mb-4">Créer un nouveau barème Miles</h2>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borne CA Inférieure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borne CA Supérieure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points Miles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bornes.map((borne, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={borne.borneCaInf}
                        onChange={(e) => updateBorne(index, 'borneCaInf', Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={borne.borneCaSup}
                        onChange={(e) => updateBorne(index, 'borneCaSup', Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={borne.miles}
                        onChange={(e) => updateBorne(index, 'miles', Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeBorneRow(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={bornes.length === 1}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button onClick={addBorneRow} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Ajouter une tranche
            </button>
            <button onClick={handleCreate} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
              Créer le barème
            </button>
          </div>
        </div>
      )}

      {/* === Barème actuel (le plus récent) === */}
      {latestMiles && (
        <>
          <div className="p-8 mb-12">
            <div className="mb-6 bg-white p-8">
              <h3 className="text-3xl font-bold text-indigo-800">Num Miles : {latestMiles.numMiles}</h3>
              <p className="text-sm text-gray-700">
                Appliqué depuis le : {new Date(latestMiles.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <div className="mt-4 flex items-center gap-6">
                <span className={`inline-block px-5 py-2 rounded-lg text-sm font-bold ${
                  latestMiles.status === 'ACTIF'
                    ? 'bg-green-200 text-green-900'
                    : latestMiles.status === 'INACTIF'
                    ? 'bg-red-200 text-red-900'
                    : 'bg-yellow-200 text-yellow-900'
                }`}>
                  {latestMiles.status}
                </span>

                {latestMiles.status !== 'ACTIF' && (
                  <button
                    onClick={() => dispatch(activateMiles(latestMiles.id))}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition"
                  >
                    Activer ce miles
                  </button>
                )}

                {latestMiles.status === 'ACTIF' && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir désactiver ce barème ?')) {
                        dispatch(deactivateMiles(latestMiles.id));
                      }
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md transition"
                  >
                    Désactiver ce miles
                  </button>
                )}
              </div>
            </div>

            {/* NAVIGATION DES ONGLETS */}
            <div className="flex gap-8 ">
              <button
                onClick={() => setActiveTab('calcul')}
                className={` pl-8 pr-8 pt-3 pb-3 mb-5 bg-white text-sm font-bold transition-all rounded-tr-md border-b-2 ${
                  activeTab === 'calcul' 
                  ? 'text-indigo-600 border-b-4 border-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Calcul
              </button>
              <button
                onClick={() => setActiveTab('perimetre')}
                className={`pl-8 pr-8 pt-3 pb-3 mb-5 bg-white text-sm font-bold transition-all rounded-tr-md border-b-2 ${
                  activeTab === 'perimetre' 
                  ? 'text-indigo-600 border-b-4 border-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Périmètre
              </button>
            </div>

            {/* CONTENU CALCUL */}
            {activeTab === 'calcul' && (
              <>
                {/* TITRE TABLEAU AVEC BOUTON AJOUT TRANCHE */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-indigo-900">Tableau de calcul actuel</h4>
                  <button 
                    onClick={() => setShowAddTrancheForm(!showAddTrancheForm)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                  >
                    {showAddTrancheForm ? 'Fermer le formulaire' : 'Ajouter une tranche'}
                  </button>
                </div>
                {/* Formulaire ajout tranche (Conditionnel) */}
                {showAddTrancheForm && (
                  <div className="bg-white border border-gray-200 p-4 mb-8">
                    <h3 className="text-md font-bold mb-4 text-gray-800">Nouvelle tranche pour ce barème</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">CA INFÉRIEUR</label>
                        <input type="number" value={newBorne.borneCaInf} onChange={(e) => setNewBorne({ ...newBorne, borneCaInf: Number(e.target.value) })} className="w-full border border-green-300 rounded-lg px-4 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">CA SUPÉRIEUR</label>
                        <input type="number" value={newBorne.borneCaSup} onChange={(e) => setNewBorne({ ...newBorne, borneCaSup: Number(e.target.value) })} className="w-full border border-green-300 rounded-lg px-4 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-900 mb-1">POINTS MILES</label>
                        <input type="number" value={newBorne.miles} onChange={(e) => setNewBorne({ ...newBorne, miles: Number(e.target.value) })} className="w-full border border-green-300 rounded-lg px-4 py-2" />
                      </div>
                    </div>
                    <button onClick={() => {
                      dispatch(addBorneToLatest(newBorne));
                      setNewBorne({ borneCaInf: 0, borneCaSup: 0, miles: 0 });
                      setShowAddTrancheForm(false);
                    }} className="px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800">
                      Confirmer l'ajout
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto mb-8 bg-white border border-gray-200 p-4">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-indigo-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">Borne CA Inférieure</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">Borne CA Supérieur</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">Points Miles</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {latestMiles.bornesMiles.map((borne) => {
                        const isEditing = editingBorneId === borne.id;
                        return (
                          <tr key={borne.id} className="hover:bg-indigo-50">
                            <td className="px-6 py-4 font-semibold">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedValues.borneCaInf ?? borne.borneCaInf}
                                  onChange={(e) => setEditedValues({ ...editedValues, borneCaInf: Number(e.target.value) })}
                                  className="w-32 border rounded px-2 py-1"
                                />
                              ) : `${borne.borneCaInf.toLocaleString()} €`}
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedValues.borneCaSup ?? borne.borneCaSup}
                                  onChange={(e) => setEditedValues({ ...editedValues, borneCaSup: Number(e.target.value) })}
                                  className="w-32 border rounded px-2 py-1"
                                />
                              ) : `${borne.borneCaSup.toLocaleString()} €`}
                            </td>
                            <td className="px-6 py-4 font-bold text-purple-700 text-lg">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedValues.miles ?? borne.miles}
                                  onChange={(e) => setEditedValues({ ...editedValues, miles: Number(e.target.value) })}
                                  className="w-24 border rounded px-2 py-1"
                                />
                              ) : `${borne.miles} points`}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isEditing ? (
                                <div className="flex gap-2">
                                  <button onClick={() => {
                                    dispatch(updateBorneMiles({
                                      borneId: borne.id!,
                                      updates: {
                                        borneCaInf: editedValues.borneCaInf ?? borne.borneCaInf,
                                        borneCaSup: editedValues.borneCaSup ?? borne.borneCaSup,
                                        miles: editedValues.miles ?? borne.miles,
                                      }
                                    }));
                                    setEditingBorneId(null);
                                  }} className="text-green-600">Valider</button>
                                  
                                    <button
                                      onClick={() => handleDeleteBorne(borne.id!)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Supprimer
                                    </button>

                                    <button onClick={() => setEditingBorneId(null)} className="text-gray-600">Annuler</button>
                                </div>
                              ) : (
                                <button onClick={() => {
                                  setEditingBorneId(borne.id!);
                                  setEditedValues({ borneCaInf: borne.borneCaInf, borneCaSup: borne.borneCaSup, miles: borne.miles });
                                }} className="text-indigo-600">Modifier</button>
                              )}
                            </td>
                            
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Formulaire ajout tranche */}
                {/* <div className="bg-white border border-gray-200 p-6 mt-12">
                  <h3 className="text-xl font-semibold mb-6 text-indigo-800">Ajouter une nouvelle tranche</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <input type="number" value={newBorne.borneCaInf} onChange={(e) => setNewBorne({ ...newBorne, borneCaInf: Number(e.target.value) })} className="border rounded-lg px-4 py-2" placeholder="CA Inf" />
                    <input type="number" value={newBorne.borneCaSup} onChange={(e) => setNewBorne({ ...newBorne, borneCaSup: Number(e.target.value) })} className="border rounded-lg px-4 py-2" placeholder="CA Sup" />
                    <input type="number" value={newBorne.miles} onChange={(e) => setNewBorne({ ...newBorne, miles: Number(e.target.value) })} className="border rounded-lg px-4 py-2" placeholder="Miles" />
                  </div>
                  <button onClick={() => {
                    dispatch(addBorneToLatest(newBorne));
                    setNewBorne({ borneCaInf: 0, borneCaSup: 0, miles: 0 });
                  }} className="px-6 py-3 bg-green-600 text-white rounded-lg">Ajouter la tranche</button>
                </div> */}
              </>
            )}

            {/* CONTENU PÉRIMÈTRE */}
            {activeTab === 'perimetre' && (
              <>
                <h4 className="font-bold text-lg mb-4 text-indigo-900">Tableau Périmètre</h4>
                <div className="overflow-x-auto mb-6 bg-white shadow-inner p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Cocher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allModules.map((mod) => (
                        <tr key={mod.id}>
                          <td className="px-6 py-4">{mod.code}</td>
                          <td className="px-6 py-4 font-medium">{mod.nom}</td>
                          <td className="px-6 py-4 font-medium">{mod.status}</td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={getCurrentModulesForMiles(latestMiles.id).includes(mod.id)}
                              onChange={() => togglePendingModule(latestMiles.id, mod.id)}
                              className="w-5 h-5"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasPendingChanges(latestMiles.id) && (
                  <button
                    onClick={() => handleSaveModules(latestMiles.id)}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold"
                  >
                    Sauvegarder les modifications
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}

      {!latestMiles && !loading && milesList.length === 0 && (
        <p className="text-center py-8 text-gray-500">Aucun barème Miles pour le moment.</p>
      )}
    </div>
  );
};

export default MilesPage;