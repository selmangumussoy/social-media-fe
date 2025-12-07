import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService";

// PostService "/api/posts" ile çalışıyorsa, burası da bu şekilde çalışacaktır.
const COMMENT_URL = "/api/comments";

/**
 * 💬 Bir gönderiye ait yorumları getir
 * (Backend: GET /api/comments/by-post/{postId})
 */
export async function getCommentsByPostId(postId) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${COMMENT_URL}/by-post/${postId}`,
        });

        console.log("📡 Backend'den Gelen Yorumlar:", response); // F12 konsolundan yapıyı görebilirsin

        // --- GÜÇLENDİRİLMİŞ KONTROL MEKANİZMASI ---

        // 1. Eğer direkt data bir diziyse onu döndür
        if (Array.isArray(response?.data)) {
            return response.data;
        }

        // 2. Eğer data'nın içinde 'data' varsa (DataResponse yapısı) ve o bir diziyse
        if (Array.isArray(response?.data?.data)) {
            return response.data.data;
        }

        // 3. Eğer items varsa (PageResponse yapısı olabilir)
        if (Array.isArray(response?.data?.data?.items)) {
            return response.data.data.items;
        }

        // Hiçbiri uymazsa boş dizi dön (Hata vermemesi için)
        return [];

    } catch (error) {
        console.error("Yorumları getirme hatası:", error);
        return [];
    }
}

/**
 * ➕ Yeni yorum ekle
 * (Backend: POST /api/comments)
 */
export async function createComment(commentData) {
    // commentData: { postId, content, parentCommentId(opsiyonel) }
    try {
        const response = await BaseService({
            method: POST,
            url: COMMENT_URL,
            data: commentData,
            // BaseService token'ı otomatik eklediği için header yazmamıza gerek yok
        });

        return response?.data?.data || response?.data;

    } catch (error) {
        console.error("Yorum ekleme hatası:", error);
        throw error;
    }
}

/**
 * ✏️ Yorum güncelle
 * (Backend: PUT /api/comments/{id})
 */
export async function updateComment(commentId, content) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${COMMENT_URL}/${commentId}`,
            data: { content }, // Backend obje bekliyorsa
        });

        return response?.data?.data || response?.data;

    } catch (error) {
        console.error("Yorum güncelleme hatası:", error);
        throw error;
    }
}

/**
 * 🗑️ Yorum sil
 * (Backend: DELETE /api/comments/{id})
 */
export async function deleteComment(commentId) {
    try {
        await BaseService({
            method: DELETE,
            url: `${COMMENT_URL}/${commentId}`,
        });
        return true;

    } catch (error) {
        console.error("Yorum silme hatası:", error);
        return false;
    }
}