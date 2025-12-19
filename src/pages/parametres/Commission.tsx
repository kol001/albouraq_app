import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createCommission,
  updateCommission,
  deleteCommission,
  activateCommission,
  deactivateCommission,
} from '../../app/commissionsSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Commission, ModuleRef } from '../../app/commissionsSlice';

const useAppDispatch = () => useDispatch<AppDispatch>();

const Commission = () => {
  const dispatch = useAppDispatch();
  const { data: commissions, loading: commissionsLoading } = useSelector((state: RootState) => state.commissions);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  // Création
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [dateApplication, setDateApplication] = useState(new Date().toISOString().slice(0, 10)); // Date du jour par défaut
  const [status, setStatus] = useState('ACTIF');
  const [provenantOdoo, setProvenantOdoo] = useState('OUI');
  const [librePrixModule, setLibrePrixModule] = useState('NON');
  const [forfaitUnite, setForfaitUnite] = useState('OUI');
  const [difPrixClientPrixModule, setDifPrixClientPrixModule] = useState('NON');
  const [libre, setLibre] = useState('NON');

  // Édition
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editModuleId, setEditModuleId] = useState('');
  const [editDateApplication, setEditDateApplication] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editProvenantOdoo, setEditProvenantOdoo] = useState('');
  const [editLibrePrixModule, setEditLibrePrixModule] = useState('');
  const [editForfaitUnite, setEditForfaitUnite] = useState('');
  const [editDifPrixClientPrixModule, setEditDifPrixClientPrixModule] = useState('');
  const [editLibre, setEditLibre] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) {
      setSubmitError('Module requis');
      return;
    }
    const result = await dispatch(createCommission({
      moduleId: selectedModuleId,
      dateApplication: new Date().toISOString(), // Date réelle de création
      status,
      provenantOdoo,
      librePrixModule,
      forfaitUnite,
      DifPrixClientPrixModule: difPrixClientPrixModule,
      libre,
    }));
    if (createCommission.fulfilled.match(result)) {
      setSubmitSuccess('Commission créée !');
      setSelectedModuleId('');
      setDateApplication(new Date().toISOString().slice(0, 10));
      setStatus('ACTIF');
      setProvenantOdoo('OUI');
      setLibrePrixModule('NON');
      setForfaitUnite('OUI');
      setDifPrixClientPrixModule('NON');
      setLibre('NON');
    } else {
      setSubmitError('Erreur création');
    }
  };

  const startEdit = (comm: Commission) => {
    setEditingId(comm.id);
    setEditModuleId(comm.moduleId);
    setEditDateApplication(comm.dateApplication.slice(0, 10));
    setEditStatus(comm.status);
    setEditProvenantOdoo(comm.provenantOdoo);
    setEditLibrePrixModule(comm.librePrixModule);
    setEditForfaitUnite(comm.forfaitUnite);
    setEditDifPrixClientPrixModule(comm.DifPrixClientPrixModule);
    setEditLibre(comm.libre);
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = async (id: string) => {
    const result = await dispatch(updateCommission({
      id,
      moduleId: editModuleId,
      dateApplication: new Date(editDateApplication).toISOString(),
      status: editStatus,
      provenantOdoo: editProvenantOdoo,
      librePrixModule: editLibrePrixModule,
      forfaitUnite: editForfaitUnite,
      DifPrixClientPrixModule: editDifPrixClientPrixModule,
      libre: editLibre,
    }));
    if (updateCommission.fulfilled.match(result)) {
      setSubmitSuccess('Commission modifiée !');
      cancelEdit();
    } else {
      setSubmitError('Erreur modification');
    }
  };

  const handleActivate = async (id: string) => {
    await dispatch(activateCommission({ id }));
  };

  const handleDeactivate = async (id: string) => {
    await dispatch(deactivateCommission({ id }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette commission ?')) return;
    await dispatch(deleteCommission({ id }));
  };

  if (commissionsLoading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gestion des Commissions</h2>

      {/* Formulaire création */}
      <form onSubmit={handleCreate} className="mb-10 p-6 bg-gray-50 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Nouvelle Commission</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <label className="block text-sm font-medium mb-1">Date application</label>
            <input
              type="date"
              value={dateApplication}
              onChange={(e) => setDateApplication(e.target.value)}
              className="w-full p-3 border rounded-xl"
              disabled // Non modifiable, fixée à la création
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="ACTIF">ACTIF</option>
              <option value="INACTIF">INACTIF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provenant Odoo</label>
            <select value={provenantOdoo} onChange={(e) => setProvenantOdoo(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="OUI">OUI</option>
              <option value="NON">NON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Libre Prix Module</label>
            <select value={librePrixModule} onChange={(e) => setLibrePrixModule(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="OUI">OUI</option>
              <option value="NON">NON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Forfait Unité</label>
            <select value={forfaitUnite} onChange={(e) => setForfaitUnite(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="OUI">OUI</option>
              <option value="NON">NON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dif Prix Client/Module</label>
            <select value={difPrixClientPrixModule} onChange={(e) => setDifPrixClientPrixModule(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="OUI">OUI</option>
              <option value="NON">NON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Libre</label>
            <select value={libre} onChange={(e) => setLibre(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="OUI">OUI</option>
              <option value="NON">NON</option>
            </select>
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
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date application</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Provenant Odoo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Libre Prix Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Forfait Unité</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Dif Prix Client/Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Libre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {commissions.map((comm) => (
              <tr key={comm.id} className="hover:bg-gray-50 transition">
                {/* Module */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editModuleId} onChange={(e) => setEditModuleId(e.target.value)} className="w-full p-2 border rounded">
                      <option value="">Sélectionner...</option>
                      {modules.map((m: ModuleRef) => (
                        <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>
                      ))}
                    </select>
                  ) : (
                    comm.module ? `${comm.module.nom} (${comm.module.code})` : 'N/A'
                  )}
                </td>

                {/* Date application */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <input
                      type="date"
                      value={editDateApplication}
                      onChange={(e) => setEditDateApplication(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    new Date(comm.dateApplication).toLocaleDateString()
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full p-2 border rounded">
                      <option value="ACTIF">ACTIF</option>
                      <option value="INACTIF">INACTIF</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded text-xs ${comm.status === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {comm.status}
                    </span>
                  )}
                </td>

                {/* Provenant Odoo */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editProvenantOdoo} onChange={(e) => setEditProvenantOdoo(e.target.value)} className="w-full p-2 border rounded">
                      <option value="OUI">OUI</option>
                      <option value="NON">NON</option>
                    </select>
                  ) : (
                    comm.provenantOdoo
                  )}
                </td>

                {/* Libre Prix Module */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editLibrePrixModule} onChange={(e) => setEditLibrePrixModule(e.target.value)} className="w-full p-2 border rounded">
                      <option value="OUI">OUI</option>
                      <option value="NON">NON</option>
                    </select>
                  ) : (
                    comm.librePrixModule
                  )}
                </td>

                {/* Forfait Unité */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editForfaitUnite} onChange={(e) => setEditForfaitUnite(e.target.value)} className="w-full p-2 border rounded">
                      <option value="OUI">OUI</option>
                      <option value="NON">NON</option>
                    </select>
                  ) : (
                    comm.forfaitUnite
                  )}
                </td>

                {/* Dif Prix Client/Module */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editDifPrixClientPrixModule} onChange={(e) => setEditDifPrixClientPrixModule(e.target.value)} className="w-full p-2 border rounded">
                      <option value="OUI">OUI</option>
                      <option value="NON">NON</option>
                    </select>
                  ) : (
                    comm.DifPrixClientPrixModule
                  )}
                </td>

                {/* Libre */}
                <td className="px-6 py-4 text-sm">
                  {editingId === comm.id ? (
                    <select value={editLibre} onChange={(e) => setEditLibre(e.target.value)} className="w-full p-2 border rounded">
                      <option value="OUI">OUI</option>
                      <option value="NON">NON</option>
                    </select>
                  ) : (
                    comm.libre
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 space-x-3 text-xs">
                  {editingId === comm.id ? (
                    <>
                      <button onClick={() => handleUpdate(comm.id)} className="text-green-600 underline">Enregistrer</button>
                      <button onClick={cancelEdit} className="text-gray-600 underline">Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(comm)} className="text-blue-600 underline">Modifier</button>
                      {comm.status !== 'ACTIF' && <button onClick={() => handleActivate(comm.id)} className="text-green-600 underline">Activer</button>}
                      {comm.status === 'ACTIF' && <button onClick={() => handleDeactivate(comm.id)} className="text-yellow-600 underline">Désactiver</button>}
                      <button onClick={() => handleDelete(comm.id)} className="text-red-600 underline">Supprimer</button>
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

export default Commission;