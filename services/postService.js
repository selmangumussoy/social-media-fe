import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService"

const POST_URL = "/api/posts"

/**
 * 🧩 Tüm postları getir
 * (Backend: GET /api/posts)
 */
export async function getAllPosts() {
    try {
        const response = await BaseService({
            method: GET,
            url: "/api/posts",
        });

        console.log("📦 Post API Yanıtı:", response);

        // Burada response.data, backend'in döndüğü { data: { items: [...] } }
        const items = response?.data?.data?.items || [];

        console.log("✅ Dönen post listesi:", items);
        return items;
    } catch (error) {
        console.error("Postları getirme hatası:", error);
        return [];
    }
}


/**
 * 🔍 Tek bir postu ID ile getir
 * (Backend: GET /api/posts/{id})
 */
export async function getPostById(id) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${POST_URL}/${id}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Post detayını getirme hatası:", error)
        return null
    }
}

/**
 * ➕ Yeni post oluştur
 * (Backend: POST /api/posts)
 */
export async function createPost(postData) {
    try {
        const response = await BaseService({
            method: POST,
            url: POST_URL,
            data: postData,
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Post oluşturma hatası:", error)
        throw error
    }
}

/**
 * ✏️ Post güncelle
 */
export async function updatePost(id, postData) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${POST_URL}/${id}`,
            data: postData,
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Post güncelleme hatası:", error)
        throw error
    }
}

/**
 * 🗑️ Post sil
 */
export async function deletePost(id) {
    try {
        await BaseService({
            method: DELETE,
            url: `${POST_URL}/${id}`,
        })
        return true
    } catch (error) {
        console.error("Post silme hatası:", error)
        return false
    }
}
