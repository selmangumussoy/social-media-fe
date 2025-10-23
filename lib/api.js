// lib/api.js

import axios from "axios";

// Backend'inizin adresi (Spring Boot varsayılanı 8080'dir)
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Backend'iniz CORS'ta allowCredentials: true dediği için gerekli
    headers: {
        'Content-Type': 'application/json',
    },
});

// 📌 Giden İsteklere JWT'yi Otomatik Ekleme (Interceptor)
api.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('jwt_token');

        // Eğer token varsa, Authorization başlığına ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// 💡 İpucu: Yanıt (Response) interseptörüne 401 hatası (Yetkisiz) durumunda
// kullanıcının oturumunu kapatma ve giriş sayfasına yönlendirme mantığı eklenebilir.

export default api;