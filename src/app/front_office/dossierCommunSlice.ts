import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../service/Axios'; // ← Ton instance avec interceptors et token

// Types pour la réponse API (liste)
export interface DossierCommun {
  id: string;
  numero: number;
  description: string;
  contactPrincipal: string;
  whatsapp: string;
  status: string;
  createdAt: string;
  clientfacture: {
    code: string;
    libelle: string;
  };
  dossierCommunColab: Array<{
    module: {
      nom: string;
    };
  }>;
  dossierCommunClient: Array<{
    clientbeneficiaireInfo: {
      nom: string;
      prenom: string;
    };
  }>;
}

// Payload pour la création
interface CreateDossierCommunPayload {
  referenceTravelPlaner: string;
  description: string;
  contactPrincipal: string;
  whatsapp?: string;
  clientFactureId: string;
  colabs: Array<{
    userId: string;
    moduleId: string;
  }>;
  clients: Array<{
    clientbeneficiaireInfoId: string;
    code: number;
  }>;
}

// State global
interface DossierCommunState {
  data: DossierCommun[];
  loading: boolean;        // pour fetch list
  error: string | null;

  creating: boolean;       // pour création
  createSuccess: boolean;
  createError: string | null;
}

const initialState: DossierCommunState = {
  data: [],
  loading: false,
  error: null,

  creating: false,
  createSuccess: false,
  createError: null,
};

// Thunk : Récupérer la liste
export const fetchDossiersCommuns = createAsyncThunk(
  'dossierCommun/fetchDossiersCommuns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/dossier-commun');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Échec chargement');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
    }
  }
);

// Thunk : Créer un nouveau dossier commun
export const createDossierCommun = createAsyncThunk(
  'dossierCommun/create',
  async (payload: CreateDossierCommunPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/dossier-commun', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        return response.data.data; // Le nouveau dossier créé
      }
      return rejectWithValue(response.data.message || 'Échec création');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur réseau lors de la création');
    }
  }
);

const dossierCommunSlice = createSlice({
  name: 'dossierCommun',
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.creating = false;
      state.createSuccess = false;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // === Fetch liste ===
    builder
      .addCase(fetchDossiersCommuns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDossiersCommuns.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDossiersCommuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // === Création ===
    builder
      .addCase(createDossierCommun.pending, (state) => {
        state.creating = true;
        state.createSuccess = false;
        state.createError = null;
      })
      .addCase(createDossierCommun.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        // Optionnel : ajouter à la liste locale
        state.data.unshift(action.payload);
      })
      .addCase(createDossierCommun.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      });
  },
});

export const { resetCreateStatus } = dossierCommunSlice.actions;
export default dossierCommunSlice.reducer;