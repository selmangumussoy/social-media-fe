import { BaseService, GET, POST, PUT, DELETE } from "@/lib/BaseService"


const QUOTE_POST_URL = "/api/quote-posts"



export async function getAllQuotePosts() {
    try {
        const response = await BaseService({
            method: GET,
            url: QUOTE_POST_URL,
        })
        // Backend AbstractController -> Response<DataResponse<Res>>
        // Genelde response.data.data dizisi döner
        return response?.data?.data || []
    } catch (error) {
        console.error("Kitap alıntılarını getirme hatası:", error)
        return []
    }
}


export async function getQuotePostById(id) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${QUOTE_POST_URL}/${id}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Kitap alıntısı detayını getirme hatası:", error)
        return null
    }
}


export async function createQuotePost(quoteData) {
    try {
        const response = await BaseService({
            method: POST,
            url: QUOTE_POST_URL,
            data: {
                title: quoteData.title || "",
                bookName: quoteData.bookName,
                author: quoteData.author || "",
                quotePage: quoteData.quotePage || null,
                publisher: quoteData.publisher || "",
                totalPages: quoteData.totalPages || null,
                thought: quoteData.thought,
                tagIds: quoteData.tagIds || [], // ✅ sadece ID dizisi gönder
                //
                },
        })

        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Kitap alıntısı oluşturma hatası:", error?.response || error)
        throw error
    }
}

export async function updateQuotePost(id, quoteData) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${QUOTE_POST_URL}/${id}`,
            data: {
                title: quoteData.title || "",
                bookName: quoteData.bookName,
                author: quoteData.author || "",
                quotePage: quoteData.quotePage || null,
                publisher: quoteData.publisher || "",
                totalPages: quoteData.totalPages || null,
                thought: quoteData.thought,
            },
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Kitap alıntısı güncelleme hatası:", error?.response || error)
        throw error
    }
}


export async function deleteQuotePost(id) {
    try {
        await BaseService({
            method: DELETE,
            url: `${QUOTE_POST_URL}/${id}`,
        })
        return true
    } catch (error) {
        console.error("Kitap alıntısı silme hatası:", error)
        return false
    }
}
