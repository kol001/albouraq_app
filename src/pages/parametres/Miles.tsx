// src/pages/parametres/Miles.tsx
import { useEffect, useState } from 'react';
import {
  fetchMiles,
  createMiles,
  updateModulesForMiles,
  addBorneToLatest,
  updateBorneMiles,
  activateMiles, deactivateMiles
} from '../../app/milesSlice';
// Add this import at the top with other imports
import type { BorneMiles } from '../../app/milesSlice';
// import { FiPlus, FiTrash2, FiCheckCircle, FiXCircle, FiPackage } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../app/store';
import type { RootState } from '../../app/store';
import { useSelector } from 'react-redux';

const useAppDispatch = () => useDispatch<AppDispatch>();

interface NewBorne {
  borneCaInf: number;
  borneCaSup: number;
  miles: number;
}

const MilesPage = () => {
  const dispatch = useAppDispatch();
  const { data: milesList, loading } = useSelector((state: RootState) => state.miles);
  const { data: allModules } = useSelector((state: RootState) => state.modules);

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

  const hasPendingChanges = (milesId: string) => {
    return !!pendingModules[milesId] && pendingModules[milesId].size > 0;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestion des Barèmes Miles</h1>

      {/* === Création === */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">Créer un nouveau barème Miles</h2>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA ≥</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA {"<"}</th>
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

      {/* === Barème actuel (le plus récent) === */}
      {latestMiles && (
        <>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            Barème actuel
            <span className="px-3 py-1 bg-linear-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full">
              Plus récent
            </span>
          </h2>

          <div className="bg-linear-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-2xl shadow-xl p-8 mb-12">
            {/* On réutilise le même rendu qu'avant, mais avec un style premium */}
            
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-indigo-800">{latestMiles.numMiles}</h3>
              <p className="text-sm text-gray-700">
                Appliqué depuis le : {new Date(latestMiles.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <div className="mt-4 flex items-center gap-6">
                <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold ${
                  latestMiles.status === 'ACTIF'
                    ? 'bg-green-200 text-green-900'
                    : latestMiles.status === 'INACTIF'
                    ? 'bg-red-200 text-red-900'
                    : 'bg-yellow-200 text-yellow-900'
                }`}>
                  {latestMiles.status}
                </span>

                {/* Boutons d'activation / désactivation */}
                {latestMiles.status !== 'ACTIF' && (
                  <button
                    onClick={() => dispatch(activateMiles(latestMiles.id))}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition"
                  >
                    Activer ce barème
                  </button>
                )}

                {latestMiles.status === 'ACTIF' && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir désactiver ce barème ? Il ne sera plus appliqué.')) {
                        dispatch(deactivateMiles(latestMiles.id));
                      }
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md transition"
                  >
                    Désactiver ce barème
                  </button>
                )}
              </div>
            </div>
            

            {/* Bornes */}
            <h4 className="font-bold text-lg mb-4 text-indigo-900">Tranches définies</h4>
            <div className="overflow-x-auto mb-8 bg-white rounded-xl shadow-inner p-4">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">CA ≥</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-indigo-900">CA {"<"}</th>
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
                              onChange={(e) =>
                                setEditedValues({ ...editedValues, borneCaInf: Number(e.target.value) })
                              }
                              className="w-32 border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                          ) : (
                            `${borne.borneCaInf.toLocaleString()} €`
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedValues.borneCaSup ?? borne.borneCaSup}
                              onChange={(e) =>
                                setEditedValues({ ...editedValues, borneCaSup: Number(e.target.value) })
                              }
                              className="w-32 border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            `${borne.borneCaSup.toLocaleString()} €`
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-purple-700 text-lg">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedValues.miles ?? borne.miles}
                              onChange={(e) =>
                                setEditedValues({ ...editedValues, miles: Number(e.target.value) })
                              }
                              className="w-24 border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            `${borne.miles} points`
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  // Validation basique
                                  if (
                                    (editedValues.borneCaInf ?? borne.borneCaInf) >=
                                      (editedValues.borneCaSup ?? borne.borneCaSup) ||
                                    (editedValues.miles ?? borne.miles) <= 0
                                  ) {
                                    alert("Vérifiez les valeurs : CA inf < sup et points > 0");
                                    return;
                                  }

                                  dispatch(
                                    updateBorneMiles({
                                      borneId: borne.id!,
                                      updates: {
                                        borneCaInf: editedValues.borneCaInf ?? borne.borneCaInf,
                                        borneCaSup: editedValues.borneCaSup ?? borne.borneCaSup,
                                        miles: editedValues.miles ?? borne.miles,
                                      },
                                    })
                                  );
                                  setEditingBorneId(null);
                                  setEditedValues({});
                                }}
                                className="text-green-600 hover:text-green-800 font-medium"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBorneId(null);
                                  setEditedValues({});
                                }}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingBorneId(borne.id!);
                                setEditedValues({
                                  borneCaInf: borne.borneCaInf,
                                  borneCaSup: borne.borneCaSup,
                                  miles: borne.miles,
                                });
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Modifier
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modules associés (même logique que avant) */}
            <h4 className="font-bold text-lg mb-4 text-indigo-900">Modules associés</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Cocher</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {allModules.map((mod) => {
                    const currentModules = getCurrentModulesForMiles(latestMiles.id);
                    const isChecked = currentModules.includes(mod.id);
                    return (
                      <tr key={mod.id}>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePendingModule(latestMiles.id, mod.id)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">{mod.code}</td>
                        <td className="px-6 py-4 font-medium">{mod.nom}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mod.description || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

                      {/* === Ajout d'une tranche au barème actuel === */}
          {latestMiles && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-12">
              <h3 className="text-xl font-semibold mb-6 text-indigo-800">
                Ajouter une nouvelle tranche au barème actuel
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CA ≥
                  </label>
                  <input
                    type="number"
                    value={newBorne.borneCaInf}
                    onChange={(e) => setNewBorne({ ...newBorne, borneCaInf: Number(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: 10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CA {"<"}
                  </label>
                  <input
                    type="number"
                    value={newBorne.borneCaSup}
                    onChange={(e) => setNewBorne({ ...newBorne, borneCaSup: Number(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: 20000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Miles
                  </label>
                  <input
                    type="number"
                    value={newBorne.miles}
                    onChange={(e) => setNewBorne({ ...newBorne, miles: Number(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: 750"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (newBorne.borneCaInf >= newBorne.borneCaSup || newBorne.miles <= 0) {
                    alert("Vérifiez les valeurs : CA inférieur doit être < supérieur, et points > 0");
                    return;
                  }
                  dispatch(addBorneToLatest(newBorne));
                  setNewBorne({ borneCaInf: 0, borneCaSup: 0, miles: 0 });
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md"
              >
                Ajouter la tranche
              </button>
            </div>
          )}

            {hasPendingChanges(latestMiles.id) && (
              <button
                onClick={() => handleSaveModules(latestMiles.id)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                Sauvegarder les modifications
              </button>
            )}
          </div>
        </>
      )}
      {/* Messages vide / loading */}
      {!latestMiles && !loading && milesList.length === 0 && (
        <p className="text-center py-8 text-gray-500">Aucun barème Miles pour le moment.</p>
      )}
    </div>
  );
};

export default MilesPage;