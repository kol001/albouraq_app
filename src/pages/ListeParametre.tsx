import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrivileges } from '../app/back_office/privilegesSlice';
import { fetchProfiles } from '../app/back_office/profilesSlice';
import { fetchAutorisations } from '../app/back_office/autorisationsSlice';
import { fetchUsers } from '../app/back_office/usersSlice';
import { fetchTransactionTypes } from '../app/back_office/transactionTypesSlice';
import { fetchTransactions } from '../app/back_office/transactionsSlice';
import { fetchModules } from '../app/back_office/modulesSlice';
import { fetchModeles} from '../app/back_office/modelesSlice';
import { fetchCommissions } from '../app/back_office/commissionsSlice';
import { fetchDossiers } from '../app/back_office/numerotationSlice';
import { fetchMiles } from '../app/back_office/milesSlice';
import { fetchPieces } from '../app/back_office/piecesSlice';
import { fetchClientBeneficiaires } from '../app/back_office/clientBeneficiairesSlice';
import { fetchDevisTransactions } from '../app/back_office/devisTransactionsSlice';
import { fetchClientFactures } from '../app/back_office/clientFacturesSlice';
import { fetchArticles } from '../app/back_office/articlesSlice';
import { fetchFournisseurs } from '../app/back_office/fournisseursSlice';
import { PARAMETRES } from '../constants/parametres';
import type { RootState, AppDispatch } from '../app/store';
import { FiRefreshCw, FiChevronRight, FiActivity } from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

function ListeParametre() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Selectors
  const { data: privileges, loading: privilegesLoading } = useSelector((state: RootState) => state.privileges);
  const { data: profiles, loading: profilesLoading } = useSelector((state: RootState) => state.profiles);
  const { data: autorisations, loading: autorisationsLoading } = useSelector((state: RootState) => state.autorisations);
  const { data: users, loading: usersLoading } = useSelector((state: RootState) => state.users);
  const { data: transactionTypes, loading: transactionTypesLoading } = useSelector((state: RootState) => state.transactionTypes);
  const { data: transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
  const { data: modules, loading: modulesLoading } = useSelector((state: RootState) => state.modules);
  const { data: modeles, loading: modelesLoading } = useSelector((state: RootState) => state.modeles);
  const { data: commission, loading: commissionLoading } = useSelector((state: RootState) => state.commissions);
  const { data: numerotation, loading: numerotationLoading } = useSelector((state: RootState) => state.numerotation);
  const { data: miles, loading: milesLoading } = useSelector((state: RootState) => state.miles);
  const { data: pieces, loading: piecesLoading } = useSelector((state: RootState) => state.pieces);
  const { data: clientBeneficiaires, loading: clientBeneficiairesLoading } = useSelector((state: RootState) => state.clientBeneficiaires);
  const { data: devisTransactions, loading: devisTransactionsLoading } = useSelector((state: RootState) => state.devisTransactions);
  const { data: clientFacturesSlice, loading: clientFacturesSliceLoading } = useSelector((state: RootState) => state.clientFactures);
  const { data: articleSlice, loading: articleSliceLoading } = useSelector((state: RootState) => state.articles);
  const { data: fournisseurs, loading: fournisseursLoading } = useSelector((state: RootState) => state.fournisseurs);
  
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const loadData = () => {
      if (privileges.length === 0 && !privilegesLoading) dispatch(fetchPrivileges());
      if (profiles.length === 0 && !profilesLoading) dispatch(fetchProfiles());
      if (autorisations.length === 0 && !autorisationsLoading) dispatch(fetchAutorisations());
      if (users.length === 0 && !usersLoading) dispatch(fetchUsers());
      if (transactionTypes.length === 0 && !transactionTypesLoading) dispatch(fetchTransactionTypes());
      if (transactions.length === 0 && !transactionsLoading) dispatch(fetchTransactions());
      if (modules.length === 0 && !modulesLoading) dispatch(fetchModules());
      if (modeles.length === 0 && !modelesLoading) dispatch(fetchModeles());
      if (commission.length === 0 && !commissionLoading)dispatch(fetchCommissions());
      if (numerotation.length === 0 && !numerotationLoading)dispatch(fetchDossiers());
      if (miles.length === 0 && !milesLoading)dispatch(fetchDossiers());
      if (pieces.length === 0 && !piecesLoading)dispatch(fetchPieces());
      if (clientBeneficiaires.length === 0 && !clientBeneficiairesLoading)dispatch(fetchClientBeneficiaires());
      if (devisTransactions.length === 0 && !devisTransactionsLoading)dispatch(fetchDevisTransactions());
      if (clientFacturesSlice.length === 0 && !clientFacturesSliceLoading)dispatch(fetchClientFactures());
      if (articleSlice.length === 0 && !articleSliceLoading)dispatch(fetchArticles());
      if (fournisseurs.length === 0 && !fournisseursLoading)dispatch(fetchFournisseurs());

    };
    loadData();
  }, [dispatch, token, navigate, privileges.length, profiles.length, autorisations.length, users.length, transactionTypes.length, transactions.length, modules.length, modeles.length, commission.length, numerotation.length, miles.length, pieces.length, clientBeneficiaires.length, devisTransactions.length, clientFacturesSlice.length, articleSlice.length, fournisseurs.length]);

  const handleRefreshAll = () => {
    dispatch(fetchPrivileges());
    dispatch(fetchProfiles());
    dispatch(fetchAutorisations());
    dispatch(fetchUsers());
    dispatch(fetchTransactionTypes());
    dispatch(fetchTransactions());
    dispatch(fetchModules());
    dispatch(fetchModeles());
    dispatch(fetchCommissions());
    dispatch(fetchDossiers());
    dispatch(fetchMiles());
    dispatch(fetchPieces());
    dispatch(fetchClientBeneficiaires());
    dispatch(fetchDevisTransactions());
    dispatch(fetchClientFactures());
    dispatch(fetchArticles());
    dispatch(fetchFournisseurs());
  };

  const anyLoading = privilegesLoading || profilesLoading || autorisationsLoading || usersLoading || 
                     transactionTypesLoading || transactionsLoading || modulesLoading || modelesLoading || commissionLoading || numerotationLoading || milesLoading || piecesLoading || clientBeneficiairesLoading || devisTransactionsLoading || articleSliceLoading || fournisseursLoading;

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER AVEC STATUT SYSTÈME */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FiActivity className="text-indigo-600" /> Console d'Administration
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Configurez les fondations techniques de votre plateforme.</p>
        </div>
        
        <button
          onClick={handleRefreshAll}
          disabled={anyLoading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
        >
          <FiRefreshCw className={anyLoading ? 'animate-spin' : ''} />
          {anyLoading ? 'Mise à jour...' : 'Actualiser les données'}
        </button>
      </div>

      {/* SECTION DES CARTES DE PARAMÈTRES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PARAMETRES.map((item) => {
          const Icon = item.icon;
          // const count = getCountForPath(item.path);
          
          return (
            <Link
              key={item.path}
              to={`/parametre/${item.path}`}
              className="group relative bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={28} />
                </div>

              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700">
                  {item.label}
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-1 font-medium">
                  Gérer les configurations <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Barre de progression décorative en bas */}
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 rounded-b-2xl transition-all duration-500 w-0 group-hover:w-full opacity-50" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ListeParametre;