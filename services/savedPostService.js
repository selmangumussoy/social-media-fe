import { BaseService, GET, POST, DELETE } from "@/lib/BaseService"

const SAVED_POST_URL = "/api/saved-posts"

export async function savePost(data) {
    try {
        const response = await BaseService({
            method: POST,
            url: SAVED_POST_URL,
            data: data
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Post kaydetme hatası:", error)
        throw error
    }
}

export async function unsavePost(savedPostId) {
    try {
        await BaseService({
            method: DELETE,
            url: `${SAVED_POST_URL}/${savedPostId}`
        })
        return true
    } catch (error) {
        console.error("Kaydı kaldırma hatası:", error)
        return false
    }
}

export async function getSavedPostsByUser(userId) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${SAVED_POST_URL}/user/${userId}`
        })

        return response?.data?.data?.items || response?.data?.data || []
    } catch (error) {
        console.error("Kaydedilenleri getirme hatası:", error)
        return []
    }
}