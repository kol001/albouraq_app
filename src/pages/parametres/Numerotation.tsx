import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createDossier,
  fetchDossiers,
  resetDossier,
  resetAllDossiers,
} from '../../app/numerotationSlice';
import type { RootState, AppDispatch } from '../../app/store';
// import type { Dossier } from '../../app/numerotationSlice';

const Numerotation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: dossiers, loading, error: globalError } = useSelector((state: RootState) => state.numerotation);

  // États création
  const [perimetre, setPerimetre] = useState('');
  const [type, setType] = useState('DOSSIER');
  const [suffixe, setSuffixe] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Fetch au montage
  useEffect(() => {
    dispatch(fetchDossiers());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perimetre || !suffixe) {
      setCreateError('Tous les champs sont requis');
      return;
    }
    const result = await dispatch(createDossier({ perimetre, type, suffixe }));
    if (createDossier.fulfilled.match(result)) {
      setCreateSuccess('Dossier créé avec succès !');
      setPerimetre('');
      setSuffixe('');
      setTimeout(() => setCreateSuccess(''), 1500);
    } else {
      setCreateError('Erreur lors de la création');
    }
  };

  const handleReset = (id: string) => {
    if (window.confirm('Reset numérotation de ce dossier ?')) {
      dispatch(resetDossier({ id }));
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset numérotation pour TOUS les dossiers ?')) {
      dispatch(resetAllDossiers());
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Numérotation / Gestion des Dossiers</h2>
        <button
          onClick={() => handleResetAll()}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md"
          disabled={loading}
        >
          Reset Numérotation Globale
        </button>
      </div>

      {globalError && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100">{globalError}</div>}

      {/* Formulaire création */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Créer un nouveau dossier</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Périmètre</label>
            <input
              type="text"
              value={perimetre}
              onChange={(e) => setPerimetre(e.target.value)}
              placeholder="ex: Dossier Billet"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Suffixe</label>
            <input
              type="text"
              value={suffixe}
              onChange={(e) => setSuffixe(e.target.value)}
              placeholder="ex: DOSBLL"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="DOSSIER">DOSSIER</option>
              <option value="DEVIS">DEVIS</option>
              {/* Ajoute d'autres types si besoin */}
            </select>
          </div>
          {createError && <p className="text-red-500 text-sm col-span-3">{createError}</p>}
          {createSuccess && <p className="text-green-500 text-sm col-span-3">{createSuccess}</p>}
          <button
            type="submit"
            disabled={loading}
            className="col-span-3 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer Dossier'}
          </button>
        </form>
      </div>

      {/* Tableau dossiers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Périmètre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Suffixe</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Numéro actuel</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date création</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dossiers.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{d.perimetre}</td>
                <td className="px-6 py-4 text-sm">{d.type}</td>
                <td className="px-6 py-4 text-sm">{d.suffixe}</td>
                <td className="px-6 py-4 text-sm font-bold">{d.numero}</td>
                <td className="px-6 py-4 text-sm">{new Date(d.dateCreation).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleReset(d.id)}
                    className="text-yellow-600 hover:text-yellow-800 text-xs font-bold mr-3"
                  >
                    Reset Numérotation
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Numerotation;