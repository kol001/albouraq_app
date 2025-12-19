import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction} from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios'; // Assure-toi que baseURL est '/api'

// Types basés sur la réponse API
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

export interface Privilege {
  id: string;
  privilege: string;
  fonctionnalite: string;
}

export interface Autorisation {
  id: string;
  nom: string;
  profileId: string;
  moduleId: string | null;
  privilegeId: string;
  privilege: Privilege;
}

export interface Profile {
  id: string;
  profil: string;
  dateCreation: string;
  dateActivation: string | null;
  dateDesactivation: string | null;
  status: string;
  autorisations: Autorisation[];
  users: User[];
}

export interface ProfilesState {
  data: Profile[];
  loading: boolean;
  error: string | null;
}

// Async thunk pour fetch les profils
export const fetchProfiles = createAsyncThunk<
  { success: boolean; data: Profile[] }, // Return type
  void, // Args (aucun)
  { state: { auth: { token: string } } } // Extra pour token
>(
  'profiles/fetchProfiles',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.get('/profiles', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return rejectWithValue('Échec de la récupération des profils');
      }
    } catch (error: any) {
      console.error('Erreur fetch profils:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Nouveau thunk pour créer un profil
export const createProfile = createAsyncThunk<
  { success: boolean; data: Profile }, // Return type
  { profil: string; status: string }, // Args (body du POST)
  { state: { auth: { token: string } } } // Extra pour token
>(
  'profiles/createProfile',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.post('/profiles', {
        ...payload,
        autorisationIds: [],
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      // La réponse est nested : response.data.data.success et response.data.data.data
      if (response.data.success ) {
        return { success: true, data: response.data.data };
      } else {
        return rejectWithValue('Échec de la création du profil');
      }
    } catch (error: any) {
      console.error('Erreur create profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour modifier un profil (seulement le nom)
export const updateProfile = createAsyncThunk<
  { success: boolean; data: Profile },
  { id: string; profil: string },
  { state: { auth: { token: string } } }
>(
  'profiles/updateProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }
      const response = await axiosInstance.patch(`/profiles/${payload.id}`, {
        profil: payload.profil,
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        dispatch(fetchProfiles()); // Re-fetch pour cohérence
        return { success: true, data: response.data.data };
      } else {
        return rejectWithValue('Échec de la modification');
      }
    } catch (error: any) {
      console.error('Erreur update profile:', error);
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour activer un profil
export const activateProfile = createAsyncThunk<
  { success: boolean; data: Profile },
  { profileId: string },
  { state: { auth: { token: string } } }
>(
  'profiles/activateProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/profiles/${payload.profileId}/activate`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedProfile: Profile;
      if (response.data.data ) {
        updatedProfile = response.data.data;
      } else if (response.data.success) {
        updatedProfile = response.data.data;
      } else {
        return rejectWithValue('Échec de l\'activation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchProfiles());

      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error('Erreur activate profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour désactiver un profil
export const deactivateProfile = createAsyncThunk<
  { success: boolean; data: Profile },
  { profileId: string },
  { state: { auth: { token: string } } }
>(
  'profiles/deactivateProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/profiles/${payload.profileId}/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedProfile: Profile;
      if (response.data.data) {
        updatedProfile = response.data.data;
      } else if (response.data.success) {
        updatedProfile = response.data.data;
      } else {
        return rejectWithValue('Échec de la désactivation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchProfiles());

      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error('Erreur deactivate profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour supprimer un profil
export const deleteProfile = createAsyncThunk<
  { success: boolean; data: string }, // Return ID supprimé
  { profileId: string },
  { state: { auth: { token: string } } }
>(
  'profiles/deleteProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.delete(`/profiles/${payload.profileId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        // Re-fetch pour cohérence (supprime de la liste)
        dispatch(fetchProfiles());
        return { success: true, data: payload.profileId };
      } else {
        return rejectWithValue('Échec de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur delete profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour ajouter une autorisation à un profil
export const addAutorisationToProfile = createAsyncThunk<
  { success: boolean; data: Profile },
  { profileId: string; autorisationId: string },
  { state: { auth: { token: string } } }
>(
  'profiles/addAutorisationToProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/profiles/${payload.profileId}/add-autorisation/${payload.autorisationId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedProfile: Profile;
      if (response.data.data ) {
        updatedProfile = response.data.data;
      } else if (response.data.success) {
        updatedProfile = response.data.data;
      } else {
        return rejectWithValue('Échec de l\'ajout d\'autorisation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchProfiles());

      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error('Erreur add autorisation to profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

// Async thunk pour enlever une autorisation d'un profil
export const removeAutorisationFromProfile = createAsyncThunk<
  { success: boolean; data: Profile },
  { autorisationId: string }, // Pas de profileId spécifique, comme API
  { state: { auth: { token: string } } }
>(
  'profiles/removeAutorisationFromProfile',
  async (payload, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Token manquant');
      }

      const response = await axiosInstance.patch(`/profiles/remove-autorisation/${payload.autorisationId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      let updatedProfile: Profile;
      if (response.data.data ) {
        updatedProfile = response.data.data;
      } else if (response.data.success) {
        updatedProfile = response.data.data;
      } else {
        return rejectWithValue('Échec de la suppression d\'autorisation');
      }

      // Re-fetch pour cohérence
      dispatch(fetchProfiles());

      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error('Erreur remove autorisation from profile:', error);
      return rejectWithValue(error.response?.message || 'Erreur réseau');
    }
  }
);

const initialState: ProfilesState = {
  data: [],
  loading: false,
  error: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile[] }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          // Ajoute le nouveau profil à la liste (optimistic update)
          state.data.push(action.payload.data);
        }
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(activateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(p => p.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(activateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deactivateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(p => p.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(deactivateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: string }>) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = state.data.filter(p => p.id !== action.payload.data);
        }
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addAutorisationToProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAutorisationToProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(p => p.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(addAutorisationToProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeAutorisationFromProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAutorisationFromProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(p => p.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(removeAutorisationFromProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<{ success: boolean; data: Profile }>) => {
        state.loading = false;
        if (action.payload.success) {
          const index = state.data.findIndex(p => p.id === action.payload.data.id);
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = profilesSlice.actions;
export default profilesSlice.reducer;