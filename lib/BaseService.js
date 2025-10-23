// lib/BaseService.js

import api from './api';

// 📌 HTTP Metod Sabitleri
export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

/**
 * Backend'e istek atmak için temel sarmalayıcı (wrapper) fonksiyon.
 * @param {object} config - İstek konfigürasyonu
 * @param {string} config.method - HTTP metodu (GET, POST, PUT, DELETE)
 * @param {string} config.url - Endpoint yolu (baseURL hariç)
 * @param {object} [config.params] - Query parametreleri
 * @param {object} [config.data] - İstek gövdesi (body)
 * @returns {Promise<object>} Yanıt verisi ve durumu
 */
export async function BaseService({
                                      method,
                                      url,
                                      params,
                                      data,
                                      headers = {}, // Başlıklar, api.js'deki varsayılanları geçersiz kılabilir
                                  }) {
    try {
        const response = await api({
            method,
            url,
            params,
            data,
            headers,
        });

        // Axios yanıt yapısı: { data, status, statusText, headers, config }
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        // Hata yönetimini burada merkezi hale getirebilirsiniz.
        console.error(`API İstek Hatası (${method} ${url}):`, error.response || error.message);

        // Hata nesnesini fırlatıyoruz ki, çağıran fonksiyon (service) yakalayabilsin.
        throw error.response ? error.response.data : new Error(error.message);
    }
}