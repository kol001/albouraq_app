import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios';

export interface Fournisseur {
  id: string;
  code: string;
  libelle: string;
  dateApplication: string;
  status: 'CREER' | 'ACTIF' | 'INACTIF';
  dateActivation: string | null;
  dateDesactivation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FournisseursState {
  data: Fournisseur[];
  loading: boolean;
  error: string | null;
}

const initialState: FournisseursState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch tous les fournisseurs
export const fetchFournisseurs = createAsyncThunk<
  { success: boolean; data: Fournisseur[] },
  void
>('fournisseurs/fetchFournisseurs', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/fournisseurs');
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec récupération des fournisseurs');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Créer un fournisseur
export const createFournisseur = createAsyncThunk<
  { success: boolean; data: Fournisseur },
  { libelle: string }
>('fournisseurs/createFournisseur', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/fournisseurs', payload);
    if (response.data.success) {
      dispatch(fetchFournisseurs());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec création');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Update (PUT)
export const updateFournisseur = createAsyncThunk<
  { success: boolean; data: Fournisseur },
  { id: string; libelle: string }
>('fournisseurs/updateFournisseur', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/fournisseurs/${id}`, data);
    if (response.data.success) {
      dispatch(fetchFournisseurs());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec mise à jour');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Activate
export const activateFournisseur = createAsyncThunk<
  { success: boolean; data: Fournisseur },
  string
>('fournisseurs/activateFournisseur', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/fournisseurs/${id}/activate`);
    if (response.data.success) {
      dispatch(fetchFournisseurs());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec activation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Deactivate
export const deactivateFournisseur = createAsyncThunk<
  { success: boolean; data: Fournisseur },
  string
>('fournisseurs/deactivateFournisseur', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/fournisseurs/${id}/deactivate`);
    if (response.data.success) {
      dispatch(fetchFournisseurs());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec désactivation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Delete
export const deleteFournisseur = createAsyncThunk<
  { success: boolean; data: string },
  string
>('fournisseurs/deleteFournisseur', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/fournisseurs/${id}`);
    if (response.data.success) {
      dispatch(fetchFournisseurs());
      return { success: true, data: id };
    }
    return rejectWithValue('Échec suppression');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

const fournisseursSlice = createSlice({
  name: 'fournisseurs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFournisseurs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFournisseurs.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) state.data = action.payload.data;
      })
      .addCase(fetchFournisseurs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default fournisseursSlice.reducer;