// services/chatService.js
import {BaseService, GET, POST} from "@/lib/BaseService";
const CHAT_URL = "/chats";

/**
 * Kullanıcının tüm chat listesi
 */
export async function getMyChats(userId) {
    const response = await BaseService({
        method: "GET",
        url: `api/chats/me`,
        params: {
            userId,
            page: 0,
            size: 10
        }
    })


    return response.data;
}

export async function createChat(data) {
    const response = await BaseService({
        method: POST,
        url: CHAT_URL,
        data,
    });
    return response?.data?.data;
}