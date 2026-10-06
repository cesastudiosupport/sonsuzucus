# Sonsuz Ucus - Play Store Hazirlik Notlari

Bu dosya uygulama yayinina cikmadan once kontrol edilecek maddeleri toplar.

## Teknik Durum

- Paket adi: `com.senisim.sonsuzucus`
- Android hedefi: `net10.0-android`, target SDK 36
- Minimum Android: API 24
- Reklam SDK: Google Mobile Ads
- Cikti: Release publish APK/AAB uretilecek
- Yayin paketi: `../play-store/`

## Yayin Oncesi Zorunlu Isler

- `Platforms/Android/AndroidManifest.xml` icindeki test AdMob App ID gercek App ID ile degistirilmeli.
- `Platforms/Android/AdMobService.cs` icindeki banner, interstitial ve rewarded test unit ID'leri gercek reklam unit ID'leriyle degistirilmeli.
- Play Console'da "Contains ads" isaretlenmeli.
- Play Console Data Safety formu, Google Mobile Ads SDK dahil edilerek doldurulmali.
- Magaza listeleme alanina gizlilik politikasi URL'si eklenmeli.
- Uygulama icindeki Gizlilik paneli, yayin URL'si ve sirket/iletisim bilgileriyle guncellenmeli.
- IARC icerik derecelendirme anketi doldurulmali.
- Hedef kitle cocuklari kapsayacaksa notr yas ekrani, cocuklara uygun reklam ayarlari ve kisilestirilmemis reklam akisi ayrica eklenmeli.

## Hazirlanan Yayin Dosyalari

- `../play-store/store-listing-tr.md`: Google Play magaza metni.
- `../play-store/release-notes-tr.txt`: Ilk surum yayin notu.
- `../play-store/privacy-policy-tr.md`: Gizlilik politikasi metni.
- `../play-store/privacy-policy.html`: Yayinlanabilir HTML gizlilik politikasi.
- `../play-store/data-safety-tr.md`: Data Safety formu icin cevap taslagi.
- `../play-store/review-checklist-tr.md`: Son yayin kontrol listesi.
- `../play-store/reviewer-notes-tr.txt`: Inceleme ekibi notu.
- `../play-store/release-build-info.md`: Uretilen Release AAB/APK bilgisi.
- `../play-store/android-signing-guide-tr.md`: Gercek upload key ile imzalama rehberi.

## Son Release Build

- Komut: `.\tools\create_signed_release.ps1 -AutoGeneratePassword`
- Play Console icin AAB: `bin\Release\net10.0-android\publish\com.senisim.sonsuzucus-Signed.aab`
- Durum: Build tamamlandi, hata yok. AndroidX ve nullable uyarilari var.
- Imza durumu: `CN=Cesa Studio, OU=Cesa Studio, O=Cesa Studio, L=Istanbul, ST=Istanbul, C=TR` upload key ile imzali.

## Kalite Kontrol

- Dikey ve yatay modda en az 10 kosu oynanip UI cakismasi kontrol edilmeli.
- Reklamlar oyun sirasinda degil, menu/sonuc ekraninda gorunmeli.
- Odullu reklam kullanici istegiyle acilmali ve odul sadece reklam tamamlaninca verilmeli.
- Dusuk yakit, hasar, kalkan, kapilar ve gunluk rota akislari test edilmeli.
- Release `aab` ciktisi Play Console icin tercih edilmeli.
