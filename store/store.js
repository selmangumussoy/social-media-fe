import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import postReducer from "./slices/postSlice"
import chatReducer from "./slices/chatSlice"
import notificationReducer from "./slices/notificationSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
})
