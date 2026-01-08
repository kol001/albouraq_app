import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDossiersCommuns } from '../../app/front_office/dossierCommunSlice';
import { fetchPrivileges } from '../../app/back_office/privilegesSlice';
import { fetchProfiles } from '../../app/back_office/profilesSlice';
import { fetchAutorisations } from '../../app/back_office/autorisationsSlice';
import { fetchUsers } from '../../app/back_office/usersSlice';
import { fetchTransactionTypes } from '../../app/back_office/transactionTypesSlice';
import { fetchTransactions } from '../../app/back_office/transactionsSlice';
import { fetchModules } from '../../app/back_office/modulesSlice';
import { fetchModeles} from '../../app/back_office/modelesSlice';
import { fetchCommissions } from '../../app/back_office/commissionsSlice';
import { fetchDossiers } from '../../app/back_office/numerotationSlice';
import { fetchMiles } from '../../app/back_office/milesSlice';
import { fetchPieces } from '../../app/back_office/piecesSlice';
import { fetchClientBeneficiaires } from '../../app/back_office/clientBeneficiairesSlice';
import { fetchDevisTransactions } from '../../app/back_office/devisTransactionsSlice';
import { fetchClientFactures } from '../../app/back_office/clientFacturesSlice';
import { fetchArticles } from '../../app/back_office/articlesSlice';
import { fetchFournisseurs } from '../../app/back_office/fournisseursSlice';
import type { RootState, AppDispatch } from '../../app/store';
import {
  FiPlus, FiFolder, FiUser, FiPhone, FiCalendar, FiRefreshCw,
   FiUsers as FiClients,
} from 'react-icons/fi';

const useAppDispatch = () => useDispatch<AppDispatch>();

function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { token, user } = useSelector((state: RootState) => state.auth);
  const { data: dossiers, loading: loadingDossiers } = useSelector((state: RootState) => state.dossierCommun);

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

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = () => {
      dispatch(fetchDossiersCommuns());
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
      if (miles.length === 0 && !milesLoading)dispatch(fetchMiles());

    };
    loadData();
  }, [dispatch, token, navigate, privileges.length, profiles.length, autorisations.length, users.length, transactionTypes.length, transactions.length, modules.length, modeles.length, commission.length, numerotation.length, miles.length, pieces.length, clientBeneficiaires.length, devisTransactions.length, clientFacturesSlice.length, articleSlice.length, fournisseurs.length]);

    // Chargement des dossiers communs
   
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

  const handleCreateNew = () => {
    navigate("/dossiers-communs/nouveau");
  };

  const handleOpenDossier = (id: number) => {
    navigate(`/dossiers-communs/${id}`);
  };

   const anyLoading = privilegesLoading || profilesLoading || autorisationsLoading || usersLoading || 
                     transactionTypesLoading || transactionsLoading || modulesLoading || modelesLoading || commissionLoading || numerotationLoading || milesLoading || piecesLoading || clientBeneficiairesLoading || devisTransactionsLoading || articleSliceLoading || fournisseursLoading;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* === SECTION DOSSIERS COMMUNS === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
              <FiFolder className="text-indigo-600" size={40} />
              Mes Dossiers Communs
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Bienvenue, <span className="font-bold">{user?.prenom} {user?.nom}</span> !
            </p>
          </div>
          <div className=''>
            <button
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 flex items-center gap-3 text-lg"
            >
              <FiPlus size={24} />
              Nouveau Dossier Commun
            </button>
            <button
              onClick={handleRefreshAll}
              disabled={anyLoading}
              className="flex mt-5 items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <FiRefreshCw className={anyLoading ? 'animate-spin' : ''} />
              {anyLoading ? 'Mise à jour...' : 'Actualiser les données'}
          </button>
          </div>
        </div>

        {/* Contenu dossiers communs (inchangé) */}
        {loadingDossiers && (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des dossiers...</p>
          </div>
        )}

        {!loadingDossiers && dossiers && dossiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dossiers.map((dossier) => (
              <div
                key={dossier.id}
                onClick={() => handleOpenDossier(dossier.numero)}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group"
              >
                {/* Carte dossier (comme avant) */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-100 text-indigo-600 rounded-2xl p-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FiFolder size={32} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    dossier.status === 'CREER' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {dossier.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Dossier N°{dossier.numero}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{dossier.description || 'Aucune description'}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiUser className="text-indigo-500" />
                    <span className="font-medium">{dossier.contactPrincipal}</span>
                  </div>
                  {dossier.whatsapp && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiPhone className="text-green-500" />
                      <span>{dossier.whatsapp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiClients className="text-purple-500" />
                    <span className="font-medium">{dossier.clientfacture?.libelle || 'Client non défini'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <FiCalendar />
                    <span>{new Date(dossier.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingDossiers && (!dossiers || dossiers.length === 0) && (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-6">
              <FiFolder size={64} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun dossier commun</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Créez votre premier dossier pour commencer à collaborer.
            </p>
            <button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3 mx-auto">
              <FiPlus size={24} />
              Créer un dossier
            </button>
          </div>
        )}
      </div>
  );
}

export default HomePage;