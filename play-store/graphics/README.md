# Play Store Gorselleri

Bu klasor Google Play listelemesi icin hazirlanan gorselleri icerir.

## Dosyalar

- `icon-512.png`: Play Console yuksek cozunurluklu uygulama ikonu.
- `feature-graphic-1024x500.png`: Play Console feature graphic.
- `promo-collage-1440x1080.png`: Tanitim/arsiv icin ekstra kolaj.
- `store-screenshots/`: Play Console'a yuklenecek profesyonel telefon ekran kartlari.
- `tablet-screenshots/7-inch/`: Play Console 7 inc tablet gorselleri.
- `tablet-screenshots/10-inch/`: Play Console 10 inc tablet gorselleri.
- `phone-screenshots/`: Ham oyun ekran goruntuleri.

## Play Console Icin Yuklenecek Telefon Gorselleri

- `store-screenshots/01-refleks-ucusu.png`
- `store-screenshots/02-yakit-yonetimi.png`
- `store-screenshots/03-zorlu-rotalar.png`
- `store-screenshots/04-odul-serisi.png`
- `store-screenshots/05-sade-ve-akici.png`
- `store-screenshots/06-rekor-pesinde.png`

Play Console icin en az iki telefon ekran goruntusu gerekir. Ilk yukleme icin onerilen sira:

1. `store-screenshots/01-refleks-ucusu.png`
2. `store-screenshots/02-yakit-yonetimi.png`
3. `store-screenshots/03-zorlu-rotalar.png`
4. `store-screenshots/04-odul-serisi.png`
5. `store-screenshots/05-sade-ve-akici.png`
6. `store-screenshots/06-rekor-pesinde.png`

## Tablet Gorselleri

7 inc tablet alani icin:

1. `tablet-screenshots/7-inch/01-tablet-refleks-ucusu.png`
2. `tablet-screenshots/7-inch/02-tablet-yakit-ve-kapi.png`
3. `tablet-screenshots/7-inch/03-tablet-rotalar.png`
4. `tablet-screenshots/7-inch/04-tablet-oduller.png`

10 inc tablet alani icin:

1. `tablet-screenshots/10-inch/01-tablet-refleks-ucusu.png`
2. `tablet-screenshots/10-inch/02-tablet-yakit-ve-kapi.png`
3. `tablet-screenshots/10-inch/03-tablet-rotalar.png`
4. `tablet-screenshots/10-inch/04-tablet-oduller.png`

Gorselleri yeniden uretmek icin:

```powershell
& "C:\Users\cemal\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" tools\make_play_store_graphics.py
```
