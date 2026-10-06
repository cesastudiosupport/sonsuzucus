# Release Build Bilgisi

Build tarihi: 21 Eylul 2026

Komut:

```powershell
.\tools\create_signed_release.ps1 -AutoGeneratePassword
```

## Uretilen Dosyalar

Play Console icin asil dosya:

`C:\Users\cemal\source\repos\SonsuzUcus\app\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus-Signed.aab`

Boyut: yaklasik 78.50 MB

Telefon/manuel test icin APK:

Upload key:

`C:\Users\cemal\source\repos\SonsuzUcus\play-store\signing\sonsuz-ucus-upload.jks`

Upload key sifre dosyasi:

`C:\Users\cemal\source\repos\SonsuzUcus\play-store\signing\upload-key-password.txt`

## Build Sonucu

Release publish tamamlandi. Hata yok.

Gorulen uyarilar:

- AndroidX paketlerinde NU1608 surum uyari mesajlari.
- `Platforms/Android/GameAudioService.cs` icinde nullable uyari mesajlari.

Bu uyarilar build'i durdurmadi. Yayin oncesi temizlik icin daha sonra ele alinabilir.

## Imza Kontrolu

`jarsigner -verify -verbose -certs` ile kontrol edildi.

Sonuc:

- AAB imzasi dogrulandi.
- Sertifika sahibi: `CN=Cesa Studio, OU=Cesa Studio, O=Cesa Studio, L=Istanbul, ST=Istanbul, C=TR`
- Bu AAB artik debug sertifikasi ile imzali degildir.

Play Console'a yuklenecek dosya bu yeni `Signed.aab` dosyasidir.

## Yayin Oncesi Not

Bu release ciktisi gercek upload key ile imzali. Uygulamada halen test AdMob ID'leri duruyorsa para kazanma acilmadan once gercek AdMob App ID/reklam unit ID'leri ile yeni release build alinmali.
