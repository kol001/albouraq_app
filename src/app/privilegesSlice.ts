import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; 
import axiosInstance from '../service/Axios'; // Assure-toi que baseURL est '/api' pour le proxy

// Types (basés sur ta réponse API)
export interface Autorisation {
  id: string;
  nom: string;
}

export interface Privilege {
  id: string;
  privilege: string;
  fonctionnalite: string;
  autorisations: Autorisation[];
}

export interface PrivilegesState {
  data: Privilege[];
  loading: boolean;
  error: string | null;
}

// Async thunk pour fetch les privilèges (récupère le token depuis le store via extraArgument)
export const fetchPrivileges = createAsyncThunk<
  { success: boolean; data: Privilege[] }, // Return type
  void, // Args (aucun)
  { state: { auth: { token: string } } } // Extra pour accéder au store
>(
  'privileges/fetchPrivileges',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.get('/privileges', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        console.log('Privilèges récupérés:', response.data.data); // Afficher les privilèges dans le console.log
        return { success: true, data: response.data.data };
      } else {
        return rejectWithValue('Échec de la récupération des privilèges');
      }
    } catch (error: any) {
      console.error('Erreur fetch privilèges:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Nouveau thunk pour créer un privilège
export const createPrivilege = createAsyncThunk<
  { success: boolean; data: Privilege },
  { privilege: string; fonctionnalite: string },
  { state: { auth: { token: string } } }
>(
  'privileges/createPrivilege',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.post('/privileges', payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      // CORRECTION ICI : la réponse est { success: true, data: { privilège } }
      if (response.data.success) {
        // Optionnel : re-fetch pour cohérence (comme dans les autres slices)
        // dispatch(fetchPrivileges());

        return { success: true, data: response.data.data };
      }

      return rejectWithValue('Échec de la création du privilège');
    } catch (error: any) {
      console.error('Erreur create privilege:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

const initialState: PrivilegesState = {
  data: [],
  loading: false,
  error: null,
};

const privilegesSlice = createSlice({
  name: 'privileges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivileges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrivileges.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Privilege[] }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = action.payload.data;
          console.log('Privilèges stockés dans le store:', state.data); // Afficher les privilèges dans le console.log
        }
      })
      .addCase(fetchPrivileges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Nouveaux cases pour createPrivilege
      .addCase(createPrivilege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrivilege.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Privilege }>) => {
        state.loading = false;
        if (action.payload.success) {
          // Ajoute le nouveau privilège à la liste (optimistic update)
          state.data.push(action.payload.data);
        }
      })
      .addCase(createPrivilege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = privilegesSlice.actions;
export default privilegesSlice.reducer;