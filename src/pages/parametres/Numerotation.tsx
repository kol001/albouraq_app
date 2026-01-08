import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createDossier,
  fetchDossiers,
  resetDossier,
  resetAllDossiers,
} from '../../app/back_office/numerotationSlice';
import type { RootState, AppDispatch } from '../../app/store';
import { FiPlus, FiHash, FiRefreshCw, FiX, FiLoader, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Numerotation = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  const { data: dossiers, loading: globalLoading, error: globalError } = useSelector((state: RootState) => state.numerotation);

  // States UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États formulaire
  const [formData, setFormData] = useState({
    perimetre: '',
    type: 'DOSSIER',
    suffixe: ''
  });

  useEffect(() => {
    dispatch(fetchDossiers());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ perimetre: '', type: 'DOSSIER', suffixe: '' });
    setError('');
    setSuccess('');
    setIsModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await dispatch(createDossier(formData));

    if (createDossier.fulfilled.match(result)) {
      setSuccess('Configuration créée avec succès !');
      setTimeout(resetForm, 1500);
    } else {
      setError('Erreur lors de la création du dossier.');
    }
    setIsSubmitting(false);
  };

  const handleReset = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment remettre à zéro la numérotation de ce périmètre ?')) {
      setIsSubmitting(true);
      await dispatch(resetDossier({ id }));
      setIsSubmitting(false);
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('ATTENTION : Reset la numérotation pour TOUS les dossiers ?')) {
      setIsSubmitting(true);
      await dispatch(resetAllDossiers());
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Overlay de chargement global pour les actions de Reset */}
      {isSubmitting && !isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <FiLoader className="text-indigo-600 animate-spin" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Mise à jour...</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-all">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiHash className="text-indigo-600" /> Numérotation
            </h2>
            <p className="text-gray-500 font-medium italic">Gérez les compteurs et les formats de dossiers par périmètre.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetAll}
            className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-2xl font-bold transition-all hover:bg-red-600 hover:text-white flex items-center gap-2"
          >
            <FiRefreshCw size={18} /> Reset Global
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <FiPlus size={20} /> Nouveau Dossier
          </button>
        </div>
      </div>

      {globalError && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 font-bold italic">
          <FiAlertCircle /> {globalError}
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Périmètre</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Suffixe</th>
              <th className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Numéro Actuel</th>
              <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white font-medium">
            {dossiers.map((d) => (
              <tr key={d.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 uppercase tracking-tight">{d.perimetre}</div>
                  <div className="text-[10px] text-gray-400 tracking-tighter">Créé le {new Date(d.dateCreation).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-black tracking-widest">
                    {d.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">
                    {d.suffixe}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xl font-black text-gray-800 tracking-tighter">
                    {d.numero}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleReset(d.id)}
                    className="text-amber-600 hover:text-amber-800 font-black text-[11px] uppercase tracking-tighter underline underline-offset-4 decoration-2"
                  >
                    Reset Numérotation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {globalLoading && dossiers.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FiLoader className="animate-spin" size={30} />
            <p className="font-bold uppercase text-[10px] tracking-widest">Chargement des données...</p>
          </div>
        )}
      </div>

      {/* MODALE DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">Nouveau Dossier</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Périmètre</label>
                  <input 
                    type="text" 
                    value={formData.perimetre} 
                    onChange={(e) => setFormData({...formData, perimetre: e.target.value})} 
                    placeholder="Ex: Dossier Billet" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Suffixe</label>
                    <input 
                      type="text" 
                      value={formData.suffixe} 
                      onChange={(e) => setFormData({...formData, suffixe: e.target.value})} 
                      placeholder="Ex: DOSBLL" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold uppercase" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})} 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                    >
                      <option value="DOSSIER">DOSSIER</option>
                      <option value="DEVIS">DEVIS</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>}
              {success && <p className="text-green-500 text-xs font-bold text-center italic">{success}</p>}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="flex-1 py-4 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : 'Confirmer la création'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Numerotation;