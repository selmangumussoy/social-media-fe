import { BaseService, POST } from "@/lib/BaseService"

// backend endpoint'in buydu varsayımıyla:
const THOUGHTS_URL = "/thoughts"

/**
 * Yeni thought/posta oluşturur.
 * @param {{ content: string, mediaUrls?: string[], visibility?: "PUBLIC"|"FOLLOWERS" }}
 */
export async function createThought(payload) {
    const res = await BaseService({
        method: POST,
        url: THOUGHTS_URL,
        data: payload,
    })
    // Response wrapper kullanıyorsan burada res.data.data olabilir.
    return res.data
}
