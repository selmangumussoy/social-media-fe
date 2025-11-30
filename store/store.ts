import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import chatReducer from "./slices/chatSlice";
import notificationReducer from "./slices/notificationSlice";
import followReducer from "./slices/followSlice";

const rootReducer = combineReducers({
  user: userReducer,
  posts: postReducer,
  chat: chatReducer,
  notifications: notificationReducer,
  follow: followReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "follow"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
