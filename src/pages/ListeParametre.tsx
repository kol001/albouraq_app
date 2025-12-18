import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPrivileges
} from '../app/privilegesSlice';
import {
  fetchProfiles
} from '../app/profilesSlice';
import {
  fetchAutorisations
} from '../app/autorisationsSlice';
// import { logout } from '../app/authSlice';
import { PARAMETRES } from '../constants/parametres';
import type { RootState, AppDispatch } from '../app/store';
import { fetchUsers } from '../app/usersSlice';
import { fetchTransactionTypes } from '../app/transactionTypesSlice';

// Custom hook pour typer le dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

function ListeParametre() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: privileges, loading: privilegesLoading, error: privilegesError } = useSelector((state: RootState) => state.privileges);
  const { data: profiles, loading: profilesLoading, error: profilesError } = useSelector((state: RootState) => state.profiles);
  const { data: autorisations, loading: autorisationsLoading, error: autorisationsError } = useSelector((state: RootState) => state.autorisations);
  const { data: users, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
  const { data: transactionTypes, loading: transactionTypesLoading, error: transactionTypesError } = useSelector((state: RootState) => state.transactionTypes);
  const { token } = useSelector((state: RootState) => state.auth);

  // useEffect pour check token + fetch conditionnels
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (privileges.length === 0 && !privilegesLoading) {
      dispatch(fetchPrivileges());
    }
    if (profiles.length === 0 && !profilesLoading) {
      dispatch(fetchProfiles());
    }
    if (autorisations.length === 0 && !autorisationsLoading) {
      dispatch(fetchAutorisations());
    }
    if (users.length === 0 && !usersLoading) {
      dispatch(fetchUsers());
    }
    // Dans le useEffect :
    if (transactionTypes.length === 0 && !transactionTypesLoading) {
      dispatch(fetchTransactionTypes());
    }
  }, [dispatch, token, navigate, privileges.length, privilegesLoading, profiles.length, profilesLoading, autorisations.length, autorisationsLoading, users.length, usersLoading, transactionTypes.length, transactionTypesLoading]);

  // useEffect pour logs (debug)
  useEffect(() => {
    if (privileges.length > 0) console.log('Privilèges:', privileges);
    if (profiles.length > 0) console.log('Profils:', profiles);
    if (autorisations.length > 0) console.log('Autorisations:', autorisations);
    if (users.length > 0) console.log('Utilisateurs:', users);
  }, [privileges, profiles, autorisations, users]);

  // Fonction déconnexion
  // const handleLogout = () => {
  //   dispatch(logout());
  //   navigate('/login');
  // };

  // Nouvelle fonction : Actualiser toutes les données
  const handleRefreshAll = () => {
    dispatch(fetchPrivileges());
    dispatch(fetchProfiles());
    dispatch(fetchAutorisations());
    dispatch(fetchUsers());
    dispatch(fetchTransactionTypes());
  };

  // Loading/error global
  const anyLoading = privilegesLoading || profilesLoading || autorisationsLoading || usersLoading || transactionTypesLoading;
  const anyError = privilegesError || profilesError || autorisationsError || usersError || transactionTypesError;

  if (anyLoading) {
    return <div className="p-6">Chargement des données...</div>;
  }
  if (anyError) {
    return <div className="p-6 text-red-500">Erreur: {anyError}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des paramètres</h1>
        <div className="flex gap-4">
          {/* Bouton Actualiser tout */}
          <button
            onClick={handleRefreshAll}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow transition-colors flex items-center gap-2"
            title="Rafraîchir toutes les données"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Actualiser tout
          </button>

          {/* Bouton Déconnexion */}
          {/* <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition-colors"
          >
            Déconnexion
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {PARAMETRES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={`/parametre/${item.path}`}
              className="group bg-white rounded-xl shadow
                        hover:shadow-lg transition
                        flex flex-col items-center justify-center
                        aspect-square p-4"
            >
              {/* Icône */}
              <div
                className="flex items-center justify-center
                          w-26 h-26 rounded-full
                          bg-blue-100 text-blue-600
                          group-hover:bg-blue-600 group-hover:text-white
                          transition p-4"
              >
                <Icon size={52} />
              </div>

              {/* Texte */}
              <p className="mt-4 text-center text-sm font-medium text-gray-700">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>


    </div>
  );
}

export default ListeParametre;