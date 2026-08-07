# Medikent Raporlama Asistanı v2.0

Temiz Firebase sürümü.

## Özellikler
- Google ile giriş
- Cloud Firestore ortak kayıt sistemi
- Bilgisayar ve telefonda aynı veriler
- Kayıt ekleme / düzenleme / silme senkronu
- Yerel kayıtları tek tuşla buluta aktarma
- JSON yedekleme
- Aylık istatistik ve otomatik rapor
- v1.1 özellikleri korunur

## GitHub'a yüklenecek dosyalar
- index.html
- app.js
- style.css
- firebase-app.js
- README.md

## Firebase Authentication
Authorized domains / Yetkilendirilmiş alanlar bölümünde:
yaman240.github.io

bulunmalıdır.

## Firestore kuralı
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
