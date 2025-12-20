import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createModele,
  updateModele,
  deleteModele,
  activateModele,
  deactivateModele
} from '../../app/modelesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Modele, ModuleRef } from '../../app/modelesSlice';
import { API_URL } from '../../service/env';
import { FiPlus, FiX, FiLoader, FiFileText } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ModelesPage = () => {
  const dispatch = useAppDispatch();
  const { data: modeles, loading: modelesLoading } = useSelector((state: RootState) => state.modeles);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  // States UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModele, setEditingModele] = useState<Modele | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    moduleId: '',
    fonctionnalite: '',
    dateApplication: '',
    pdf: null as File | null
  });

  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ moduleId: '', fonctionnalite: '', dateApplication: '', pdf: null });
    setEditingModele(null);
    setError('');
    setIsModalOpen(false);
  };

  const openEditModal = (mod: Modele) => {
    setEditingModele(mod);
    setFormData({
      moduleId: mod.moduleId,
      fonctionnalite: mod.fonctionnalite,
      dateApplication: mod.dateApplication.slice(0, 10),
      pdf: null
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, pdf: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const action = editingModele
      ? updateModele({
          id: editingModele.id,
          moduleId: formData.moduleId,
          fonctionnalite: formData.fonctionnalite,
          dateApplication: new Date(formData.dateApplication).toISOString(),
          status: editingModele.status,
          pdf: formData.pdf || undefined
        })
      : createModele({
          moduleId: formData.moduleId,
          fonctionnalite: formData.fonctionnalite,
          dateApplication: new Date(formData.dateApplication).toISOString(),
          status: 'ACTIF',
          pdf: formData.pdf as File
        });

    const result = await dispatch(action);
    if (createModele.fulfilled.match(result) || updateModele.fulfilled.match(result)) {
      resetForm();
    } else {
      setError('Une erreur est survenue lors de l\'enregistrement.');
    }
    setIsSubmitting(false);
  };

  const handleAction = async (actionFn: any, id: string) => {
    setIsSubmitting(true);
    await dispatch(actionFn({ id }));
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    setIsSubmitting(true);
    await dispatch(deleteModele({ id }));
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay de chargement global */}
      {isSubmitting && !isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <FiLoader className="text-indigo-600 animate-spin" size={40} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiFileText className="text-indigo-600" /> Gestion des Modèles
          </h2>
          <p className="text-gray-500 font-medium">Gérez vos documents PDF et leurs fonctionnalités par module.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Nouveau Modèle
        </button>
      </div>

      {/* Tableau Modernisé */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Module</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Fonctionnalité</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Document</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date Application</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {modeles.map((modele) => (
              <tr key={modele.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{modele.module.nom}</div>
                  <div className="text-[10px] font-mono text-indigo-500 uppercase">{modele.module.code}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {modele.fonctionnalite}
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={`${API_URL}/${modele.modeleDocument}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm underline underline-offset-4"
                  >
                    Consulter le PDF
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(modele.dateApplication).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    modele.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {modele.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                    <button onClick={() => openEditModal(modele)} className="text-blue-600 hover:text-blue-800 transition-colors">Modifier</button>
                    {modele.status === 'ACTIF' ? (
                      <button onClick={() => handleAction(deactivateModele, modele.id)} className="text-amber-600 hover:text-amber-800 transition-colors">Désactiver</button>
                    ) : (
                      <button onClick={() => handleAction(activateModele, modele.id)} className="text-emerald-600 hover:text-emerald-800 transition-colors">Activer</button>
                    )}
                    <button onClick={() => handleDelete(modele.id)} className="text-red-600 hover:text-red-800 transition-colors">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modelesLoading && (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FiLoader className="animate-spin" size={30} />
            <p className="font-bold">Chargement des modèles...</p>
          </div>
        )}
      </div>

      {/* Modale de Formulaire (Création / Édition) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {editingModele ? 'Modifier le modèle' : 'Nouveau modèle PDF'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Module</label>
                  <select 
                    value={formData.moduleId} 
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    required
                  >
                    <option value="">Sélectionner un module</option>
                    {modules.map((m: ModuleRef) => (
                      <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fonctionnalité</label>
                  <input 
                    value={formData.fonctionnalite} 
                    onChange={(e) => setFormData({...formData, fonctionnalite: e.target.value})} 
                    placeholder="Ex: FACTURE_CLIENT" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date d'application</label>
                  <input 
                    type="date" 
                    value={formData.dateApplication} 
                    onChange={(e) => setFormData({...formData, dateApplication: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Document PDF {editingModele && <span className="text-indigo-400 leading-none">(Laissez vide pour conserver l'actuel)</span>}
                  </label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" 
                    required={!editingModele}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Annuler</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : editingModele ? 'Enregistrer les modifications' : 'Créer le modèle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelesPage;