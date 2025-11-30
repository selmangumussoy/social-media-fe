import { BaseService, GET, POST, PUT } from '@/lib/BaseService';

// 👇 Backend'deki @RequestMapping("/api/blog-posts") ile uyumlu olmalı
const BLOG_POST_URL = "/api/blog-posts";

/**
 * 📝 Yeni Blog Detayı Oluştur
 */
export async function createBlogPost(blogPostData) {
    try {
        const response = await BaseService({
            method: POST,
            url: BLOG_POST_URL,
            data: blogPostData,
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Blog post detayı oluşturma hatası:", error);
        throw error;
    }
}

/**
 * 🔍 Post ID ile Blog Detayını Getir (Düzenleme sayfası için)
 * Edit sayfasında "getBlogPostById" olarak çağırdığımız için ismini böyle eşitledim.
 */
export async function getBlogPostById(postId) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${BLOG_POST_URL}/by-post/${postId}`,
        });
        return response?.data?.data || null;
    } catch (error) {
        console.error("Blog detayı getirme hatası:", error);
        return null;
    }
}

/**
 * ✏️ Blog Detayını Güncelle
 * Backend Beklentisi: PUT /api/blog-posts/{id}
 */
export async function updateBlogPost(id, blogData) {
    try {
        // Buradaki "id", QuotePost'ta olduğu gibi "Gerçek Blog ID"si olmalı
        const response = await BaseService({
            method: PUT,
            url: `${BLOG_POST_URL}/${id}`,
            data: blogData
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Blog güncelleme hatası:", error);
        throw error;
    }
}