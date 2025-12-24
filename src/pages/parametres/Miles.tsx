import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMiles,
  createMiles,
  updateModulesForMiles,
  addBorneToLatest,
  updateBorneMiles,
  activateMiles, 
  deactivateMiles
} from '../../app/milesSlice';
import type { BorneMiles } from '../../app/milesSlice';
import type { AppDispatch, RootState } from '../../app/store';
import { 
   FiSave, FiEdit2, FiTrash2, FiZap,
   FiLayers, FiSettings, FiPlusCircle 
} from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

interface NewBorne {
  borneCaInf: number;
  borneCaSup: number;
  miles: number;
}

const MilesPage = () => {
  const dispatch = useAppDispatch();
  const { data: milesList } = useSelector((state: RootState) => state.miles);
  const { data: allModules } = useSelector((state: RootState) => state.modules);

  // --- États ---
  const [creationMode, setCreationMode] = useState<'NEW' | 'ADD_TO_CURRENT'>('NEW');
  const [bornes, setBornes] = useState<NewBorne[]>([{ borneCaInf: 0, borneCaSup: 1000, miles: 100 }]);
  const [newBorne, setNewBorne] = useState<NewBorne>({ borneCaInf: 0, borneCaSup: 0, miles: 0 });
  const [pendingModules, setPendingModules] = useState<Record<string, Set<string>>>({});
  const [editingBorneId, setEditingBorneId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<BorneMiles>>({});

  useEffect(() => {
    dispatch(fetchMiles());
  }, [dispatch]);

  const sortedMilesList = [...milesList].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latestMiles = sortedMilesList[0];

  // --- Actions ---
  const addBorneRow = () => setBornes([...bornes, { borneCaInf: 0, borneCaSup: 0, miles: 0 }]);
  const removeBorneRow = (index: number) => bornes.length > 1 && setBornes(bornes.filter((_, i) => i !== index));
  const updateBorne = (index: number, field: keyof NewBorne, value: number) => {
    const updated = [...bornes];
    updated[index][field] = value;
    setBornes(updated);
  };

  const handleCreate = () => {
    dispatch(createMiles(bornes));
    setBornes([{ borneCaInf: 0, borneCaSup: 1000, miles: 100 }]);
  };

  const handleAddSingleBorne = () => {
    if (newBorne.borneCaInf >= newBorne.borneCaSup || newBorne.miles <= 0) {
      alert("Vérifiez les valeurs : CA inf < sup et points > 0");
      return;
    }
    dispatch(addBorneToLatest(newBorne));
    setNewBorne({ borneCaInf: 0, borneCaSup: 0, miles: 0 });
  };

  const togglePendingModule = (milesId: string, moduleId: string) => {
    setPendingModules((prev) => {
      const set = new Set(prev[milesId] || []);
      set.has(moduleId) ? set.delete(moduleId) : set.add(moduleId);
      return { ...prev, [milesId]: set };
    });
  };

  const getCurrentModulesForMiles = (milesId: string): string[] => {
    const miles = milesList.find((m) => m.id === milesId);
    if (!miles) return [];
    const base = miles.Module.map((mod) => mod.id);
    const pending = pendingModules[milesId] || new Set<string>();
    return base.filter((id) => !pending.has(id)).concat(Array.from(pending).filter((id) => !base.includes(id)));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Barèmes Miles</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configuration technique des seuils de fidélité.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : Création et Ajout (Tabs System) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Tab Selector */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
              <button 
                onClick={() => setCreationMode('NEW')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  creationMode === 'NEW' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Nouveau Barème
              </button>
              <button 
                onClick={() => setCreationMode('ADD_TO_CURRENT')}
                disabled={!latestMiles}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  creationMode === 'ADD_TO_CURRENT' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600 disabled:opacity-30'
                }`}
              >
                Ajuster l'actuel
              </button>
            </div>

            <div className="p-6">
              {creationMode === 'NEW' ? (
                /* Vue 1 : Création Complète */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiPlusCircle /></div>
                    <span className="text-sm font-bold text-slate-700">Définir un nouveau cycle</span>
                  </div>
                  {bornes.map((borne, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CA min</label>
                          <input type="number" value={borne.borneCaInf} onChange={(e) => updateBorne(index, 'borneCaInf', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CA max</label>
                          <input type="number" value={borne.borneCaSup} onChange={(e) => updateBorne(index, 'borneCaSup', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1 text-indigo-500">Points Miles</label>
                        <input type="number" value={borne.miles} onChange={(e) => updateBorne(index, 'miles', Number(e.target.value))} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 text-sm font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      {bornes.length > 1 && (
                        <button onClick={() => removeBorneRow(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addBorneRow} className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase hover:border-indigo-200 hover:text-indigo-400 transition-all">
                    + Ajouter une tranche
                  </button>
                  <button onClick={handleCreate} className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                    Initialiser le barème
                  </button>
                </div>
              ) : (
                /* Vue 2 : Ajout à l'actuel (addBorneToLatest) */
                <div className="space-y-6">
                   <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FiZap /></div>
                    <span className="text-sm font-bold text-slate-700">Ajout rapide de tranche</span>
                  </div>
                  <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-emerald-600 uppercase ml-1">Seuil Inférieur</label>
                          <input type="number" value={newBorne.borneCaInf} onChange={(e) => setNewBorne({ ...newBorne, borneCaInf: Number(e.target.value) })} className="w-full border-emerald-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-emerald-600 uppercase ml-1">Seuil Supérieur</label>
                          <input type="number" value={newBorne.borneCaSup} onChange={(e) => setNewBorne({ ...newBorne, borneCaSup: Number(e.target.value) })} className="w-full border-emerald-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-emerald-600 uppercase ml-1 font-black">Valeur en Points</label>
                        <input type="number" value={newBorne.miles} onChange={(e) => setNewBorne({ ...newBorne, miles: Number(e.target.value) })} className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-3 text-lg font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                      ⚠️ Cette action ajoutera une nouvelle ligne directement au barème <strong>{latestMiles?.numMiles}</strong> actuellement actif.
                    </p>
                  </div>
                  <button onClick={handleAddSingleBorne} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                    Injecter la tranche
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Barème Actuel (Détails premium) */}
        <div className="lg:col-span-8 space-y-8">
          {latestMiles && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              {/* Top Banner Dark */}
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                    <FiLayers size={28} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{latestMiles.numMiles}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`h-2 w-2 rounded-full animate-pulse ${latestMiles.status === 'ACTIF' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{latestMiles.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {latestMiles.status === 'ACTIF' ? (
                    <button onClick={() => confirm('Désactiver ce barème ?') && dispatch(deactivateMiles(latestMiles.id))} className="px-5 py-2.5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all">Désactiver</button>
                  ) : (
                    <button onClick={() => dispatch(activateMiles(latestMiles.id))} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20 tracking-widest">Activer</button>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-10">
                
                {/* Tranches Section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                    <FiSettings className="text-indigo-600" /> Configuration des tranches
                  </h4>
                  <div className="space-y-3">
                    {latestMiles.bornesMiles.map((borne) => {
                      const isEditing = editingBorneId === borne.id;
                      return (
                        <div key={borne.id} className="group flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Seuils CA</span>
                              {isEditing ? (
                                <div className="flex gap-1 mt-1">
                                  <input type="number" className="w-20 border-indigo-200 rounded-lg p-1 text-xs" value={editedValues.borneCaInf ?? borne.borneCaInf} onChange={e => setEditedValues({...editedValues, borneCaInf: Number(e.target.value)})}/>
                                  <input type="number" className="w-20 border-indigo-200 rounded-lg p-1 text-xs" value={editedValues.borneCaSup ?? borne.borneCaSup} onChange={e => setEditedValues({...editedValues, borneCaSup: Number(e.target.value)})}/>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-slate-700">{borne.borneCaInf.toLocaleString()}€ - {borne.borneCaSup.toLocaleString()}€</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                               <span className="text-[9px] font-black text-indigo-400 uppercase">Gain</span>
                               {isEditing ? (
                                  <input type="number" className="w-16 border-indigo-200 rounded-lg p-1 text-xs font-bold text-indigo-600" value={editedValues.miles ?? borne.miles} onChange={e => setEditedValues({...editedValues, miles: Number(e.target.value)})}/>
                               ) : (
                                  <span className="text-lg font-black text-indigo-600">{borne.miles}<span className="text-[10px] ml-1">pts</span></span>
                               )}
                            </div>
                            <div className="w-8">
                               {isEditing ? (
                                 <button onClick={() => {
                                     dispatch(updateBorneMiles({ borneId: borne.id!, updates: editedValues }));
                                     setEditingBorneId(null);
                                 }} className="text-emerald-500 hover:scale-110 transition-transform"><FiSave size={18}/></button>
                               ) : (
                                 <button onClick={() => { setEditingBorneId(borne.id!); setEditedValues(borne); }} className="text-slate-300 group-hover:text-indigo-400 transition-colors"><FiEdit2 size={16}/></button>
                               )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modules Section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                    <FiLayers className="text-indigo-600" /> Types préstation
                  </h4>
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-2 space-y-1 max-h-[400px] overflow-y-auto">
                    {allModules.map((mod) => {
                      const isChecked = getCurrentModulesForMiles(latestMiles.id).includes(mod.id);
                      return (
                        <label key={mod.id} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          isChecked ? 'bg-white shadow-sm border border-indigo-100' : 'hover:bg-slate-100/50 border border-transparent'
                        }`}>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1">{mod.nom}</span>
                            <span className="text-[9px] text-slate-400 font-bold tracking-tighter">{mod.code}</span>
                            <span className="text-[9px] text-slate-400 font-bold tracking-tighter">{mod.status}</span>
                          </div>
                          <input type="checkbox" checked={isChecked} onChange={() => togglePendingModule(latestMiles.id, mod.id)} className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-offset-0 focus:ring-indigo-500" />
                        </label>
                      );
                    })}
                  </div>
                  {Object.keys(pendingModules).length > 0 && (
                      <button onClick={() => {
                          const newIds = getCurrentModulesForMiles(latestMiles.id);
                          dispatch(updateModulesForMiles({ milesId: latestMiles.id, newModuleIds: newIds }));
                          setPendingModules({});
                      }} className="w-full mt-4 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                        Appliquer les changements
                      </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilesPage;