import { configureStore} from '@reduxjs/toolkit'; // Ajout de ThunkDispatch et Action
import type { ThunkDispatch, Action }from '@reduxjs/toolkit'; 
import authReducer from './authSlice';
import privilegesReducer from './privilegesSlice';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import profilesReducer from './profilesSlice';
import autorisationsReducer from './autorisationsSlice';
import usersReducer from './usersSlice';
import transactionTypesReducer from './transactionTypesSlice';
import transactionsReducer from './transactionsSlice';
import modulesReducer from './modulesSlice';


import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const appReducer = combineReducers({
  auth: authReducer,
  privileges: privilegesReducer,
  profiles: profilesReducer,
  autorisations: autorisationsReducer,
  users: usersReducer,
  transactionTypes: transactionTypesReducer,
  transactions: transactionsReducer,
  modules: modulesReducer,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Types pour TypeScript (infère l'état global)
export type RootState = ReturnType<typeof store.getState>;

// Étendu pour supporter les thunks (fix l'erreur dispatch)
export type AppDispatch = ThunkDispatch<RootState, unknown, Action> & typeof store.dispatch;