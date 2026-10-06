# Sonsuz Ucus - Yayin Paketi

Bu klasor, Google Play yayinina cikarken kopyalanacak metinleri ve kontrol listelerini toplar.

## Dosyalar

- `store-listing-tr.md`: Magaza adi, kisa aciklama, uzun aciklama ve anahtar kelime notlari.
- `release-notes-tr.txt`: Ilk surum yayin notu.
- `privacy-policy-tr.md`: Web'de yayinlanacak gizlilik politikasi metni.
- `privacy-policy.html`: Ayni politikanin tek dosyalik HTML surumu.
- `data-safety-tr.md`: Play Console Data Safety formu icin cevap taslagi.
- `review-checklist-tr.md`: Play Console'a yuklemeden once son kontrol listesi.
- `reviewer-notes-tr.txt`: Google inceleme ekibine verilebilecek kisa not.
- `android-signing-guide-tr.md`: Play Store icin gercek upload key ile imzalama adimlari.
- `release-build-info.md`: Son release build ciktisi ve imza durumu.
- `graphics/`: Ikon, feature graphic ve telefon ekran goruntuleri.

## Yayin Oncesi Kritik TODO

1. AdMob panelinden gercek App ID ve reklam unit ID'leri alinmali.
2. `app/Platforms/Android/AndroidManifest.xml` icindeki test AdMob App ID degistirilmeli.
3. `app/Platforms/Android/AdMobService.cs` icindeki test reklam unit ID'leri degistirilmeli.
4. `privacy-policy.html` herkese acik bir URL'de yayinlanmali.
5. Play Console'da gizlilik politikasi URL'si, reklam bildirimi, Data Safety ve hedef kitle formlari doldurulmali.
6. Release AAB, gercek yayin anahtari veya Play App Signing akisi ile imzalanmali. Mevcut test build debug sertifikasi ile imzali oldugu icin final yukleme dosyasi degildir.

## GitHub Pages

GitHub Pages icin hazir sayfa:

`../docs/public/privacy.html`

Repo GitHub'a push edildikten sonra Pages ayari `main` branch ve `/docs` klasoru olacak sekilde acilirsa politika URL'i su formatta olur:

`https://<github-kullanici-adi>.github.io/<repo-adi>/public/privacy.html`

Bu URL Play Console gizlilik politikasi alanina girilmeli.
