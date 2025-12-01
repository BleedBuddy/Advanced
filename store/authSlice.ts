import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

interface AuthState {
  isProUserAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoginModalOpen: boolean;
  adminToken: string | null;
  adminAuthLoading: boolean;
  adminAuthError: string | null;
}

const initialState: AuthState = {
  isProUserAuthenticated: false,
  isAdminAuthenticated: false,
  isLoginModalOpen: false,
  adminToken: null,
  adminAuthLoading: false,
  adminAuthError: null,
};

// Async Thunk for Admin Login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiService.login(email, password);
      localStorage.setItem('adminToken', data.token);
      return data.token;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Pro User Auth (remains client-side for now)
    loginProUser: (state) => {
      state.isProUserAuthenticated = true;
      state.isLoginModalOpen = false;
    },
    logoutProUser: (state) => {
      state.isProUserAuthenticated = false;
    },
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
    // Admin Auth
    logoutAdmin: (state) => {
      localStorage.removeItem('adminToken');
      state.isAdminAuthenticated = false;
      state.adminToken = null;
    },
    checkInitialAuth: (state) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            state.adminToken = token;
            state.isAdminAuthenticated = true;
        }
    }
  },
  extraReducers: (builder) => {
    builder
        .addCase(loginAdmin.pending, (state) => {
            state.adminAuthLoading = true;
            state.adminAuthError = null;
        })
        .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<string>) => {
            state.adminAuthLoading = false;
            state.isAdminAuthenticated = true;
            state.adminToken = action.payload;
            state.adminAuthError = null;
        })
        .addCase(loginAdmin.rejected, (state, action) => {
            state.adminAuthLoading = false;
            state.isAdminAuthenticated = false;
            state.adminToken = null;
            state.adminAuthError = action.payload as string;
        });
  }
});

export const { 
    loginProUser, 
    logoutProUser, 
    openLoginModal, 
    closeLoginModal,
    logoutAdmin,
    checkInitialAuth
} = authSlice.actions;

export default authSlice.reducer;