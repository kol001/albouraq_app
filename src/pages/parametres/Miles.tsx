import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createMile,
  fetchMiles,
  updateMile,
  deleteMile,
  activateMile,
  deactivateMile,
} from '../../app/milesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Mile } from '../../app/milesSlice';
import { 
  FiPlus,
  FiCheckCircle, FiAlertCircle, FiLoader, FiX, FiLayers 
} from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';

const Miles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: miles,  error: globalError } = useSelector((state: RootState) => state.miles);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Chargement spécifique aux actions
  const [editingMile, setEditingMile] = useState<Mile | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    moduleId: '',
    borneCaInf: 0,
    borneCaSup: 1000,
    miles: 100
  });

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  useEffect(() => {
    dispatch(fetchMiles());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ moduleId: '', borneCaInf: 0, borneCaSup: 1000, miles: 100 });
    setEditingMile(null);
    setMessage(null);
    setIsModalOpen(false);
  };

  const handleOpenEdit = (m: Mile) => {
    setEditingMile(m);
    setFormData({
      moduleId: m.moduleId,
      borneCaInf: m.borneCaInf,
      borneCaSup: m.borneCaSup,
      miles: m.miles
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const action = editingMile 
      ? updateMile({ id: editingMile.id, ...formData }) 
      : createMile(formData);

    const result = await dispatch(action);

    if (createMile.fulfilled.match(result) || updateMile.fulfilled.match(result)) {
      setMessage({ text: editingMile ? 'Configuration mise à jour !' : 'Nouvelle borne créée !', isError: false });
      setTimeout(resetForm, 1500);
    } else {
      setMessage({ text: 'Une erreur est survenue lors de l\'opération.', isError: true });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette configuration de miles ?')) {
      setIsSubmitting(true);
      await dispatch(deleteMile({ id }));
      setIsSubmitting(false);
    }
  };

  const openAudit = (miles: Mile) => {
      setAuditEntityId(miles.id);
      setAuditEntityName(miles.module.nom);
    };

  const closeAudit = () => {
    setAuditEntityId(null);
    setAuditEntityName('');
  };

  const toggleStatus = async (m: Mile) => {
    setIsSubmitting(true);
    if (m.status === 'ACTIF') {
      await dispatch(deactivateMile({ id: m.id }));
    } else {
      await dispatch(activateMile({ id: m.id }));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Overlay de chargement global pour les actions rapides */}
      {isSubmitting && !isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <FiLoader className="text-indigo-600 animate-spin" size={40} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiLayers className="text-indigo-600" /> Gestion des Miles
          </h2>
          <p className="text-gray-500 font-medium">Configurez les paliers de récompenses par module de vente.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <FiPlus size={20} /> Nouvelle Borne
        </button>
      </div>

      {globalError && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* Tableau Modernisé */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Module</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Palier CA</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Valeur Miles</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {miles.map((m) => (
              <tr key={m.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{m.module.nom}</div>
                  <div className="text-[10px] font-mono text-indigo-500 uppercase">{m.module.code}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600 italic">de</span> <span className="font-bold">{m.borneCaInf}</span> 
                  <span className="text-gray-600 italic ml-2">à</span> <span className="font-bold">{m.borneCaSup}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-black tracking-tight">
                    {m.miles} Miles
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    m.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(m)} className="p-2 text-xs  text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Modifier">
                      {/* <FiEdit3 size={18} /> */}
                      Modifier
                      </button>
                    <button onClick={() => toggleStatus(m)} className={`p-2 rounded-xl transition-all text-xs ${m.status === 'ACTIF' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={m.status === 'ACTIF' ? 'Désactiver' : 'Activer'}>
                      {/* <FiPower size={18} /> */}
                      {m.status != 'ACTIF' ? 'Activer' : 'Désactiver'}
                    </button>
                    <button
                      onClick={() => openAudit(m)}
                      className="text-purple-600 hover:text-purple-800 text-xs "
                    >
                      Historique
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Supprimer">
                      {/* <FiTrash2 size={18} /> */}
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale Unique (Création / Édition) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">
                {editingMile ? 'Modifier la borne' : 'Nouvelle borne'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Module Cible</label>
                  <select 
                    value={formData.moduleId} 
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    required
                  >
                    <option value="">Sélectionner un module</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CA Inférieur</label>
                    <input 
                      type="number" 
                      value={formData.borneCaInf} 
                      onChange={(e) => setFormData({...formData, borneCaInf: Number(e.target.value)})} 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CA Supérieur</label>
                    <input 
                      type="number" 
                      value={formData.borneCaSup} 
                      onChange={(e) => setFormData({...formData, borneCaSup: Number(e.target.value)})} 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Récompense (Miles)</label>
                  <input 
                    type="number" 
                    value={formData.miles} 
                    onChange={(e) => setFormData({...formData, miles: Number(e.target.value)})} 
                    className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-indigo-700 text-lg" 
                    required 
                  />
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  {message.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Annuler</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : editingMile ? 'Mettre à jour' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal
        entity="MILES"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={closeAudit}
      />
    </div>
  );
};

export default Miles;