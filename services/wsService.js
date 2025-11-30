// services/wsService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

/**
 * WebSocket bağlantısı kur
 * @param {string} userId - login olan kullanıcı ID'si
 * @param {function} onMessage - mesaj geldiğinde çalışacak callback
 */
export function connectWebSocket(userId, onMessage) {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

    stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 3000,

        onConnect: () => {
            console.log("🔥 WS CONNECTED");

            // Her kullanıcıya özel kanal → Spring buraya mesaj gönderiyor
            const destination = `/user/${userId}/queue/private`;
            console.log("📡 Subscribing:", destination);

            stompClient.subscribe(destination, (frame) => {
                try {
                    const body = JSON.parse(frame.body);
                    onMessage(body);
                } catch (err) {
                    console.error("❌ WS MESSAGE PARSE ERROR:", err);
                }
            });
        },

        onStompError: (err) => {
            console.error("❌ WS STOMP ERROR:", err);
        },
    });

    stompClient.activate();
}

/**
 * Mesaj gönder
 */
export function sendWsMessage(msg) {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: "/app/message.send",
            body: JSON.stringify(msg),
        });
    } else {
        console.error("❌ WS not connected, message not sent");
    }
}

/**
 * Bağlantıyı kapat
 */
export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}
