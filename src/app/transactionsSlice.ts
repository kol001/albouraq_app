import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../service/Axios';

export interface TransactionType {
  id: string;
  transactionType: string;
  event: string;
  executionMode: string;
  status: string;
  dateActivation: string;
  dateDesactivation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  code: string;
  nom: string;
  description: string;
  status: string;
  dateActivation: string | null;
  dateDesactivation: string;
}

export interface Transaction {
  id: string;
  moduleId: string;
  transactionId: string;
  dateApplication: string;
  status: string;
  dateActivation: string;
  dateDesactivation: string | null;
  createdAt: string;
  updatedAt: string;
  module: Module;
  transactiontype: TransactionType;
}

export interface TransactionsState {
  data: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch toutes les transactions
export const fetchTransactions = createAsyncThunk<
  { success: boolean; data: Transaction[] },
  void,
  { state: { auth: { token: string } } }
>('transactions/fetchTransactions', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.get('/transactions', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec récupération des transactions');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Créer une transaction
export const createTransaction = createAsyncThunk<
  { success: boolean; data: Transaction },
  { moduleId: string; transactionId: string; dateApplication: string; status?: string },
  { state: { auth: { token: string } } }
>('transactions/createTransaction', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.post('/transactions', payload, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.data.success) {
      dispatch(fetchTransactions()); // Re-fetch pour cohérence
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec création de la transaction');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Update (modification)
export const updateTransaction = createAsyncThunk<
  { success: boolean; data: Transaction },
  { id: string; moduleId: string; transactionId: string; dateApplication: string; status?: string },
  { state: { auth: { token: string } } }
>('transactions/updateTransaction', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.put(`/transactions/${payload.id}`, {
      moduleId: payload.moduleId,
      transactionId: payload.transactionId,
      dateApplication: payload.dateApplication,
      status: payload.status,
    }, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.data.success) {
      dispatch(fetchTransactions());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec mise à jour');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Activate
export const activateTransaction = createAsyncThunk<
  { success: boolean; data: Transaction },
  { id: string },
  { state: { auth: { token: string } } }
>('transactions/activateTransaction', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.patch(`/transactions/${payload.id}/activate`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchTransactions());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec activation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Deactivate
export const deactivateTransaction = createAsyncThunk<
  { success: boolean; data: Transaction },
  { id: string },
  { state: { auth: { token: string } } }
>('transactions/deactivateTransaction', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.patch(`/transactions/${payload.id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchTransactions());
      return { success: true, data: response.data.data };
    }
    return rejectWithValue('Échec désactivation');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

// Delete
export const deleteTransaction = createAsyncThunk<
  { success: boolean; data: string },
  { id: string },
  { state: { auth: { token: string } } }
>('transactions/deleteTransaction', async (payload, { getState, rejectWithValue, dispatch }) => {
  try {
    const { auth } = getState();
    if (!auth.token) return rejectWithValue('Token manquant');
    const response = await axiosInstance.delete(`/transactions/${payload.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (response.data.success) {
      dispatch(fetchTransactions());
      return { success: true, data: payload.id };
    }
    return rejectWithValue('Échec suppression');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Erreur réseau');
  }
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateTransaction.pending, (state) => { state.loading = true; })
      .addCase(updateTransaction.fulfilled, (state) => { state.loading = false; })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate / Deactivate / Delete
      .addCase(activateTransaction.pending, (state) => { state.loading = true; })
      .addCase(activateTransaction.fulfilled, (state) => { state.loading = false; })
      .addCase(activateTransaction.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deactivateTransaction.pending, (state) => { state.loading = true; })
      .addCase(deactivateTransaction.fulfilled, (state) => { state.loading = false; })
      .addCase(deactivateTransaction.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteTransaction.pending, (state) => { state.loading = true; })
      .addCase(deleteTransaction.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteTransaction.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default transactionsSlice.reducer;