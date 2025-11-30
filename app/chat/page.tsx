"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  setActiveChat,
  sendMessage,
  markAsRead,
  setChats,
  setMessages,
  addMessage,
} from "@/store/slices/chatSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, Send, Smile } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/formatDate";

import { getAllUser } from "@/services/userService";
import { getMyChats, createChat } from "@/services/chatService";
import {
  getChatMessages,
  createMessage,
  markMessagesAsSeen,
} from "@/services/messageService";

import {
  connectWebSocket,
  sendWsMessage,
  disconnectWebSocket,
} from "@/services/wsService";

export default function ChatPage() {
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.chat.chats);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const currentUser = useSelector((state) => state.user.currentUser);

  const [users, setUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  // Arama, şu anda sadece kullanıcıları listelediği için tutuluyor,
  // ancak artık sohbetleri listeliyoruz. Eğer sohbetleri filtrelemek isterseniz,
  // arama mantığını (filteredChats) uygulamanız gerekir.
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  const activeChatData = chats.find((c) => c.id === activeChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatData?.messages]);

  // ---------------------------------------------------
  // TÜM KULLANICILARI YÜKLE (Yeni sohbet başlatmak için gerekli)
  // ---------------------------------------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    (async () => {
      const res = await getAllUser();
      const items = res?.data?.items || [];

      const filtered = items.filter((u) => u.id !== currentUser.id);

      console.log("User listesi:", filtered);

      // Bu liste, 'Kullanıcılar' listesini render etmek yerine,
      // mevcut sohbeti olmayan bir kullanıcıyla sohbet başlatmak için kullanılır.
      setUsers(filtered);
    })();
  }, [currentUser?.id]);

  // ---------------------------------------------------
// CHATLERİ GETİR (Sol panelde gösterilecek)
// ---------------------------------------------------
// ChatPage.js dosyası, CHATLERİ GETİR useEffect bloğu
  useEffect(() => {
    if (!currentUser?.id) return;

    (async () => {
      const res = await getMyChats(currentUser.id);

      // 🚨 DÜZELTİLMİŞ YOL: Veri res.data.items.content içindedir.
      const backendChats = res?.data?.items?.content || [];

      console.log("1. Ham API Yanıtı (res):", res);
      console.log("2. İşlenmiş Sohbet Dizisi (backendChats):", backendChats);

      const mapped = (backendChats || []).map((c) => ({
        id: c.id,
        name: c.otherUserName || "Kullanıcı",
        username: c.otherUserUsername || "",
        avatar: c.otherUserAvatar || null,
        isOnline: c.isOnline ?? false,
        lastMessage: c.lastMessage || "",
        timestamp: c.modified || c.created,
        unread: c.unreadCount || 0,
        otherUserId: c.otherUserId || c.user2Id || c.user1Id,
        messages: [],
      }));

      console.log("3. Redux'a Gönderilecek Mapped Data:", mapped);

      dispatch(setChats(mapped));
    })();
  }, [currentUser?.id]);  // ---------------------------------------------------
  // WEBSOCKET
  // ---------------------------------------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    connectWebSocket(currentUser.id, (msg) => {
      const chat = chats.find(
          (c) =>
              c.otherUserId === msg.senderId ||
              c.otherUserId === msg.receiverId
      );

      if (!chat) return;

      dispatch(
          addMessage({
            chatId: chat.id,
            message: {
              id: msg.id,
              senderId: msg.senderId,
              text: msg.content,
              timestamp: msg.created,
            },
          })
      );
    });

    return disconnectWebSocket;
  }, [currentUser?.id]);

  // ---------------------------------------------------
  // USER'A TIKLANINCA CHAT AÇ
  // Bu fonksiyon artık doğrudan 'Kullanıcılar' listesinden çağrılmaz,
  // ancak başka bir yerden (örneğin bir 'Kullanıcı Ara' sayfası) çağrılabilir.
  // Şu anki ChatPage, ağırlıklı olarak mevcut sohbetleri listeler.
  // ---------------------------------------------------
  const handleSelectUser = async (user) => {
    let chat = chats.find((c) => c.otherUserId === user.id);

    if (!chat) {
      const created = await createChat({
        user1Id: currentUser.id,
        user2Id: user.id,
      });

      chat = {
        id: created.id,
        name: user.fullName || "Kullanıcı",
        username: user.userName,
        avatar: null,
        isOnline: false,
        lastMessage: "",
        timestamp: created.modified || created.created,
        unread: 0,
        otherUserId: user.id,
        messages: [],
      };

      dispatch(setChats([chat, ...chats])); // Yeni sohbeti listenin başına ekle
    }

    await handleSelectChat(chat.id);
  };

  // ---------------------------------------------------
  // CHAT SEÇİLİNCE MESAJLARI GETİR
  // ---------------------------------------------------
  const handleSelectChat = async (chatId) => {
    dispatch(setActiveChat(chatId));

    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    // Mesajları getirmeden önce okundu olarak işaretle (API'ye istek)
    await markMessagesAsSeen(currentUser.id, chat.otherUserId);

    const msgs = await getChatMessages(currentUser.id, chat.otherUserId);

    const mapped = (msgs || []).map((m) => ({
      id: m.id,
      senderId: m.senderId,
      text: m.content,
      timestamp: m.created,
    }));

    dispatch(setMessages({ chatId, messages: mapped }));

  };

  // ---------------------------------------------------
  // MESAJ GÖNDER
  // ---------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    const chat = chats.find((c) => c.id === activeChat);
    const receiverId = chat.otherUserId;

    // UI'da hemen göster (optimistic update)
    dispatch(
        sendMessage({
          chatId: activeChat,
          message: {
            id: Date.now(),
            senderId: currentUser.id,
            text: messageText,
            timestamp: new Date().toISOString(),
          },
        })
    );

    // WebSocket ile mesajı gönder
    sendWsMessage({
      senderId: currentUser.id,
      receiverId,
      content: messageText,
    });

    // API'ye kaydetme (opsiyonel olarak ekleyebilirsiniz)
    // await createMessage({ senderId: currentUser.id, receiverId, content: messageText });

    setMessageText("");
  };

  // Arama sorgusu sadece 'Kullanıcılar' listesi için geçerliydi.
  // Eğer sohbetleri filtrelemek isterseniz 'filteredChats' state'ini kullanın.
  const filteredUsers = users.filter((u) => {
    const s = searchQuery.toLowerCase();
    return (
        (u.fullName || "").toLowerCase().includes(s) ||
        (u.userName || "").toLowerCase().includes(s)
    );
  });

  // Sohbetleri filtrelemek için yeni bir liste oluşturabilirsiniz:
  const filteredChats = chats.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30">
        {/* SOL PANEL */}
        <div className="flex w-full flex-col border-r bg-card lg:w-80">
          <div className="border-b p-4">
            <h2 className="font-semibold text-lg">Sohbetler</h2>
          </div>

          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              {/* Artık sohbetleri aramak için kullanılıyor */}
              <Input
                  placeholder="Sohbet ara..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* TÜM KULLANICILAR YERİNE GEÇMİŞ SOHBETLERİ LİSTELE */}
            {filteredChats.map((chat) => {
              const isSelected = chat.id === activeChat;

              return (
                  <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                          "flex w-full items-center gap-3 border-b p-4 hover:bg-muted/50 transition-colors",
                          isSelected && "bg-muted/50"
                      )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{chat.name?.charAt(0) || "U"}</AvatarFallback>
                        {chat.avatar && <AvatarImage src={chat.avatar} alt={chat.name} />}
                      </Avatar>
                      {/* Çevrimiçi göstergesi (isteğe bağlı) */}
                      {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate pr-2">{chat.name}</h3>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(chat.timestamp)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage || "Henüz mesaj yok"}
                        </p>
                        {/* Okunmamış mesaj sayısı */}
                        {chat.unread > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {chat.unread}
                                    </span>
                        )}
                      </div>
                    </div>
                  </button>
              );
            })}

            {/* Sohbet yoksa uyarı */}
            {chats.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">
                  Henüz aktif sohbetiniz yok.
                </p>
            )}
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="hidden flex-1 flex-col lg:flex">
          {!activeChatData ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                    title="Mesaj seçin"
                    description="Sohbete başlamak için soldan bir sohbet seçin"
                />
              </div>
          ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {activeChatData.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{activeChatData.name}</h2>
                      {/* İsteğe bağlı: Online durumu burada da gösterebilirsiniz */}
                      {activeChatData.isOnline && (
                          <p className="text-sm text-green-500">Çevrimiçi</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChatData.messages.map((message) => {
                    const isSent = message.senderId === currentUser.id;

                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "flex",
                                isSent ? "justify-end" : "justify-start"
                            )}
                        >
                          <div
                              className={cn(
                                  "flex max-w-[70%] gap-2",
                                  isSent && "flex-row-reverse"
                              )}
                          >
                            <div
                                className={cn(
                                    "rounded-2xl px-4 py-2",
                                    isSent
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border"
                                )}
                            >
                              <p>{message.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground self-end">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Mesaj yazma alanı */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Button variant="ghost" size="icon" type="button">
                      <Smile />
                    </Button>

                    <Input
                        placeholder="Mesaj yazın..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />

                    <Button type="submit" size="icon" disabled={!messageText.trim()}>
                      <Send />
                    </Button>
                  </form>
                </div>
              </>
          )}
        </div>
      </div>
  );
}