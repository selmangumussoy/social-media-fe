import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  theme: "light",
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
    },
    updateProfile: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
  },
})

export const { setUser, logout, toggleTheme, updateProfile } = userSlice.actions
export default userSlice.reducer
