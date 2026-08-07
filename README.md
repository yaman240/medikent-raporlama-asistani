# Medikent Raporlama Asistanı v2.8

## Kritik veri düzeltmeleri

- Doktorlar artık Firebase listesi geldiğinde silinmez/ezilmez.
- Yeni doktor Firebase'e başarıyla yazılmadan "kaydedildi" denmez.
- Yerel ve Firebase doktor listeleri ID bazında birleştirilir.
- Faaliyet kaydı Firebase'e başarıyla yazılmadan başarı mesajı verilmez.
- Fotoğraf seçilmişse Storage yüklemesi başarısız olduğunda kayıt tamamlanmaz.
- Kayıtlar ekranında fotoğraf sayısı görünür.
- Faaliyet kaydedilince rapor ayı otomatik o faaliyetin ayına geçer.
- Firebase'den kayıtlar yüklenince rapor ayı son kayıt ayına otomatik geçer.
- Silme işlemi yeniden Firebase ile senkron çalışır.

## Fotoğraf için önemli
Cloud Storage for Firebase güncel olarak Blaze plan gerektirir.
Storage etkin değilse uygulama artık fotoğrafı kaydetmiş gibi davranmaz; açık hata gösterir.
