import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import campaignReducer from './campaignSlice';
import pledgeReducer from './pledgeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
    pledges: pledgeReducer,
  },
});

export default store;
