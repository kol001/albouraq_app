import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios';

export interface ModuleRef {
  id: string;
  code: string;
  nom: string;
  description: string;
  status: string;
}

export interface Mile {
  id: string;
  moduleId: string;
  dateApplication: string;
  status: string;
  borneCaInf: number;
  borneCaSup: number;
  miles: number;
  createdAt: string;
  updatedAt: string;
  module: ModuleRef;
}

export interface MilesState {
  data: Mile[];
  loading: boolean;
  error: string | null;
}

const initialState: MilesState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch tous les miles
export const fetchMiles = createAsyncThunk<
  { success: boolean; data: Mile[] },
  void,
  { state: { auth: { token: string } } }
>('miles/fetchMiles', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.get('/miles', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec récupération');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Créer un mile
export const createMile = createAsyncThunk<
  { success: boolean; data: Mile },
  { moduleId: string; borneCaInf: number; borneCaSup: number; miles: number },
  { state: { auth: { token: string } } }
>('miles/createMile', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.post('/miles', payload, {
      headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
    });
    if (response.data.success) {
      dispatch(fetchMiles());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec création');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Update un mile (PUT)
export const updateMile = createAsyncThunk<
  { success: boolean; data: Mile },
  { id: string; moduleId: string; borneCaInf: number; borneCaSup: number; miles: number },
  { state: { auth: { token: string } } }
>('miles/updateMile', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.put(`/miles/${payload.id}`, {
      moduleId: payload.moduleId,
      borneCaInf: payload.borneCaInf,
      borneCaSup: payload.borneCaSup,
      miles: payload.miles,
    }, {
      headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
    });
    if (response.data.success) {
      dispatch(fetchMiles());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec modification');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Delete un mile
export const deleteMile = createAsyncThunk<
  { success: boolean; data: string },
  { id: string },
  { state: { auth: { token: string } } }
>('miles/deleteMile', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.delete(`/miles/${payload.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchMiles());
      return { success: true, data: payload.id };
    }
    return rejectWithValue('Échec suppression');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Activate
export const activateMile = createAsyncThunk<
  { success: boolean; data: Mile },
  { id: string },
  { state: { auth: { token: string } } }
>('miles/activateMile', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.patch(`/miles/${payload.id}/activate`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchMiles());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec activation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Deactivate
export const deactivateMile = createAsyncThunk<
  { success: boolean; data: Mile },
  { id: string },
  { state: { auth: { token: string } } }
>('miles/deactivateMile', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.patch(`/miles/${payload.id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchMiles());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec désactivation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

const milesSlice = createSlice({
  name: 'miles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchMiles.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchMiles.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.success) state.data = action.payload.data;
        })
        .addCase(fetchMiles.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(createMile.pending, (state) => { state.loading = true; })
        .addCase(createMile.fulfilled, (state) => { state.loading = false; })
        .addCase(createMile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(updateMile.pending, (state) => { state.loading = true; })
        .addCase(updateMile.fulfilled, (state) => { state.loading = false; })
        .addCase(updateMile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(deleteMile.pending, (state) => { state.loading = true; })
        .addCase(deleteMile.fulfilled, (state, action) => {
            state.loading = false;
            state.data = state.data.filter(m => m.id !== action.payload.data);
        })
        .addCase(deleteMile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(activateMile.pending, (state) => { state.loading = true; })
        .addCase(activateMile.fulfilled, (state) => { state.loading = false; })
        .addCase(activateMile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(deactivateMile.pending, (state) => { state.loading = true; })
        .addCase(deactivateMile.fulfilled, (state) => { state.loading = false; })
        .addCase(deactivateMile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
  },
});

export default milesSlice.reducer;