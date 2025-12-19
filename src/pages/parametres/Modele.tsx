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

const useAppDispatch = () => useDispatch<AppDispatch>();

const Modele = () => {
  const dispatch = useAppDispatch();
  const { data: modeles, loading: modelesLoading } = useSelector((state: RootState) => state.modeles);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  // States création (inchangés)
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [fonctionnalite, setFonctionnalite] = useState('');
  const [dateApplication, setDateApplication] = useState('');
  const [status] = useState('ACTIF');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // States édition (inchangés)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editModuleId, setEditModuleId] = useState('');
  const [editFonctionnalite, setEditFonctionnalite] = useState('');
  const [editDateApplication, setEditDateApplication] = useState('');
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      if (isEdit) setEditPdfFile(e.target.files[0]);
      else setPdfFile(e.target.files[0]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !fonctionnalite || !dateApplication || !pdfFile) {
      setSubmitError('Tous les champs sont requis');
      return;
    }

    const result = await dispatch(createModele({
      moduleId: selectedModuleId,
      fonctionnalite,
      dateApplication: new Date(dateApplication).toISOString(),
      status,
      pdf: pdfFile,
    }));

    if (createModele.fulfilled.match(result)) {
      setSubmitSuccess('Modèle créé !');
      setSelectedModuleId('');
      setFonctionnalite('');
      setDateApplication('');
      setPdfFile(null);
    } else {
      setSubmitError('Erreur création');
    }
  };

  const startEdit = (mod: Modele) => {
    setEditingId(mod.id);
    setEditModuleId(mod.moduleId);
    setEditFonctionnalite(mod.fonctionnalite);
    setEditDateApplication(mod.dateApplication.slice(0, 10)); // pour input date
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    const result = await dispatch(updateModele({
      id,
      moduleId: editModuleId,
      fonctionnalite: editFonctionnalite,
      dateApplication: new Date(editDateApplication).toISOString(),
      status,
      pdf: editPdfFile || undefined,
    }));

    if (updateModele.fulfilled.match(result)) {
      setSubmitSuccess('Modèle modifié !');
      cancelEdit();
    } else {
      setSubmitError('Erreur modification');
    }
  };

  const handleActivate = async (id: string) => {
    await dispatch(activateModele({ id }));
  };

  const handleDeactivate = async (id: string) => {
    await dispatch(deactivateModele({ id }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce modèle ?')) return;
    await dispatch(deleteModele({ id }));
  };

  if (modelesLoading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gestion des Modèles</h2>

      {/* Formulaire création */}
      <form onSubmit={handleCreate} className="mb-10 p-6 bg-gray-50 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Nouveau Modèle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Module</label>
            <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="w-full p-3 border rounded-xl" required>
              <option value="">Sélectionner...</option>
              {modules.map((m: ModuleRef) => (
                <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fonctionnalité</label>
            <input value={fonctionnalite} onChange={(e) => setFonctionnalite(e.target.value)} placeholder="ex: CREATION_FACTURE_CLIENT" className="w-full p-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date application</label>
            <input type="date" value={dateApplication} onChange={(e) => setDateApplication(e.target.value)} className="w-full p-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PDF</label>
            <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e)} className="w-full p-3 border rounded-xl" required />
          </div>
        </div>
        <button type="submit" className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700">
          Créer
        </button>
        {submitError && <p className="text-red-500 mt-4">{submitError}</p>}
        {submitSuccess && <p className="text-green-500 mt-4">{submitSuccess}</p>}
      </form>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fonctionnalité</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">PDF</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date application</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {modeles.map((modele) => (
              <tr key={modele.id} className="hover:bg-gray-50 transition">
                {/* Colonne Module */}
                <td className="px-6 py-4 text-sm">
                  {editingId === modele.id ? (
                    <select
                      value={editModuleId}
                      onChange={(e) => setEditModuleId(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Sélectionner...</option>
                      {modules.map((m: ModuleRef) => (
                        <option key={m.id} value={m.id}>
                          {m.nom} ({m.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    `${modele.module.nom} (${modele.module.code})`
                  )}
                </td>

                {/* Colonne Fonctionnalité */}
                <td className="px-6 py-4 text-sm">
                  {editingId === modele.id ? (
                    <input
                      value={editFonctionnalite}
                      onChange={(e) => setEditFonctionnalite(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    modele.fonctionnalite
                  )}
                </td>

                {/* Colonne PDF */}
                <td className="px-6 py-4 text-sm">
                  {editingId === modele.id ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, true)}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <a href={`${API_URL}/${modele.modeleDocument}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      Voir PDF
                    </a>
                  )}
                </td>

                {/* Colonne Date application */}
                <td className="px-6 py-4 text-sm">
                  {editingId === modele.id ? (
                    <input
                      type="date"
                      value={editDateApplication}
                      onChange={(e) => setEditDateApplication(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    new Date(modele.dateApplication).toLocaleDateString()
                  )}
                </td>

                {/* Colonne Status (inchangée, pas éditable ici) */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-xs ${modele.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {modele.status}
                  </span>
                </td>

                {/* Colonne Actions */}
                <td className="px-6 py-4 space-x-3 text-xs">
                  {editingId === modele.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(modele.id)}
                        className="text-green-600 underline"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 underline"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(modele)} className="text-blue-600 underline">
                        Modifier
                      </button>
                      {modele.status !== 'ACTIF' && (
                        <button onClick={() => handleActivate(modele.id)} className="text-green-600 underline">
                          Activer
                        </button>
                      )}
                      {modele.status === 'ACTIF' && (
                        <button onClick={() => handleDeactivate(modele.id)} className="text-yellow-600 underline">
                          Désactiver
                        </button>
                      )}
                      <button onClick={() => handleDelete(modele.id)} className="text-red-600 underline">
                        Supprimer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Modele;