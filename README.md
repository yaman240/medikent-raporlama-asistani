# Medikent Raporlama Asistanı v2.9

## Doktor / bölüm eşleşmesi kalıcı düzeltme

Bu sürüm doktorların Tanımlar ekranında görünmesine rağmen Faaliyet ekranına gelmemesi sorununu düzeltir.

### Değişiklikler
- Doktor artık hem departmentId hem departmentName ile saklanır.
- Faaliyet ekranındaki doktor filtresi yalnızca ID'ye bağlı değildir.
- Eski Firebase bölüm kimlikleri bölüm adı üzerinden otomatik eşleştirilir.
- Eski doktor kayıtları açılışta canonical bölüm ID'sine otomatik taşınır.
- Bölüm seçildiğinde doktor listesi anında yeniden oluşturulur.
- Yeni doktor kaydedildiğinde faaliyet ekranındaki liste anında yenilenir.
- Aktif/Pasif değişikliği anında faaliyet ekranına yansır.
- Bölümde aktif doktor yoksa açık uyarı seçeneği görünür.

Bu sürüm özellikle eski Firebase kayıtları ile yeni hazır bölüm kimliklerinin çakışmasını çözmek için hazırlanmıştır.
