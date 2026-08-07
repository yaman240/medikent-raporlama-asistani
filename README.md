# Medikent Raporlama Asistanı v1.2

## Yeni özellikler
- Firebase/Firestore altyapısı
- Google ile kullanıcı girişi
- Çoklu cihaz için ortak veri yapısı
- Firebase aktif değilse geçici yerel mod
- Kullanıcı adı ve çıkış düğmesi
- v1.1 özelliklerinin tamamı korunur

## Firebase kurulumu
1. Firebase Console'da yeni proje oluşturun.
2. Authentication > Sign-in method > Google etkinleştirin.
3. Firestore Database oluşturun.
4. Project settings > Your apps > Web App ekleyin.
5. Verilen firebaseConfig değerlerini firebase-app.js içindeki alanlara yapıştırın.
6. GitHub'a şu dosyaları yükleyin:
   - index.html
   - style.css
   - app.js
   - firebase-app.js
   - README.md

## Önemli
Firestore güvenlik kuralları ayrıca ayarlanmalıdır.
Kurallar yapılmadan uygulamayı gerçek kullanıcılarla kullanmayın.
