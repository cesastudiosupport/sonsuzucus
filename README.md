# Sonsuz Ucus

Sonsuz Ucus Android arcade oyunu, tarayici onizlemesi ve Google Play hazirlik dosyalari.

## Proje

- `app/`: .NET MAUI Android uygulamasi. Oyun kaynaklari `app/wwwroot/game/` altinda.
- `web/`: Android kaynaklarindan uretilen tarayici surumu.
- `tools/`: derleme, ses uretimi, onizleme ve test araclari.
- `play-store/`: magaza metinleri, gorseller ve yayin notlari.
- `docs/`: GitHub Pages gizlilik politikasi.

## Yerel Onizleme

```powershell
node tools/preview-server.cjs 8824
```

Tarayicida `http://localhost:8824/` adresini acin. Kaynak degisikliklerinden sonra `node tools/sync-web.cjs` ile `web/` kopyasini yenileyin.

## Android APK

.NET 10 MAUI Android is yukunu ve Android SDK kurulumunu gerektirir.

```powershell
dotnet restore app/SonsuzUcus.csproj
dotnet publish app/SonsuzUcus.csproj -c Release -f net10.0-android -p:AndroidPackageFormats=apk -p:AndroidKeyStore=false --no-restore
powershell -NoProfile -ExecutionPolicy Bypass -File tools/sign-flight-preview.ps1
```

Imzalama scripti yerel upload anahtarini gerektirir. Anahtarlar, parolalar ve APK/AAB ciktisi repoya dahil edilmez. Ayrintilar `play-store/` altindaki yayin belgelerinde.

## Testler

```powershell
node --test tools/flight-director.test.cjs
```

Tarayici testleri Playwright, Microsoft Edge ve calisan yerel onizleme sunucusunu gerektirir. `tools/flight-browser-test.cjs`, `tools/flight-simulation-test.cjs`, `tools/discovery-browser-test.cjs` ve `tools/event-audio-test.cjs` oyun akislarini kontrol eder.

## Gizlilik Politikasi

Gizlilik politikasi dosyasi:

`docs/public/privacy.html`

GitHub Pages ayari:

- Source: Deploy from a branch
- Branch: main
- Folder: /docs
