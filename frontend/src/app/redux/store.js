import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './slices/movieSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    movie: movieReducer,
    user: userReducer,
  },
});