import { BaseService, POST } from '@/lib/BaseService';

export async function createBlogPost(blogPostData) {
    const response = await BaseService({
        method: POST,
        url: "/blog-posts",
        data: blogPostData,
    });
    return response.data;
}
