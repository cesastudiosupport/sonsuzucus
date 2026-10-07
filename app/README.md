# Sonsuz Uçuş

Sonsuz Uçuş, tek dokunuşla oynanan refleks ve akış oyunudur. Oyuncu basılı tutarak yükselir, bırakarak süzülür; mağara koridorlarında kapılardan geçer, kristal rotalarını toplar, yakın geçişlerle overdrive doldurur ve giderek sertleşen biyomlarda rekor kovalar.

## Mevcut Özellikler

- Dikey ve yatay ekran düzenine uyumlu profesyonel oyun arayüzü
- Mesafe, skor, rekor, kristal ve görev ilerlemesi için canlı HUD
- Kapı, lazer, drone, mağara duvarı ve hareketli tehlike sistemi
- Yakın geçiş, kusursuz kapı ve görev tabanlı ek skor
- Overdrive modu, kalkan, mıknatıs, kristal ve hız desteği güçlendirmeleri
- Buz Mağarası, Neon Geçit, Altın Kanyon, Kızıl Fırtına ve Uzay Limanı biyomları
- Gemi ve iz kozmetikleri için yerel hangar ekonomisi
- Sesli geri bildirim, parçacık efektleri, ekran sarsıntısı ve sonuç paneli
- Yerel kayıt: rekor, kristal ve kozmetik durumları cihazda tutulur

## Android Paketleme

Debug/telefon kurulumu için:

```powershell
dotnet publish .\SonsuzUcus.csproj -f net10.0-android -c Release /nr:false
adb install --no-incremental -r --user 0 .\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus-Signed.apk
```

Play Store hazırlığında `.aab` üretimi için Release yapılandırması kullanılmalıdır.


## iOS / Transporter

Bundle ID: `com.senisim.sonsuzucus`. App Store Connect: `6820124267`.
Apple team: CEMAL SAVA (`W88RGSA7HY`). iOS store version: `1.0`.

The repository pins .NET SDK 10.0.103 and workload set 10.0.112.1; the verified
installation uses MAUI 10.0.110 and Microsoft.iOS 27.0.10722 with Xcode 27.0.
The minimum OS is iOS 15.0. iPhone and iPad are supported with a single scene.

Build the simulator app:

```sh
dotnet build app/SonsuzUcus.csproj -f net10.0-ios \
  -p:TargetFrameworks=net10.0-ios -c Debug \
  -p:RuntimeIdentifier=iossimulator-arm64 -p:EnableCodeSigning=true
```

Install the **Sonsuz Ucus App Store** distribution profile for this exact bundle
ID and team (current UUID: `4807e91e-50b3-48d4-b761-f96753a8f243`), then create
the signed IPA from the repository root:

```sh
dotnet publish app/SonsuzUcus.csproj -f net10.0-ios \
  -p:TargetFrameworks=net10.0-ios -p:PublishProfile=AppStore \
  -p:ApplicationVersion=3
```

Use a new build number if that number already exists in App Store Connect.
The output is `app/bin/Release/net10.0-ios/ios-arm64/publish/SonsuzUcus.ipa`.
Add that IPA to Transporter, select **CEMAL SAVA**, and deliver it. Uploading does
not submit the app for review or publish it. Never upload a simulator build.

### Permissions and privacy

The iOS build plays bundled content and stores progress locally. It includes no
advertising/tracking SDK, permission request, background mode, or custom
entitlement. Audio playback does not require microphone permission. The privacy
manifest declares the .NET runtime's required APIs and app-only user defaults;
tracking and collected-data lists are empty. Non-exempt encryption is false.
Review the declarations if network services or SDKs are added later.

References:
- https://learn.microsoft.com/dotnet/maui/ios/deployment/publish-cli
- https://learn.microsoft.com/dotnet/maui/ios/privacy-manifest
- https://github.com/dotnet/macios/releases/tag/dotnet-10.0.1xx-xcode27.0-10722

### Verified delivery — 2026-10-07

- Version 1.0, build 3, bundle `com.senisim.sonsuzucus` was delivered through
  Transporter to CEMAL SAVA / Apple ID 6820124267 at 21:31 Europe/Berlin.
- Transporter displayed **Delivered / The app is processing**. App Review
  submission and publication have not been performed.
- The final IPA includes `CFBundleIconName=appicon` for iPhone and iPad,
  verified 120, 152, 167 and 1024 pixel icon renditions, the privacy manifest,
  and the correct App Store profile. Apple distribution signature verification passed.
- iOS 27 simulator launch and seven game-logic tests passed earlier in this
  work. Physical-device gameplay/audio and TestFlight acceptance remain to be tested.
- Keep `AppIcon` in the iOS project settings and `XSAppIcon` in Info.plist;
  after changing icon selection, use a clean Release build to refresh asset caches.
