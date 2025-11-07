import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { campaignsAPI } from '../services/api';

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campaignsAPI.getAll();
      return response.data.campaigns;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaigns');
    }
  }
);

export const fetchCampaignById = createAsyncThunk(
  'campaigns/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await campaignsAPI.getById(id);
      return response.data.campaign;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaign');
    }
  }
);

export const fetchUserCampaigns = createAsyncThunk(
  'campaigns/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await campaignsAPI.getByUser(userId);
      return response.data.campaigns;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user campaigns');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (campaignData, { rejectWithValue }) => {
    try {
      const response = await campaignsAPI.create(campaignData);
      return response.data.campaign;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create campaign');
    }
  }
);

export const uploadCampaignVideo = createAsyncThunk(
  'campaigns/uploadVideo',
  async ({ campaignId, videoFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      const response = await campaignsAPI.uploadVideo(campaignId, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data; // Should contain video URL and any other relevant data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload video');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await campaignsAPI.update(id, data);
      return response.data.campaign;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update campaign');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/delete',
  async (id, { rejectWithValue }) => {
    try {
      await campaignsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete campaign');
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: [],
    userCampaigns: [],
    selectedCampaign: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch campaign by ID
      .addCase(fetchCampaignById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user campaigns
      .addCase(fetchUserCampaigns.fulfilled, (state, action) => {
        state.userCampaigns = action.payload;
      })
      // Create campaign
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.unshift(action.payload);
        state.userCampaigns.unshift(action.payload);
      })
      // Update campaign
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        const userIndex = state.userCampaigns.findIndex(c => c.id === action.payload.id);
        if (userIndex !== -1) {
          state.userCampaigns[userIndex] = action.payload;
        }
      })
      // Delete campaign
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
        state.userCampaigns = state.userCampaigns.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError, clearSelectedCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
