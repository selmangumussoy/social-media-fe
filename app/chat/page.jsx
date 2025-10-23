"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setActiveChat, sendMessage, markAsRead } from "@/store/slices/chatSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MoreVertical, Smile } from "lucide-react"
import { formatTime } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/common/empty-state"

export default function ChatPage() {
  const dispatch = useDispatch()
  const chats = useSelector((state) => state.chat.chats)
  const activeChat = useSelector((state) => state.chat.activeChat)
  const currentUser = useSelector((state) => state.user.currentUser)

  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)

  const activeChatData = chats.find((chat) => chat.id === activeChat)

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeChatData?.messages])

  const handleSelectChat = (chatId) => {
    dispatch(setActiveChat(chatId))
    dispatch(markAsRead(chatId))
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageText.trim() && activeChat) {
      const newMessage = {
        id: Date.now(),
        senderId: currentUser?.id,
        text: messageText,
        timestamp: new Date().toISOString(),
      }
      dispatch(sendMessage({ chatId: activeChat, message: newMessage }))
      setMessageText("")
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30">
      {/* Chat List - Left Panel */}
      <div className="flex w-full flex-col border-r border-border/50 bg-card lg:w-80">
        {/* Search */}
        <div className="border-b border-border/50 bg-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Mesajlarda ara..."
              className="rounded-xl pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border/30 p-4 text-left transition-all hover:bg-muted/50",
                activeChat === chat.id && "bg-gradient-to-r from-primary/5 to-secondary/5",
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-border/30">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500 shadow-sm" />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground">{formatTime(chat.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs shadow-sm">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages - Right Panel */}
      <div className="hidden flex-1 flex-col lg:flex">
        {activeChatData ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-border/30">
                    <AvatarImage src={activeChatData.avatar || "/placeholder.svg"} alt={activeChatData.name} />
                    <AvatarFallback>{activeChatData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {activeChatData.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500 shadow-sm" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{activeChatData.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeChatData.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-muted/10 p-4">
              <div className="space-y-4">
                {activeChatData.messages.map((message) => {
                  const isSent = message.senderId === currentUser?.id

                  return (
                    <div key={message.id} className={cn("flex", isSent ? "justify-end" : "justify-start")}>
                      <div className={cn("flex max-w-[70%] gap-2", isSent && "flex-row-reverse")}>
                        {!isSent && (
                          <Avatar className="h-8 w-8 ring-2 ring-border/30">
                            <AvatarImage src={activeChatData.avatar || "/placeholder.svg"} alt={activeChatData.name} />
                            <AvatarFallback>{activeChatData.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 shadow-sm",
                              isSent
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-foreground border border-border/30",
                            )}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                          </div>
                          <p className={cn("mt-1 text-xs text-muted-foreground", isSent && "text-right")}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border/50 bg-card p-4 shadow-sm">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button type="button" size="icon" variant="ghost" className="rounded-full">
                  <Smile className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Mesajınızı yazın..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 rounded-full"
                />
                <Button type="submit" size="icon" className="rounded-full shadow-sm" disabled={!messageText.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-muted/20 to-muted/10">
            <EmptyState title="Mesaj seçin" description="Sohbete başlamak için sol taraftan bir konuşma seçin" />
          </div>
        )}
      </div>

      {/* Mobile View - Show active chat or list */}
      {activeChatData && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-background lg:hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Button variant="ghost" size="sm" onClick={() => dispatch(setActiveChat(null))}>
              ← Geri
            </Button>
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeChatData.avatar || "/placeholder.svg"} alt={activeChatData.name} />
                <AvatarFallback>{activeChatData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {activeChatData.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{activeChatData.name}</h2>
              <p className="text-xs text-muted-foreground">{activeChatData.isOnline ? "Çevrimiçi" : "Çevrimdışı"}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {activeChatData.messages.map((message) => {
                const isSent = message.senderId === currentUser?.id

                return (
                  <div key={message.id} className={cn("flex", isSent ? "justify-end" : "justify-start")}>
                    <div className={cn("flex max-w-[80%] gap-2", isSent && "flex-row-reverse")}>
                      {!isSent && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activeChatData.avatar || "/placeholder.svg"} alt={activeChatData.name} />
                          <AvatarFallback>{activeChatData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2",
                            isSent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground dark:text-foreground",
                          )}
                        >
                          <p className="leading-relaxed">{message.text}</p>
                        </div>
                        <p className={cn("mt-1 text-xs text-muted-foreground", isSent && "text-right")}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-4 pb-20">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Mesajınızı yazın..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!messageText.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
