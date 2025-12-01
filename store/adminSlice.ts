import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser, Transaction, RecentActivity } from '../types';
import { apiService } from '../services/api';

interface AdminState {
  users: AdminUser[];
  transactions: Transaction[];
  recentActivity: RecentActivity[];
  revenueData: {
    totalRevenue: number;
    mrr: number;
    newUsers: number;
    filesProcessed: number;
    chartData: { name: string, Revenue: number }[];
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  transactions: [],
  recentActivity: [],
  revenueData: {
    totalRevenue: 0,
    mrr: 0,
    newUsers: 0,
    filesProcessed: 0,
    chartData: [],
  },
  loading: 'idle',
  error: null,
};

// Async Thunks for fetching data
export const fetchDashboardData = createAsyncThunk(
    'admin/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            return await apiService.getDashboardData();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    // FIX: A required parameter cannot follow an optional parameter. Changed to use a default value.
    async (params: { email?: string; plan?: string } = {}, { rejectWithValue }) => {
        try {
            return await apiService.getUsers(params);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'admin/fetchTransactions',
    // FIX: A required parameter cannot follow an optional parameter. Changed to use a default value.
    async (params: { customerEmail?: string } = {}, { rejectWithValue }) => {
        try {
            return await apiService.getFinancials(params);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.revenueData = action.payload.revenueData;
        state.recentActivity = action.payload.recentActivity;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<AdminUser[]>) => {
        state.loading = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = 'succeeded';
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default adminSlice.reducer;