import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService"

const TAG_URL = "/tags"

// 🔎 Etiket arama (query param ile)
export async function searchTags(query) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${TAG_URL}/search?query=${encodeURIComponent(query)}`,
        })
        return response.data?.data?.items || [] // backend response yapına göre ayarla
    } catch (error) {
        console.error("Etiket arama hatası:", error)
        return []
    }
}

// 📌 Tüm etiketleri getir
export async function getAllTags() {
    try {
        const response = await BaseService({
            method: GET,
            url: TAG_URL,
        })
        return response.data?.data?.items || []
    } catch (error) {
        console.error("Tüm etiketleri getirme hatası:", error)
        return []
    }
}

// ➕ Yeni etiket ekle
export async function createTag(tagData) {
    try {
        const response = await BaseService({
            method: POST,
            url: TAG_URL,
            data: tagData,
        })
        return response.data
    } catch (error) {
        console.error("Etiket oluşturma hatası:", error)
        throw error
    }
}

// ✏️ Etiket güncelle
export async function updateTag(id, tagData) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${TAG_URL}/${id}`,
            data: tagData,
        })
        return response.data
    } catch (error) {
        console.error("Etiket güncelleme hatası:", error)
        throw error
    }
}

// 🗑 Etiket sil
export async function deleteTag(id) {
    try {
        await BaseService({
            method: DELETE,
            url: `${TAG_URL}/${id}`,
        })
        return true
    } catch (error) {
        console.error("Etiket silme hatası:", error)
        return false
    }
}

// 📌 Günlük trendleri getir
export async function getTrendingDaily() {
    try {
        const response = await BaseService({
            method: GET,
            url: "/tags/trending/daily",
        });
        return response.data?.data?.items || [];
    } catch (error) {
        console.error("Günlük trend etiketleri getirme hatası:", error);
        return [];
    }
}

// 📌 Haftalık trendleri getir
export async function getTrendingWeekly() {
    try {
        const response = await BaseService({
            method: GET,
            url: "/tags/trending/weekly",
        });
        return response.data?.data?.items || [];
    } catch (error) {
        console.error("Haftalık trend etiketleri getirme hatası:", error);
        return [];
    }
}
