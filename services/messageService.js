// services/messageService.js
import { BaseService, GET, POST } from "@/lib/BaseService";

/**
 * Mesaj gönderme
 */
export async function createMessage(data) {
    const response = await BaseService({
        method: POST,
        url: `/messages/send`,
        data,
    });

    return response.data;
}

/**
 * İki kişi arasındaki mesaj geçmişini getirir
 */
export async function getChatMessages(userId, otherUserId) {
    const response = await BaseService({
        method: GET,
        url: `/messages/${userId}/${otherUserId}`,
    });

    return response.data;
}

/**
 * Mesajları okundu işaretle
 */
export async function markMessagesAsSeen(userId, otherUserId) {
    const response = await BaseService({
        method: POST,
        url: `/messages/seen/${userId}/${otherUserId}`,
    });

    return response.data;
}
