import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService"

// Backend Controller'daki @RequestMapping("/api/thoughts") ile eşleşmeli
const THOUGHT_URL = "/api/thoughts"

/**
 * 💭 Yeni düşünce (Thought) detayını oluştur
 * (Backend: POST /api/thoughts)
 * * Beklenen payload: { postId: "uuid", content: "text", feeling: "happy" }
 */
export async function createThoughtPost(thoughtData) {
    try {
        const response = await BaseService({
            method: POST,
            url: THOUGHT_URL,
            data: thoughtData,
        })
        // Backend standart response: { data: { ... }, meta: { ... } }
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Thought post oluşturma hatası:", error)
        throw error
    }
}

/**
 * 🔍 Tüm thought kayıtlarını getir
 * (Backend: GET /api/thoughts)
 */
export async function getAllThoughtPosts() {
    try {
        const response = await BaseService({
            method: GET,
            url: THOUGHT_URL,
        })
        // Backend PageResponse veya List döndürebilir, ikisini de garantiye alalım
        return response?.data?.data?.items || response?.data?.data || []
    } catch (error) {
        console.error("Thought listesi getirme hatası:", error)
        return []
    }
}

/**
 * 📄 ID ile tek bir thought getir
 * (Backend: GET /api/thoughts/{id})
 */
export async function getThoughtPostById(id) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${THOUGHT_URL}/${id}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Thought detayı getirme hatası:", error)
        return null
    }
}

/**
 * ✏️ Thought güncelle (İçerik veya duygu değişimi için)
 * (Backend: PUT /api/thoughts/{id})
 */
export async function updateThoughtPost(id, thoughtData) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${THOUGHT_URL}/${id}`,
            data: thoughtData,
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Thought güncelleme hatası:", error)
        throw error
    }
}

/**
 * 🗑️ Thought sil
 * (Backend: DELETE /api/thoughts/{id})
 */
export async function deleteThoughtPost(id) {
    try {
        await BaseService({
            method: DELETE,
            url: `${THOUGHT_URL}/${id}`,
        })
        return true
    } catch (error) {
        console.error("Thought silme hatası:", error)
        return false
    }
}