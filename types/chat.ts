export interface ChatMessage {
  id: string | number
  senderId: string
  text: string
  timestamp: string
}

export interface ChatItem {
  id: string
  name: string
  username: string // <-- ? kaldırılmalı (Zorunlu)
  avatar?: string
  isOnline?: boolean
  lastMessage?: string
  timestamp?: string
  unread?: number
  otherUserId: string
  messages: ChatMessage[]
}
