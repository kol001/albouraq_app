import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  updateProfil,
  assignPrivilegeToProfil,
  deactivatePrivilegeFromProfil,
  assignModuleToProfil,
  deactivateModuleFromProfil,
  assignUserToProfil,
  deactivateUserFromProfil,
  fetchProfiles,
} from '../../../app/profilesSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import { FiArrowLeft,  FiSearch, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

const ProfilFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: profiles } = useSelector((state: RootState) => state.profiles);
  const { data: privileges } = useSelector((state: RootState) => state.privileges);
  const { data: modules } = useSelector((state: RootState) => state.modules);
  const { data: users } = useSelector((state: RootState) => state.users);

  const currentProfil = profiles.find(p => p.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const [nomProfil, setNomProfil] = useState('');
  const [statut, setStatut] = useState<'ACTIF' | 'INACTIF'>('ACTIF');

  const [searchPrivilege, setSearchPrivilege] = useState('');
  const [searchModule, setSearchModule] = useState('');
  const [searchUser, setSearchUser] = useState('');

//   useEffect(() => {
//     if (currentProfil) {
//         setNomProfil(currentProfil.profil);
//         setStatut(currentProfil.status);
//     }
//     }, [id, currentProfil]);

  const handleSave = async () => {
    if (!currentProfil) return;
    setIsSubmitting(true);
    const result = await dispatch(updateProfil({ id: currentProfil.id, profil: nomProfil || currentProfil.profil, status: statut }));
    if (updateProfil.fulfilled.match(result)) {
      setMessage({ text: 'Profil mis à jour avec succès !', isError: false });
      setTimeout(() => navigate('/parametre/profil'), 1500);
    } else {
      setMessage({ text: 'Erreur lors de la sauvegarde.', isError: true });
    }
    setIsSubmitting(false);
  };

  // Gestion des attributions
  const handleAssignPrivilege = async (privilegeId: string) => {
    setIsSubmitting(true);
    await dispatch(assignPrivilegeToProfil({ profilId: id!, privilegeId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };

  const handleDeactivatePrivilege = async (privilegeId: string) => {
    setIsSubmitting(true);
    await dispatch(deactivatePrivilegeFromProfil({ profilId: id!, privilegeId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };

  const handleAssignModule = async (moduleId: string) => {
    setIsSubmitting(true);
    await dispatch(assignModuleToProfil({ profilId: id!, moduleId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };

  const handleDeactivateModule = async (moduleId: string) => {
    setIsSubmitting(true);
    await dispatch(deactivateModuleFromProfil({ profilId: id!, moduleId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };

  const handleAssignUser = async (userId: string) => {
    setIsSubmitting(true);
    await dispatch(assignUserToProfil({ profilId: id!, userId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };

  const handleDeactivateUser = async (userId: string) => {
    setIsSubmitting(true);
    await dispatch(deactivateUserFromProfil({ profilId: id!, userId }));
    await dispatch(fetchProfiles());
    setIsSubmitting(false);
  };


  // Filtres disponibles
  const availablePrivileges = useMemo(() => {
    const assignedIds = currentProfil?.privileges.map(p => p.privilege.id) || [];
    return privileges.filter(p => 
      !assignedIds.includes(p.id) &&
      (p.privilege.toLowerCase().includes(searchPrivilege.toLowerCase()) || 
       p.fonctionnalite.toLowerCase().includes(searchPrivilege.toLowerCase()))
    );
  }, [privileges, currentProfil, searchPrivilege]);

  const availableModules = useMemo(() => {
    const assignedIds = currentProfil?.modules.map(m => m.module.id) || [];
    return modules.filter(m => 
      !assignedIds.includes(m.id) &&
      m.nom.toLowerCase().includes(searchModule.toLowerCase())
    );
  }, [modules, currentProfil, searchModule]);

  const availableUsers = useMemo(() => {
    const assignedIds = currentProfil?.users.map(u => u.user.id) || [];
    return users.filter(u => 
      !assignedIds.includes(u.id) &&
      (u.email.toLowerCase().includes(searchUser.toLowerCase()) || 
       `${u.prenom} ${u.nom}`.toLowerCase().includes(searchUser.toLowerCase()))
    );
  }, [users, currentProfil, searchUser]);

  if (!currentProfil) {
    return <div className="p-8 text-center text-gray-500">Chargement du profil...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Édition du profil : {currentProfil.profil}
          </h2>
          <p className="text-gray-500 italic">Gestion des privilèges, modules et utilisateurs</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-2 ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Infos générales */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase mb-6">Informations du profil</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Nom du profil</label>
                <input
                  type="text"
                  // valeur par défaut avec currentProfil.profil, mais utilisant la donnée modifiée par l'utilisateur avec nomProfil
                  value={nomProfil || currentProfil.profil}
                  onChange={(e) => setNomProfil(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-gray-50 rounded-2xl border font-black uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as 'ACTIF' | 'INACTIF')}
                  className="w-full p-4 bg-gray-50 rounded-2xl border font-medium"
                >
                  <option value="ACTIF">ACTIF</option>
                  <option value="INACTIF">INACTIF</option>
                </select>
              </div>
            </div>
          </div>
          {/* Boutons fixes */}
          <div className=" mt-6 ">
            <div className="max-w-[1600px] mx-auto flex justify-end gap-4">
              <button onClick={() => navigate(-1)} className="px-8 py-4 border rounded-2xl text-gray-600 uppercase text-xs tracking-widest">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 uppercase text-xs tracking-widest"
              >
                {isSubmitting && <FiLoader className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        {/* Attributions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Privilèges */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase mb-6">
              Privilèges ({currentProfil.privileges.length})
            </h4>
            <div className="space-y-3 mb-6">
              {currentProfil.privileges.map((p) => (
                <div key={p.privilege.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold">{p.privilege.privilege}</p>
                    <p className="text-xs text-gray-500">{p.privilege.fonctionnalite}</p>
                    <p className="text-xs text-gray-500 pt-5">Statut : {p.privilege.status}</p>
                  </div>
                  <button onClick={() => handleDeactivatePrivilege(p.privilege.id)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un privilège..."
                value={searchPrivilege}
                onChange={(e) => setSearchPrivilege(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availablePrivileges.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAssignPrivilege(p.id)}
                  className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{p.privilege}</p>
                    <p className="text-xs text-gray-500">{p.fonctionnalite}</p>
                  </div>
                  <FiPlus className="text-indigo-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase mb-6">
              Modules ({currentProfil.modules.length})
            </h4>
            <div className="space-y-3 mb-6">
              {currentProfil.modules.map((m) => (
                <div key={m.module.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold">{m.module.nom}</p>
                    <p className="text-xs text-gray-500">{m.module.code}</p>
                    <p className="text-xs text-gray-500 pt-5">Statut : {m.module.status}</p>
                  </div>
                  <button onClick={() => handleDeactivateModule(m.module.id)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un module..."
                value={searchModule}
                onChange={(e) => setSearchModule(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableModules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleAssignModule(m.id)}
                  className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{m.nom}</p>
                    <p className="text-xs text-gray-500">{m.code}</p>
                  </div>
                  <FiPlus className="text-indigo-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Utilisateurs */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h4 className="text-sm font-black text-indigo-600 uppercase mb-6">
              Utilisateurs ({currentProfil.users.length})
            </h4>
            <div className="space-y-3 mb-6">
              {currentProfil.users.map((u) => (
                <div key={u.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold">{u.user.prenom} {u.user.nom}</p>
                    <p className="text-xs text-gray-500">{u.user.email} - {u.user.departement}</p>
                    <p className="text-xs text-gray-500 pt-5">Statut : {u.user.status}</p>
                  </div>
                  <button onClick={() => handleDeactivateUser(u.user.id)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleAssignUser(u.id)}
                  className="w-full text-left p-4 hover:bg-indigo-50 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{u.prenom} {u.nom}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <FiPlus className="text-indigo-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilFormPage;