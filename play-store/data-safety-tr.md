# Play Console Data Safety Taslagi

Bu dosya hukuki danismanlik degildir. Play Console formu doldurulurken Google Mobile Ads SDK'nin Play SDK Index/Data Safety aciklamalari ve uygulamanin son kod hali tekrar kontrol edilmelidir.

## Genel Cevaplar

- Uygulama kullanici verisi topluyor veya paylasiyor mu? Evet, reklam SDK'si nedeniyle ucuncu taraf veri isleme/paylasim beyanlari gerekebilir.
- Uygulama reklam iceriyor mu? Evet.
- Veriler aktarim sirasinda sifreleniyor mu? Google Mobile Ads SDK aktarimlari icin evet, hizmet saglayicinin standart guvenli aktarimlari kullanilir. Uygulamanin kendi sunucusu yoktur.
- Kullanici veri silme talebinde bulunabiliyor mu? Hesap/veri sunucuda tutulmadigi icin hesap silme akisi yoktur. Yerel ilerleme, cihaz ayarlarindan uygulama verilerini temizleyerek veya uygulamayi kaldirarak silinir.
- Hesap olusturma zorunlu mu? Hayir.

## Uygulamanin Kendi Sakladigi Yerel Veriler

Bu veriler cihazda kalir ve gelistirici sunucusuna gonderilmez:

- Skor ve rekor
- XP/pilot rutbesi
- Toplanan oyun ici materyaller
- Acilan kozmetikler
- Ayar tercihleri

Play Console'da "collected/shared" alanlari icin bu verileri ancak cihaz disina cikiyorsa isaretlemek gerekir. Mevcut uygulama tasariminda cihaz disina cikmaz.

## Google Mobile Ads SDK Nedeniyle Isaretlenebilecek Alanlar

Son karar, AdMob hesabinda kullanilan reklam ayarlari ve Google SDK veri beyanina gore verilmelidir. Mevcut reklam altyapisina gore beklenen alanlar:

- Device or other IDs: Advertising ID / app set ID gibi reklam ve cihaz tanimlayicilari.
- App activity: Reklam etkilesimleri, uygulama etkilesimleri veya uygulama ici reklam olaylari.
- App info and performance: Crash logs, diagnostics veya performans verileri.
- Approximate location: Google Mobile Ads tarafindan reklam uygunlugu icin islenebilir. Hassas konum izni uygulamada yoktur.

Kullanim amaclari:

- Advertising or marketing
- Analytics
- Fraud prevention, security, and compliance
- App functionality

Paylasim:

- Google Mobile Ads/Google ile reklam hizmeti saglamak icin paylasim olabilir.
- Uygulamanin kendi sunucusuna veri aktarimi yoktur.

## Play Console Formu Icin Not

Data Safety yanitlari, gercek yayin build'inde bulunan tum SDK'lari kapsamalidir. Eger ileride Firebase, analitik, liderlik tablosu, bulut kayit, satin alma veya hesap sistemi eklenirse bu dosya ve gizlilik politikasi yeniden guncellenmelidir.

