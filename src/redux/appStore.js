// redux/appStore.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; // Example: userSlice.js

const appStore = configureStore({
  reducer: {
    user: userReducer, // Reducer for user state
  },
});

export default appStore;
