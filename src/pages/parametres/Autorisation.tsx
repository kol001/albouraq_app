import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAutorisation,
  fetchAutorisations,
  assignProfileToAutorisation,
  activateAutorisation,
  deactivateAutorisation,
  deleteAutorisation,
  assignModuleToAutorisation,
  updateAutorisation,
} from '../../app/autorisationsSlice';
import { fetchProfiles } from '../../app/profilesSlice';
import type { RootState, AppDispatch } from '../../app/store';
import type { Autorisation } from '../../app/autorisationsSlice';
import { FiShield, FiPlus, FiLink, FiPackage, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import AuditModal from '../../components/AuditModal';

const useAppDispatch = () => useDispatch<AppDispatch>();

const AutorisationPage = () => {
  const dispatch = useAppDispatch();
  const { data: autorisations, loading } = useSelector((state: RootState) => state.autorisations);
  const { data: profiles } = useSelector((state: RootState) => state.profiles);
  const { data: privileges } = useSelector((state: RootState) => state.privileges);
  const { data: modules } = useSelector((state: RootState) => state.modules);

  // État modale
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'assign-profile' | 'assign-module' | 'edit'>('none');

  // États formulaires création
  const [nom, setNom] = useState('');
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // États formulaires édition
  const [editNom, setEditNom] = useState('');
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [editPrivilegeId, setEditPrivilegeId] = useState<string | null>(null);
  const [editingAuthId, setEditingAuthId] = useState('');

  // Assignation
  const [selectedAuthId, setSelectedAuthId] = useState('');
  const [assignProfileId, setAssignProfileId] = useState('');
  const [selectedAuthIdModule, setSelectedAuthIdModule] = useState('');
  const [selectedModuleIdAssign, setSelectedModuleIdAssign] = useState('');

  // Message feedback
  const [message, setMessage] = useState({ text: '', isError: false });

  // Audit
  const [auditEntityId, setAuditEntityId] = useState<string | null>(null);
  const [auditEntityName, setAuditEntityName] = useState('');

  const closeModals = () => {
    setActiveModal('none');
    setMessage({ text: '', isError: false });
    setEditingAuthId('');
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createAutorisation({ nom, moduleId: selectedModuleId, privilegeId: selectedPrivilegeId }));
    if (createAutorisation.fulfilled.match(result)) {
      handleSuccess('Autorisation créée !');
      setNom('');
      setSelectedPrivilegeId('');
      setSelectedModuleId('');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthId) return;
    const result = await dispatch(updateAutorisation({
      id: editingAuthId,
      nom: editNom,
      moduleId: editModuleId,
      privilegeId: editPrivilegeId,
    }));
    if (updateAutorisation.fulfilled.match(result)) {
      handleSuccess('Autorisation modifiée !');
    } else {
      setMessage({ text: 'Erreur de modification', isError: true });
    }
  };

  const handleSubmitAssignProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(assignProfileToAutorisation({ authId: selectedAuthId, profileId: assignProfileId }));
    if (assignProfileToAutorisation.fulfilled.match(result)) {
      handleSuccess('Profil lié avec succès !');
      setSelectedAuthId('');
      setAssignProfileId('');
    }
  };

  const handleSubmitAssignModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(assignModuleToAutorisation({ authId: selectedAuthIdModule, moduleId: selectedModuleIdAssign }));
    if (assignModuleToAutorisation.fulfilled.match(result)) {
      handleSuccess('Module assigné !');
      setSelectedAuthIdModule('');
      setSelectedModuleIdAssign('');
    }
  };

  const handleSuccess = (txt: string) => {
    setMessage({ text: txt, isError: false });
    setTimeout(() => {
      closeModals();
      dispatch(fetchAutorisations());
      dispatch(fetchProfiles());
    }, 1500);
  };

  const openEdit = (aut: Autorisation) => {
    setActiveModal('edit');
    setEditingAuthId(aut.id);
    setEditNom(aut.nom);
    setEditModuleId(aut.moduleId);
    setEditPrivilegeId(aut.privilegeId);
  };

  const openAudit = (autorisation: Autorisation) => {
    setAuditEntityId(autorisation.id);
    setAuditEntityName(autorisation.nom);
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
            <FiShield className="text-indigo-600" /> Paramétrage Autorisations
          </h2>
          <p className="text-sm text-gray-500">Définissez les accès fins par module et privilège.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveModal('assign-module')} className="bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2">
            <FiPackage size={16} /> + Module
          </button>
          <button onClick={() => setActiveModal('assign-profile')} className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2">
            <FiLink size={16} /> + Profil
          </button>
          <button onClick={() => setActiveModal('create')} className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-all shadow-md flex items-center gap-2">
            <FiPlus size={18} /> Nouvelle Autorisation
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Autorisation</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Profil</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Privilège / Fonction</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {autorisations.map((aut: Autorisation) => (
              <tr key={aut.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-gray-900 tracking-tight">{aut.nom}</span>
                </td>
                <td className="px-6 py-4">
                  {aut.module ? (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100">
                      {aut.module.nom}
                    </span>
                  ) : <span className="text-gray-300 italic text-xs">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {aut.profiles && aut.profiles.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {aut.profiles.map((profile) => (
                        <li key={profile.id} className="text-sm text-gray-900">
                          <span className="font-bold">{profile.profil}</span>
                          <span className="text-xs text-gray-500 ml-2">({profile.status})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 italic">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">{aut.privilege?.privilege || 'N/A'}</div>
                  <div className="text-[10px] text-gray-400">{aut.privilege?.fonctionnalite}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    aut.status === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {aut.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(aut)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">
                     Modifier
                  </button>
                  <button 
                    onClick={() => aut.status === 'ACTIF' ? dispatch(deactivateAutorisation({ authId: aut.id })) : dispatch(activateAutorisation({ authId: aut.id }))} 
                    className={`text-xs font-bold ${aut.status === 'ACTIF' ? 'text-amber-600' : 'text-green-600'}`}
                  >
                    {aut.status === 'ACTIF' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => openAudit(aut)}
                    className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                  >
                    Historique
                  </button>
                  <button onClick={() => window.confirm('Supprimer ?') && dispatch(deleteAutorisation({ authId: aut.id }))} className="text-red-500 text-xs font-bold pl-2 border-l">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE COMMUNE */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-in-center">
            <div className={`p-6 border-b flex justify-between items-center ${
              activeModal === 'create' ? 'bg-indigo-50' : activeModal === 'assign-profile' ? 'bg-blue-50' : activeModal === 'assign-module' ? 'bg-purple-50' : 'bg-blue-50'
            }`}>
              <h3 className="text-xl font-bold text-gray-800">
                {activeModal === 'create' && 'Nouvelle Autorisation'}
                {activeModal === 'assign-profile' && 'Lier un Autorisation à un Profil'}
                {activeModal === 'assign-module' && 'Assigner un Autorisation à un Module'}
                {activeModal === 'edit' && 'Modifier l\'Autorisation'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            <div className="p-8">
              {/* Formulaire Création */}
              {activeModal === 'create' && (
                <form onSubmit={handleSubmitCreate} className="space-y-4">
                  <input type="text" placeholder="Nom de l'autorisation" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                  <select value={selectedPrivilegeId} onChange={(e) => setSelectedPrivilegeId(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" required>
                    <option value="">Sélectionner un Privilège</option>
                    {privileges.map(p => <option key={p.id} value={p.id}>{p.privilege} - {p.fonctionnalite}</option>)}
                  </select>
                  <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500" required>
                    <option value="">Sélectionner un Module</option>
                    {modules.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all mt-4">
                    {loading ? 'Création...' : 'Créer l\'autorisation'}
                  </button>
                </form>
              )}

              {/* Formulaire Edition */}
              {activeModal === 'edit' && (
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                  <input type="text" placeholder="Nom de l'autorisation" value={editNom} onChange={(e) => setEditNom(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                  <select value={editPrivilegeId || ''} onChange={(e) => setEditPrivilegeId(e.target.value || null)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="">Aucun Privilège (optionnel)</option>
                    {privileges.map(p => <option key={p.id} value={p.id}>{p.privilege} - {p.fonctionnalite}</option>)}
                  </select>
                  <select value={editModuleId || ''} onChange={(e) => setEditModuleId(e.target.value || null)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="">Aucun Module (optionnel)</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                  </select>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4">
                    {loading ? 'Modification...' : 'Modifier l\'autorisation'}
                  </button>
                </form>
              )}

              {/* Formulaire Profil */}
              {activeModal === 'assign-profile' && (
                <form onSubmit={handleSubmitAssignProfile} className="space-y-4">
                  <select value={selectedAuthId} onChange={(e) => setSelectedAuthId(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Sélectionner l'Autorisation</option>
                    {autorisations.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                  </select>
                  <select value={assignProfileId} onChange={(e) => setAssignProfileId(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Sélectionner un Profil</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.profil}</option>)}
                  </select>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4">
                    Lier le Profil
                  </button>
                </form>
              )}

              {/* Formulaire Module */}
              {activeModal === 'assign-module' && (
                <form onSubmit={handleSubmitAssignModule} className="space-y-4">
                  <select value={selectedAuthIdModule} onChange={(e) => setSelectedAuthIdModule(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500" required>
                    <option value="">Choisir une Autorisation</option>
                    {autorisations.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                  </select>
                  <select value={selectedModuleIdAssign} onChange={(e) => setSelectedModuleIdAssign(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500" required>
                    <option value="">Choisir un Module</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                  </select>
                  <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all mt-4">
                    Assigner le Module
                  </button>
                </form>
              )}

              {/* Feedback */}
              {message.text && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-bounce-short ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.isError ? <FiAlertCircle /> : <FiCheckCircle />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuditModal
        entity="AUTORISATION"
        entityId={auditEntityId}
        entityName={auditEntityName}
        isOpen={!!auditEntityId}
        onClose={closeAudit}
      />
    </div>
  );
};

export default AutorisationPage;