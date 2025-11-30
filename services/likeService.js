import { BaseService, POST } from "@/lib/BaseService";

export const toggleLikeService = async (userId, postId) => {
    const response = await BaseService({
        method: POST,
        url: "/likes/toggle",
        data: { userId, postId }
    });

    return response.data;
};