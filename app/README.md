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

