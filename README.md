# Medikent Raporlama Asistanı v1.3

Bu sürüm Firebase projesine gerçek olarak bağlanmıştır.

## Özellikler
- Google ile kullanıcı girişi
- Cloud Firestore ortak kayıt sistemi
- Bilgisayar ve telefonda aynı kayıtların görünmesi
- Kayıt ekleme / düzenleme / silme Firestore ile senkron
- Mevcut localStorage kayıtlarını tek tuşla Firebase'e aktarma
- JSON yedek alma / geri yükleme
- v1.1 arayüz ve raporlama özelliklerinin tamamı korunur

## GitHub'a yüklenecek dosyalar
- index.html
- style.css
- app.js
- firebase-app.js
- README.md

## Firebase Authentication için önemli
Firebase Console > Authentication > Settings > Authorized domains
bölümünde şu alanın bulunması gerekir:

yaman240.github.io

Bulunmuyorsa ekleyin.

## Firestore güvenlik kuralı (geliştirme aşaması)
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Bu kural yalnızca oturum açmış kullanıcıların veriye erişmesini sağlar.
İlerleyen sürümde admin/personel/görüntüleyici rolleriyle daraltılacaktır.
