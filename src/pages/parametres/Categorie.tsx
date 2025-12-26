import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from '../../app/categoriesSlice';
import {
  fetchSousCategories,
  createSousCategorie,
  updateSousCategorie,
  activateSousCategorie,
  deactivateSousCategorie,
  deleteSousCategorie,
} from '../../app/sousCategoriesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Categorie } from '../../app/categoriesSlice';
import type { SousCategorie } from '../../app/sousCategoriesSlice';
import { FiPlus, FiX,  FiLoader, FiTag, FiPackage, FiLayers, FiArrowLeft } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';
import { useNavigate } from 'react-router-dom';

type OuiNonButtonProps = {
  value: 'OUI' | 'NON';
  setValue: (v: 'OUI' | 'NON') => void;
  label: string;
};

const OuiNonButton: React.FC<OuiNonButtonProps> = ({ value, setValue, label }) => (
  <div className="flex gap-4 items-center">
    <button type="button" onClick={() => setValue('OUI')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${value === 'OUI' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-100 text-gray-500'}`}>
      Oui
    </button>
    <button type="button" onClick={() => setValue('NON')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${value === 'NON' ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-gray-100 text-gray-500'}`}>
      Non
    </button>
    <span className="text-sm font-medium text-gray-600">{label}</span>
  </div>
);

const useAppDispatch = () => useDispatch<AppDispatch>();

const CategoriePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: categories, loading: catLoading } = useSelector((state: RootState) => state.categories);
  const { data: sousCategories, loading: sousLoading } = useSelector((state: RootState) => state.sousCategories);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSousCategories());
  }, [dispatch]);

  // États pour Catégories
  const [catModal, setCatModal] = useState<'none' | 'form'>('none');
  const [editingCat, setEditingCat] = useState<Categorie | null>(null);
  const [catModuleId, setCatModuleId] = useState('');
  const [catAchat, setCatAchat] = useState<'OUI' | 'NON'>('OUI');
  const [catVente, setCatVente] = useState<'OUI' | 'NON'>('NON');

  // États pour Sous-Catégories
  const [sousModal, setSousModal] = useState<'none' | 'form'>('none');
  const [editingSous, setEditingSous] = useState<SousCategorie | null>(null);
  const [sousLibelle, setSousLibelle] = useState('');
  const [sousCategorieId, setSousCategorieId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState({ text: '', isError: false });
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  // === Gestion Catégories ===
  const openCatEdit = (cat: Categorie) => {
    setEditingCat(cat);
    setCatModuleId(cat.moduleId);
    setCatAchat(cat.achat);
    setCatVente(cat.vente);
    setCatModal('form');
  };

  const closeCatModal = () => {
    setCatModal('none');
    setEditingCat(null);
    setCatModuleId('');
    setCatAchat('OUI');
    setCatVente('NON');
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { moduleId: catModuleId, achat: catAchat, vente: catVente };
    if (editingCat) {
      await dispatch(updateCategorie({ id: editingCat.id, ...payload }));
    } else {
      await dispatch(createCategorie(payload));
    }
    setIsSubmitting(false);
    closeCatModal();
  };

  // === Gestion Sous-Catégories ===
  const openSousEdit = (sous: SousCategorie) => {
    setEditingSous(sous);
    setSousLibelle(sous.libelleSousCategorie);
    setSousCategorieId(sous.categorieId);
    setSousModal('form');
  };

  const closeSousModal = () => {
    setSousModal('none');
    setEditingSous(null);
    setSousLibelle('');
    setSousCategorieId('');
    // setMessage({ text: '', isError: false });
  };

  const handleSousSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { libelleSousCategorie: sousLibelle, categorieId: sousCategorieId };
    if (editingSous) {
      await dispatch(updateSousCategorie({ id: editingSous.id, ...payload }));
    } else {
      await dispatch(createSousCategorie(payload));
    }
    setIsSubmitting(false);
    closeSousModal();
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Overlay global */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-gray-100">
            <FiLoader className="text-indigo-600 animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Traitement...</p>
          </div>
        </div>
      )}

      {/* SECTION CATÉGORIES */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-xl hover:bg-gray-200 transition-all">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <FiPackage className="text-indigo-600" /> Catégories
              </h2>
            </div>
          </div>
          <button onClick={() => setCatModal('form')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
            <FiPlus size={20} /> Nouvelle Catégorie
          </button>
        </div>

        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Module</th>
                <th className="px-6 py-5 text-left">Achat</th>
                <th className="px-6 py-5 text-left">Vente</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white font-medium">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                        <FiPackage size={18} />
                      </div>
                      <div>
                        <span className="text-gray-900 font-black text-sm">{cat.module.nom}</span>
                        <p className="text-xs text-gray-500">{cat.module.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-black ${cat.achat === 'OUI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.achat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-black ${cat.vente === 'OUI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.vente}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                      <button onClick={() => openCatEdit(cat)} className="text-blue-600 hover:underline">Modifier</button>
                      <button onClick={() => { setAuditEntityId(cat.id); setAuditEntityName(cat.module.nom); }} className="text-purple-600 hover:underline">Historique</button>
                      <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteCategorie(cat.id))} className="text-red-500 hover:underline">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {catLoading && categories.length === 0 && (
            <div className="p-20 text-center text-gray-400">Chargement des catégories...</div>
          )}
        </div>
      </div>

      {/* SECTION SOUS-CATÉGORIES */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiLayers className="text-indigo-600" /> Sous-Catégories
          </h2>
          <button onClick={() => setSousModal('form')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
            <FiPlus size={20} /> Nouvelle Sous-Catégorie
          </button>
        </div>

        <div className="bg-white border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Code</th>
                <th className="px-6 py-5 text-left">Libellé</th>
                <th className="px-6 py-5 text-left">Catégorie Parente</th>
                <th className="px-6 py-5 text-left">Statut</th>
                <th className="px-6 py-5 text-left">Date d'application</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white font-medium">
              {sousCategories.map((sous) => (
                <tr key={sous.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-xs font-mono font-black bg-gray-50 text-indigo-600 px-3 py-1 rounded-lg border border-gray-100">
                      <FiTag size={12} /> {sous.codeSousCategorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm">{sous.libelleSousCategorie}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sous.categorie.module.nom} ({sous.categorie.achat}/{sous.categorie.vente})
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${sous.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sous.status === 'ACTIF' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {sous.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sous.dateActivation ? new Date(sous.dateActivation).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 text-[11px] font-black uppercase tracking-tighter">
                      <button onClick={() => openSousEdit(sous)} className="text-blue-600 hover:underline">Modifier</button>
                      <button
                        onClick={() => dispatch(sous.status === 'ACTIF' ? deactivateSousCategorie(sous.id) : activateSousCategorie(sous.id))}
                        className={sous.status === 'ACTIF' ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'}
                      >
                        {sous.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteSousCategorie(sous.id))} className="text-red-500 hover:underline">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sousLoading && sousCategories.length === 0 && (
            <div className="p-20 text-center text-gray-400">Chargement des sous-catégories...</div>
          )}
        </div>
      </div>

      {/* Modal Catégorie */}
      {catModal === 'form' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white  w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">Catégorie</h3>
              <button onClick={closeCatModal}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-8 space-y-8">
              <select value={catModuleId} onChange={(e) => setCatModuleId(e.target.value)} required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                <option value="">Choisir un module</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
              <OuiNonButton value={catAchat} setValue={setCatAchat} label="Achat autorisé" />
              <OuiNonButton value={catVente} setValue={setCatVente} label="Vente autorisée" />
              <div className="flex gap-4">
                <button type="button" onClick={closeCatModal} className="flex-1 py-4 border border-gray-100  rounded-2xl">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sous-Catégorie */}
      {sousModal === 'form' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white  w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-800">Sous-Catégorie</h3>
              <button onClick={closeSousModal}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSousSubmit} className="p-8 space-y-6">
              <input
                type="text"
                placeholder="Libellé sous-catégorie"
                value={sousLibelle}
                onChange={(e) => setSousLibelle(e.target.value)}
                required
                className="w-full p-4 bg-gray-50 border  border-gray-100  rounded-2xl"
              />
              <select value={sousCategorieId} onChange={(e) => setSousCategorieId(e.target.value)} required className="w-full p-4 bg-gray-50 border border-gray-100  rounded-2xl">
                <option value="">Choisir une catégorie parente</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.module.nom} ({c.achat}/{c.vente})
                  </option>
                ))}
              </select>
              <div className="flex gap-4">
                <button type="button" onClick={closeSousModal} className="flex-1 py-4 border rounded-2xl border-gray-100 ">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuditModal entity="CATEGORIE" entityId={auditEntityId} entityName={auditEntityName} isOpen={!!auditEntityId} onClose={() => setAuditEntityId(null)} />
    </div>
  );
};

export default CategoriePage;