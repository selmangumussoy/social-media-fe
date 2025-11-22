import {BaseService, GET, POST} from '@/lib/BaseService';

// Backend Controller'daki @RequestMapping("/blog-posts") ile birebir aynı
const BLOG_POST_URL = "/blog-posts";

/**
 * 📝 Yeni Blog Detayı Oluştur
 * Backend Beklentisi: { postId: "...", blogContent: "...", coverImage: "..." }
 */
export async function createBlogPost(blogPostData) {
    try {
        const response = await BaseService({
            method: POST,
            url: BLOG_POST_URL,
            data: blogPostData,
        });

        // Standart response yapısına (response.data.data) uyumlu dönüş
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Blog post detayı oluşturma hatası:", error);
        throw error;
    }
}
export async function getBlogPostByPostId(postId) {
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
