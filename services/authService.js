// services/authService.js

import { BaseService, POST } from '../lib/BaseService';
// Not: Eğer BaseService ve metod sabitleri farklı bir klasördeyse yolu düzeltin.

const AUTH_URL = '/auth'; // Spring Security config'inizdeki uç nokta ön eki

// 📌 JWT'yi LocalStorage'a Kaydeden Yardımcı Fonksiyon
// BaseService'deki Interceptor otomatik olarak bu token'ı sonraki isteklere ekleyecektir.
const saveToken = (token) => {
    if (token) {
        localStorage.setItem('jwt_token', token);
        console.log("JWT başarıyla kaydedildi.");
    }
};

/**
 * Kullanıcının giriş yapmasını sağlar ve JWT'yi kaydeder.
 * LoginRequest(username, password) kayıt yapısına uygun.
 * @param {string} username - Kullanıcı adı (muhtemelen email)
 * @param {string} password - Şifre
 * @returns {Promise<object>} LoginResponse(token) içerir.
 */
export async function login(username, password) {
    const loginPayload = {
        username: username,
        password: password,
    };

    try {
        // Backend'deki LoginRequest'e uygun payload ile istek atılıyor.
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/login`, // Örn: /auth/login
            data: loginPayload,
        });

        // Backend'den gelen LoginResponse(token) yapısını bekliyoruz.
        const { token } = response.data;

        if (token) {
            saveToken(token);
        } else {
            console.warn("Giriş başarılı ancak token yanıt içinde bulunamadı.");
        }

        return response.data; // LoginResponse'u döndür

    } catch (error) {
        // Hata durumunda, hatayı çağıran fonksiyona iletiyoruz.
        throw error;
    }
}

/**
 * Kullanıcıyı uygulamadan çıkarır ve JWT'yi siler.
 */
export function logout() {
    localStorage.removeItem('jwt_token');
    // İsteğe bağlı: Axios Authorization header'ını temizlemek için
    // api objenize bir "clearAuthHeader" fonksiyonu ekleyebilirsiniz.
    window.location.href = '/login'; // Kullanıcıyı giriş sayfasına yönlendir
}


// 📌 Kayıt (Sign Up) Servisi (Opsiyonel)
// public record SignUpRequest(password, email, name, surname, phoneNumber)
export async function signUp(signupData) {
    try {
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/sign-up`, // Örn: /auth/signup
            data: signupData,
        });

        const { token } = response.data; // SignUpResponse(token) yapısını bekliyoruz.
        if (token) {
            saveToken(token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
}