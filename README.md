# Medikent Raporlama Asistanı v4.1 — Supabase Fotoğraf Düzeltmesi

## Düzeltilen sorun
v4.0'da faaliyet fotoğrafı Supabase Storage'a yüklenebiliyor ancak uygulama ve raporda kırık/boş görünebiliyordu.

## v4.1 çözümü
Fotoğraflar artık signed URL ile gösterilmiyor.

Uygulama:
1. Supabase Storage'daki dosyayı yetkili oturumla indirir.
2. Tarayıcıda Data URL'e çevirir.
3. Kayıt düzenleme ekranında gösterir.
4. Rapor ekranına gömer.
5. PDF ve Word çıktısında aynı gömülü görseli kullanır.

Bu yaklaşım özel (private) bucket ile daha güvenilir çalışır.

## GitHub'a yüklenecek dosyalar
- index.html
- app.js
- style.css
- supabase-app.js
- README.md

Eski firebase-app.js repoda dursa bile index.html tarafından çağrılmadığı için çalışmaz.
