import { createSlice } from "@reduxjs/toolkit"
import { dummyNotifications } from "@/data/dummyNotificationData"

const initialState = {
  notifications: dummyNotifications,
  unreadCount: dummyNotifications.filter((n) => !n.read).length,
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount -= 1
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true))
      state.unreadCount = 0
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
  },
})

export const { markAsRead, markAllAsRead, addNotification } = notificationSlice.actions
export default notificationSlice.reducer
