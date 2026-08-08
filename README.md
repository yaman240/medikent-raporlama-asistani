# Medikent Raporlama Asistanı v4.5 — Şablon Yönetimi

Şablonlar artık kodun içine sabit değildir. Supabase `activity_templates` tablosundan gelir.

## Yönetici yapabilir
- Yeni şablon ekleme
- Şablon düzenleme
- Aktif / pasif yapma
- Şablon silme

Normal kullanıcılar yalnızca aktif şablonları kullanır.

## Önemli: İlk kurulum
GitHub dosyalarını yüklemeden/sonra Supabase SQL Editor'de paket içindeki
`SUPABASE-v4.5-SABLONLAR.sql` dosyasının tamamını bir kez çalıştır.

Bu işlem:
- activity_templates tablosunu oluşturur
- RLS güvenlik kurallarını kurar
- mevcut 5 şablonu başlangıç verisi olarak ekler

## GitHub'a yüklenecek uygulama dosyaları
- index.html
- app.js
- style.css
- supabase-app.js
- README.md

`SUPABASE-v4.5-SABLONLAR.sql` GitHub'a yüklemek zorunda değilsin; Supabase SQL Editor'de bir kez çalıştırman yeterlidir.
