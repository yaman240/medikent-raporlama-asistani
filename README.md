# Medikent Raporlama Asistanı v3.0

## Ücretsiz fotoğraf sistemi

Firebase Storage kaldırıldı.

Faaliyet fotoğrafları:
- Tarayıcının IndexedDB alanında saklanır.
- Firebase'e yüklenmez.
- Ücret gerektirmez.
- PDF ve Word raporuna fotoğrafı yüklediğiniz cihazda otomatik eklenir.
- Fotoğraf olmadan faaliyet kaydı yapılabilir.

## Önemli sınırlama
Fotoğraflar cihazlar arasında senkron olmaz.

Örnek:
- Fotoğrafı iş bilgisayarından yüklediyseniz fotoğraflı raporu iş bilgisayarından alın.
- Telefonda aynı faaliyet metni görünür, ancak iş bilgisayarında saklanan fotoğraf telefonda görünmez.

Bölüm, doktor, faaliyet ve istatistik verileri Firebase Firestore'da ortak kalmaya devam eder.

## Fotoğraf optimizasyonu
Fotoğraflar kaydedilmeden önce:
- en fazla 1600 px boyuta küçültülür,
- JPEG olarak sıkıştırılır,
- tarayıcının IndexedDB alanına kaydedilir.
