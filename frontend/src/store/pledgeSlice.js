import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pledgesAPI } from '../services/api';

// Async thunks
export const createPledge = createAsyncThunk(
  'pledges/create',
  async (pledgeData, { rejectWithValue }) => {
    try {
      const response = await pledgesAPI.create(pledgeData);
      return response.data.pledge;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create pledge');
    }
  }
);

export const fetchUserPledges = createAsyncThunk(
  'pledges/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await pledgesAPI.getByUser(userId);
      return response.data.pledges;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pledges');
    }
  }
);

export const fetchUserPledgeStats = createAsyncThunk(
  'pledges/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await pledgesAPI.getUserStats(userId);
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
);

const pledgeSlice = createSlice({
  name: 'pledges',
  initialState: {
    pledges: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create pledge
      .addCase(createPledge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPledge.fulfilled, (state, action) => {
        state.loading = false;
        state.pledges.unshift(action.payload);
      })
      .addCase(createPledge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user pledges
      .addCase(fetchUserPledges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPledges.fulfilled, (state, action) => {
        state.loading = false;
        state.pledges = action.payload || [];
        console.log('Pledges loaded:', action.payload);
      })
      .addCase(fetchUserPledges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pledges = [];
      })
      // Fetch stats
      .addCase(fetchUserPledgeStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPledgeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload || {};
      })
      .addCase(fetchUserPledgeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = pledgeSlice.actions;
export default pledgeSlice.reducer;
