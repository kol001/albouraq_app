import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createModule,
  updateModule,
  activateModule,
  deactivateModule,
  deleteModule,
} from '../../app/modulesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Module } from '../../app/modulesSlice';
import { FiPackage, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiLayers } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ModulePage = () => {
  const dispatch = useAppDispatch();
  const { data: modules, loading, error: globalError } = useSelector((state: RootState) => state.modules);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [message, setMessage] = useState({ text: '', isError: false });

  // État pour la modale d'audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  // Form States
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    setCode(''); setNom(''); setDescription('');
    setMessage({ text: '', isError: false });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createModule({ code, nom, description, status: 'ACTIF' }));
    if (createModule.fulfilled.match(result)) {
      showFeedback('Module créé avec succès !');
      setTimeout(closeModals, 1500);
    } else {
      showFeedback('Erreur lors de la création', true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    const result = await dispatch(updateModule({ id: editingModule.id, code, nom, description }));
    if (updateModule.fulfilled.match(result)) {
      showFeedback('Module mis à jour !');
      setTimeout(closeModals, 1500);
    } else {
      showFeedback('Erreur lors de la modification', true);
    }
  };

  const openEdit = (mod: Module) => {
    setEditingModule(mod);
    setCode(mod.code);
    setNom(mod.nom);
    setDescription(mod.description);
    setIsModalOpen(true);
  };

  const showFeedback = (txt: string, isErr = false) => {
    setMessage({ text: txt, isError: isErr });
  };

  const openAudit = (module: Module) => {
    setAuditEntityId(module.id);
    setAuditEntityName(module.nom);
  };

  const closeAudit = () => {
    setAuditEntityId(null);
    setAuditEntityName('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiLayers className="text-indigo-600" /> Gestion des Modules
          </h2>
          <p className="text-sm text-gray-500">Administrez les briques logicielles et les composants du système.</p>
        </div>
        <button 
          onClick={() => { setEditingModule(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Nouveau Module
        </button>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Identifiant (Code)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom du Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white font-medium">
            {modules.map((mod) => (
              <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                    {mod.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FiPackage size={16} />
                    </div>
                    <span className="text-gray-900 font-bold">{mod.nom}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500 max-w-xs truncate" title={mod.description}>
                    {mod.description || '---'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${mod.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    ● {mod.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(mod)} className=" text-xs p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      {/* <FiEdit3 size={16} /> */}
                      Modifier
                    </button>
                    <button 
                      onClick={() => mod.status === 'ACTIF' ? dispatch(deactivateModule({id: mod.id})) : dispatch(activateModule({id: mod.id}))}
                      className={` rounded-lg transition-all ${mod.status === 'ACTIF' ? 'text-amber-400 text-xs hover:bg-amber-50 hover:text-amber-600' : 'text-green-400 text-xs hover:bg-green-50 hover:text-green-600'}`}
                    >
                      {/* <FiPower size={16} /> */}
                      {mod.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => openAudit(mod)}
                      className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                    >
                      Historique
                    </button>
                    <button onClick={() => window.confirm('Supprimer ce module ?') && dispatch(deleteModule({id: mod.id}))} className="p-2 text-gray-400 text-xs hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALE UNIQUE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingModule ? 'Modifier le Module' : 'Nouveau Module'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={editingModule ? handleUpdate : handleCreate} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Code du Module</label>
                  <input 
                    type="text" 
                    placeholder="ex: MOD_FACTURATION" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
                  <input 
                    type="text" 
                    placeholder="ex: Gestion des Factures" 
                    value={nom} 
                    onChange={(e) => setNom(e.target.value)} 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea 
                    placeholder="À quoi sert ce module ?" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all h-24 resize-none" 
                  />
                </div>
              </div>

              {message.text && (
                <div className={`mt-2 p-4 rounded-xl flex items-center gap-3 ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModals} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {loading ? 'Traitement...' : editingModule ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal
        entity="MODULE"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={closeAudit}
      />
    </div>
  );
};

export default ModulePage;