// services/postService.js
import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService"

const POST_URL = "/api/posts"

export async function createPost(postData) {
    try {
        const response = await BaseService({
            method: POST,
            url: POST_URL,
            data: postData,
        })
        return response.data?.data || response.data
    } catch (error) {
        console.error("Post kaydı oluşturma hatası:", error)
        throw error
    }
}
