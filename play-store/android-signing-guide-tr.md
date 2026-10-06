# Android Yayin Imzalama Rehberi

Mevcut release build basarili uretildi ancak debug sertifikasi ile imzali gorunuyor. Play Store'a final yukleme icin gercek bir upload key/yayin imzalama akisi gerekir.

## Onerilen AkiS

1. Play Console'da uygulamayi olustur.
2. Play App Signing'i etkinlestir.
3. Bu uygulama icin bir upload key olustur.
4. Release AAB'yi bu upload key ile imzala.
5. Play Console'a `.aab` dosyasini yukle.

Bu repoda bu adimlari kolaylastiran script:

```powershell
.\tools\create_signed_release.ps1
```

Script sifreleri terminalde sorar, `play-store\signing\sonsuz-ucus-upload.jks` dosyasini olusturur ve final imzali AAB alir.

## Upload Key Olusturma

Asagidaki degerleri yayin sirasinda gercek bilgilerle doldur:

```powershell
keytool -genkeypair -v `
  -keystore play-store\signing\sonsuz-ucus-upload.jks `
  -storetype JKS `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000 `
  -alias sonsuzucus `
  -dname "CN=TODO, OU=TODO, O=TODO, L=TODO, S=TODO, C=TR"
```

Parolalari guvenli bir yerde sakla. Bu dosya kaybolursa ileride uygulama guncellemesi yayinlamak zorlasir.

## Yayin AAB Uretme

```powershell
dotnet publish app\SonsuzUcus.csproj -c Release -f net10.0-android `
  -p:AndroidKeyStore=true `
  -p:AndroidSigningKeyStore=..\play-store\signing\sonsuz-ucus-upload.jks `
  -p:AndroidSigningKeyAlias=sonsuzucus `
  -p:AndroidSigningKeyPass=KEY_PASSWORD `
  -p:AndroidSigningStorePass=STORE_PASSWORD
```

Parolalari komut satirinda yazmak komut gecmisinde kalabilir. Daha guvenli akista CI secret, ortam degiskeni veya yerel `signing.properties` dosyasi kullanilmalidir.

## Kontrol

Build sonrasinda imzayi kontrol et:

```powershell
jarsigner -verify -verbose -certs app\bin\Release\net10.0-android\publish\com.senisim.sonsuzucus-Signed.aab
```

Beklenen sonuc: sertifika sahibi `CN=Android Debug, O=Android, C=US` olmamali. Kendi upload key bilgilerin gorunmeli.

## AdMob ile Birlikte Final Build

Gercek yayin build'i almadan once:

- `AndroidManifest.xml` icindeki AdMob App ID gercek degerle degismeli.
- `AdMobService.cs` icindeki banner/interstitial/rewarded unit ID'leri gercek degerlerle degismeli.
- Sonra imzali release build yeniden alinmali.

