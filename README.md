# Medikent Raporlama Asistanı v2.6

## Yeni özellikler
- Faaliyet kaydına isteğe bağlı fotoğraf yükleme
- Birden fazla fotoğraf seçme
- Fotoğraf önizleme
- Sosyal medya / haber linki alanı
- Fotoğrafları Firebase Storage'a yükleme
- Fotoğraf bağlantılarını Firestore faaliyet kaydında saklama
- Otomatik raporda faaliyet fotoğraflarını gösterme

## Önemli
Firebase Storage etkin olmalıdır.

Firebase Console:
Build / Storage > Get started

Önerilen başlangıç Storage kuralı:

rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /activity-photos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Bu kural yalnızca oturum açmış kullanıcıların faaliyet fotoğraflarına erişmesine izin verir.

## GitHub'a yüklenecek dosyalar
- index.html
- app.js
- style.css
- firebase-app.js
- README.md
