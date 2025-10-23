import { createSlice } from "@reduxjs/toolkit"
import { dummyChats } from "@/data/dummyChatData"

const initialState = {
  chats: dummyChats,
  activeChat: null,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload
    },
    sendMessage: (state, action) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.messages.push(action.payload.message)
        chat.lastMessage = action.payload.message.text
        chat.timestamp = new Date().toISOString()
      }
    },
    markAsRead: (state, action) => {
      const chat = state.chats.find((c) => c.id === action.payload)
      if (chat) {
        chat.unread = 0
      }
    },
  },
})

export const { setActiveChat, sendMessage, markAsRead } = chatSlice.actions
export default chatSlice.reducer
