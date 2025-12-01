import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PreflightResult, WorkflowStep } from '../types';
import { analyzePdf } from '../services/pdfProcessor';
import { generateBleed } from '../services/geminiService';

interface AppState {
  workflowStep: WorkflowStep;
  currentFile: File | null;
  preflightResult: PreflightResult | null;
  correctedFileUrl: string | null;
  error: string | null;
  loading: boolean;
}

const initialState: AppState = {
  workflowStep: 'upload',
  currentFile: null,
  preflightResult: null,
  correctedFileUrl: null,
  error: null,
  loading: false,
};

const getErrorMessage = (err: unknown, context: 'analysis' | 'processing'): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) {
        if (err.name === 'NoModificationAllowedError') {
            return `This PDF is protected and cannot be ${context === 'analysis' ? 'analyzed' : 'modified'}. Please upload a different file.`;
        }
        return `Failed to ${context === 'analysis' ? 'analyze' : 'process'} the PDF: ${err.message}. It may be corrupted or in an unsupported format.`;
    }
    return `An unexpected error occurred during ${context}. Please try again.`;
};


export const startPdfAnalysis = createAsyncThunk(
  'app/startPdfAnalysis',
  async (file: File, { rejectWithValue }) => {
    try {
      const result = await analyzePdf(file);
      return { result, file };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'analysis'));
    }
  }
);

export const startBleedGeneration = createAsyncThunk(
  'app/startBleedGeneration',
  async (file: File, { rejectWithValue }) => {
    try {
        const url = await generateBleed(file);
        return url;
    } catch (err) {
        return rejectWithValue(getErrorMessage(err, 'processing'));
    }
  }
);


const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    resetApp: (state) => {
        if (state.preflightResult?.previewUrl) {
            URL.revokeObjectURL(state.preflightResult.previewUrl);
        }
        if (state.correctedFileUrl) {
            URL.revokeObjectURL(state.correctedFileUrl);
        }
        return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analysis Thunk
      .addCase(startPdfAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.workflowStep = 'upload'; // Show spinner on upload screen
      })
      .addCase(startPdfAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.preflightResult = action.payload.result;
        state.currentFile = action.payload.file;
        state.workflowStep = 'preflight';
      })
      .addCase(startPdfAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.workflowStep = 'error';
      })
      // Bleed Generation Thunk
      .addCase(startBleedGeneration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.workflowStep = 'processing';
      })
      .addCase(startBleedGeneration.fulfilled, (state, action) => {
        state.loading = false;
        state.correctedFileUrl = action.payload;
        state.workflowStep = 'complete';
      })
      .addCase(startBleedGeneration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.workflowStep = 'error';
      });
  },
});

export const { resetApp } = appSlice.actions;
export default appSlice.reducer;