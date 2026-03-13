import { createSlice } from '@reduxjs/toolkit';

// Tentamos recuperar se o admin já estava logado
const initialState = {
  isAuthenticated: !!localStorage.getItem('adminToken'),
  token: localStorage.getItem('adminToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload; // a própria matrícula logada
      localStorage.setItem('adminToken', action.payload);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('adminToken');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
