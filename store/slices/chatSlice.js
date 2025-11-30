import { createSlice } from "@reduxjs/toolkit"

// initialState için tip tanımı gerekmez
const initialState = {
  chats: [],         // backend’den gelecek
  activeChat: null,  // seçili chatId
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  // Reducer'larda artık 'action: PayloadAction<...>' gibi tiplendirmeler yok
  reducers: {
    // 🟢 Aktif chat seç
    setActiveChat: (state, action) => {
      state.activeChat = action.payload
    },

    // 🟢 Chat listesini backend'den doldur
    setChats: (state, action) => {
      state.chats = action.payload
    },

    // 🟢 Belirli chat için mesaj listesini setle
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload
      const chat = state.chats.find((c) => c.id === chatId)
      if (chat) {
        chat.messages = messages
        chat.unread = 0
      }
    },

    // 🟢 Tek mesaj ekle (WebSocket için)
    addMessage: (state, action) => {
      const { chatId, message } = action.payload
      const chat = state.chats.find((c) => c.id === chatId)
      if (chat) {
        // mesaj ekle
        chat.messages.push(message)

        // chat listesinde lastMessage güncelle
        chat.lastMessage = message.text
        chat.timestamp = message.timestamp

        // chat aktif değilse unread artır
        if (state.activeChat !== chatId) {
          chat.unread = (chat.unread || 0) + 1
        }
      }
    },

    // 🟢 Optimistic UI için sendMessage
    sendMessage: (state, action) => {
      const { chatId, message } = action.payload
      const chat = state.chats.find((c) => c.id === chatId)
      if (chat) {
        // Optimistic mesajı ekle
        chat.messages.push(message)
        chat.lastMessage = message.text
        chat.timestamp = message.timestamp // Message'dan gelen zaman damgasını kullan
      }
    },

    // 🟢 Chat içerisindeki unread değerini sıfırla
    markAsRead: (state, action) => {
      const chat = state.chats.find((c) => c.id === action.payload)
      if (chat) {
        chat.unread = 0
      }
    },

    // 🔵 Chat lastMessage güncelle (socket backend eventleri için)
    updateLastMessage: (state, action) => {
      const { chatId, lastMessage, timestamp } = action.payload
      const chat = state.chats.find((c) => c.id === chatId)
      if (chat) {
        chat.lastMessage = lastMessage
        chat.timestamp = timestamp
      }
    },
  },
})

export const {
  setActiveChat,
  sendMessage,
  markAsRead,
  setChats,
  setMessages,
  addMessage,
  updateLastMessage,
} = chatSlice.actions

export default chatSlice.reducer