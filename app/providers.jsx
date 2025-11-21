"use client"

import { Provider } from "react-redux"
import { store, persistor } from "@/store/store"
import { PersistGate } from "redux-persist/integration/react"
import { Toaster } from "react-hot-toast"

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgb(var(--color-card))",
            color: "rgb(var(--color-card-foreground))",
            border: "1px solid rgb(var(--color-border))",
          },
        }}
      />
    </Provider>
  )
}
