# Medikent Raporlama Asistanı v4.0 — Supabase

Bu sürüm Firebase altyapısını tamamen kaldırır ve Supabase kullanır.

## Bağlanan servisler
- Supabase Auth: e-posta + şifre ile giriş
- Supabase Database:
  - departments
  - doctors
  - activities
  - profiles
- Supabase Storage:
  - faaliyet-fotograflari
- RLS rol sistemi:
  - admin
  - staff
  - viewer

## Hazır altyapı
Supabase tarafında daha önce kurulan:
- 14 bölüm
- 29 doktor
- Yönetici profili
- RLS güvenlik politikaları
- faaliyet-fotograflari özel bucket'ı

doğrudan kullanılır.

## Fotoğraflar
- JPEG, PNG ve WEBP
- Dosya başına en fazla 5 MB
- Supabase Storage'da ortak saklanır
- Yetkili kullanıcılar farklı bilgisayarlardan da görebilir
- PDF/Word raporunda faaliyet altında gösterilir

## GitHub'a yüklenecek dosyalar
- index.html
- app.js
- style.css
- supabase-app.js
- README.md

Eski `firebase-app.js` dosyasını GitHub deposundan silin.

## Giriş
İlk yönetici hesabı Supabase Authentication'da oluşturduğunuz e-posta ve şifre ile giriş yapar.

## Güvenlik
Tarayıcıda yalnızca Supabase Publishable Key bulunur.
Database parolası, secret key veya service_role key uygulamaya eklenmemiştir.
