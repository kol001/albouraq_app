import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {PayloadAction}  from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios'; // Assure-toi que baseURL est '/api'

// Types basés sur la réponse API
export interface ProfileRef {
  id: string;
  profil: string;
}

export interface PrivilegeRef {
  id: string;
  privilege: string;
  fonctionnalite: string;
}

export interface Autorisation {
  id: string;
  nom: string;
  status: string;
  profileId: string | null;
  moduleId: string | null;
  privilegeId: string | null;
  profile: ProfileRef | null;
  privilege: PrivilegeRef | null;
}

export interface AutorisationsState {
  data: Autorisation[];
  loading: boolean;
  error: string | null;
}

// Async thunk pour fetch les autorisations
export const fetchAutorisations = createAsyncThunk<
  { success: boolean; data: Autorisation[] }, // Return type
  void, // Args (aucun)
  { state: { auth: { token: string } } } // Extra pour token
>(
  'autorisations/fetchAutorisations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.get('/autorisations', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return rejectWithValue('Échec de la récupération des autorisations');
      }
    } catch (error: any) {
      console.error('Erreur fetch autorisations:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Placeholder thunk pour créer une autorisation (étends avec vrai POST)
// Nouveau thunk pour créer une autorisation (réel POST)
export const createAutorisation = createAsyncThunk<
  { success: boolean; data: Autorisation }, // Return type
  { nom: string; profileId: string; privilegeId: string }, // Args (moduleId ajouté en dur dans le thunk)
  { state: { auth: { token: string } } } // Extra pour token
>(
  'autorisations/createAutorisation',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.post('/autorisations', {
        ...payload,
        moduleId: '', // Vide pour l'instant, comme spécifié
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Gestion réponse nested
      if (response.data.success && response.data.data.success) {
        return { success: true, data: response.data.data.data };
      } else {
        return rejectWithValue('Échec de la création de l\'autorisation');
      }
    } catch (error: any) {
      console.error('Erreur create autorisation:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour assigner un profil à une autorisation
export const assignProfileToAutorisation = createAsyncThunk<
  { success: boolean; data: Autorisation }, // Return type (updated autorisation)
  { authId: string; profileId: string }, // Args
  { state: { auth: { token: string } } } // Extra pour token
>(
  'autorisations/assignProfileToAutorisation',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/autorisations/${payload.authId}/assign-profile/${payload.profileId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Gestion réponse nested (comme avant)
      let updatedAuth: Autorisation;
      if (response.data.data && response.data.data.success) {
        updatedAuth = response.data.data.data;
      } else if (response.data.success) {
        updatedAuth = response.data.data;
      } else {
        return rejectWithValue('Échec de l\'assignation');
      }

      // Re-fetch pour cohérence (met à jour toute la liste)
      dispatch(fetchAutorisations());

      return { success: true, data: updatedAuth };
    } catch (error: any) {
      console.error('Erreur assign profile to autorisation:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour activer une autorisation
export const activateAutorisation = createAsyncThunk<
  { success: boolean; data: Autorisation },
  { authId: string },
  { state: { auth: { token: string } } }
>(
  'autorisations/activateAutorisation',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/autorisations/${payload.authId}/activate`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedAuth: Autorisation;
      if (response.data.data && response.data.data.success) {
        updatedAuth = response.data.data.data;
      } else if (response.data.success) {
        updatedAuth = response.data.data;
      } else {
        return rejectWithValue('Échec de l\'activation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchAutorisations());

      return { success: true, data: updatedAuth };
    } catch (error: any) {
      console.error('Erreur activate autorisation:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour désactiver une autorisation
export const deactivateAutorisation = createAsyncThunk<
  { success: boolean; data: Autorisation },
  { authId: string },
  { state: { auth: { token: string } } }
>(
  'autorisations/deactivateAutorisation',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/autorisations/${payload.authId}/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedAuth: Autorisation;
      if (response.data.data && response.data.data.success) {
        updatedAuth = response.data.data.data;
      } else if (response.data.success) {
        updatedAuth = response.data.data;
      } else {
        return rejectWithValue('Échec de la désactivation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchAutorisations());

      return { success: true, data: updatedAuth };
    } catch (error: any) {
      console.error('Erreur deactivate autorisation:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour supprimer une autorisation
export const deleteAutorisation = createAsyncThunk<
  { success: boolean; data: string }, // Return ID supprimé
  { authId: string },
  { state: { auth: { token: string } } }
>(
  'autorisations/deleteAutorisation',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.delete(`/autorisations/${payload.authId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        // Re-fetch pour cohérence (supprime de la liste)
        dispatch(fetchAutorisations());
        return { success: true, data: payload.authId };
      } else {
        return rejectWithValue('Échec de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur delete autorisation:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

const initialState: AutorisationsState = {
  data: [],
  loading: false,
  error: null,
};

const autorisationsSlice = createSlice({
  name: 'autorisations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAutorisations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAutorisations.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Autorisation[] }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchAutorisations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cases pour create (simulé)
      .addCase(createAutorisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAutorisation.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Autorisation }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(createAutorisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignProfileToAutorisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignProfileToAutorisation.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Autorisation }>) => {
        state.loading = false;
        if (action.payload.success) {
          // Optionnel : Met à jour l'autorisation spécifique localement (avant re-fetch)
          const index = state.data.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(assignProfileToAutorisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(activateAutorisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateAutorisation.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Autorisation }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(activateAutorisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deactivateAutorisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateAutorisation.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Autorisation }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(a => a.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(deactivateAutorisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAutorisation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAutorisation.fulfilled, (state, action: PayloadAction<{ success: boolean; data: string }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = state.data.filter(a => a.id !== action.payload.data);
        }
      })
      .addCase(deleteAutorisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = autorisationsSlice.actions;
export default autorisationsSlice.reducer;