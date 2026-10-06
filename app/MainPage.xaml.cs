namespace SonsuzUcus;

public partial class MainPage : ContentPage
{
    private const string AdsScheme = "ucusads";
    private const string AudioScheme = "ucusaudio";
    private const string AudioLogTag = "SonsuzAudio";
    public static MainPage? Current { get; private set; }
    private readonly Services.IAdService ads;
    private readonly Services.IGameAudioService gameAudio;

    public MainPage(Services.IAdService ads, Services.IGameAudioService gameAudio)
    {
        this.ads = ads;
        this.gameAudio = gameAudio;
        Current = this;
        InitializeComponent();
        ConfigureNativeAudioBridge();
        GameWebView.Navigating += OnGameWebViewNavigating;
        ads.Initialize();
        LoadGame();
    }

    public void PauseGameAudio()
    {
        gameAudio.Suspend();
        _ = GameWebView.EvaluateJavaScriptAsync("window.ucusAppPause && window.ucusAppPause();");
    }

    public void ResumeGameAudio()
    {
        gameAudio.Resume();
        _ = GameWebView.EvaluateJavaScriptAsync("window.ucusAppResume && window.ucusAppResume();");
    }

    private void LoadGame()
    {
        var assembly = typeof(MainPage).Assembly;
        var css = ReadEmbeddedText(assembly, "SonsuzUcus.game.css");
        var js = ReadEmbeddedText(assembly, "SonsuzUcus.flight-director.js") + "\n" + ReadEmbeddedText(assembly, "SonsuzUcus.game.js");
        var assetScript = BuildAssetScript(assembly);

        GameWebView.Source = new HtmlWebViewSource
        {
            Html = $$"""
                   <!DOCTYPE html>
                   <html lang="tr">
                   <head>
                       <meta charset="utf-8">
                       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
                       <style>
                           html, body { margin:0; padding:0; height:100%; background:#05060a; overflow:hidden; }
                           {{css}}
                       </style>
                   </head>
                   <body>
                       <div id="stage">
                           <canvas id="cv"></canvas>
                           <div id="flightIntro" role="status" aria-label="Sonsuz Uçuş açılıyor">
                               <div class="intro-identity">
                                   <img id="introShip" alt="" width="180" height="140">
                                   <h1>SONSUZ UÇUŞ</h1>
                                   <span>CESA STUDIO</span>
                               </div>
                           </div>

                           <div class="hud">
                               <div class="hud-main">
                                   <span>MESAFE</span>
                                   <b><i id="dist">0</i><small>m</small></b>
                               </div>
                               <div class="hud-mid">
                                   <span>SKOR</span>
                                   <b id="score">0</b>
                               </div>
                               <div class="hud-side">
                                   <span>REKOR <b id="best">0</b></span>
                                   <span>KRİSTAL <b id="coinhud">0</b></span>
                               </div>
                           </div>

                           <div class="combo-pill" id="combohud">SERİ HAZIR</div>
                           <div class="fuel-pill">
                               <span>YAKIT <b id="fuelText">100%</b></span>
                               <i><b id="fuelFill"></b></i>
                           </div>
                           <div class="health-pill">
                               <span>GÖVDE <b id="hpText">3/3</b></span>
                               <i><b id="hpFill"></b></i>
                           </div>

                           <div class="stage-progress" id="stageProgress">
                               <span id="stageProgressLabel">Bölüm 1-1</span>
                               <i><b id="stageProgressFill"></b></i>
                           </div>

                           <div class="mission-strip">
                               <div>
                                   <span id="biome">Buz Mağarası</span>
                                   <b id="missionText">Görev hazırlanıyor</b>
                               </div>
                               <i><b id="missionFill"></b></i>
                           </div>

                           <button class="snd" id="snd" aria-label="Ses">🔊</button>
                           <button class="boost-btn" id="boostBtn" aria-label="Overdrive">
                               <span>OVERDRIVE</span>
                               <b id="boostText">0%</b>
                           </button>

                           <div class="banner" id="banner"></div>
                           <div class="flash" id="flash"></div>

                           <div class="overlay show" id="menu">
                               <section class="menu-hero">
                                   <div class="menu-kicker">ARCADE KEŞİF KOŞUSU</div>
                                   <h1>SONSUZ UÇUŞ</h1>
                                   <div class="launch-visual" aria-hidden="true">
                                       <span class="launch-aura"></span>
                                       <span class="launch-streaks"></span>
                                       <span class="launch-plume"></span>
                                       <img class="ship-preview-img" id="shipPreviewImg" alt="">
                                   </div>
                                   <p class="sub">Basılı tut, yüksel. Bırak, süzül.</p>
                                   <div class="menu-stats">
                                       <div><span>EN İYİ</span><b id="menuBest">0</b></div>
                                       <div><span>KOŞU</span><b id="menuRuns">0</b></div>
                                       <div><span>TOPLAM</span><b id="menuMeters">0m</b></div>
                                   </div>
                               </section>

                               <section class="menu-panel">
                                   <div class="wallet">💎 <b id="wallet">0</b></div>
                                   <div class="pilot-card">
                                       <span>PİLOT RÜTBESİ</span>
                                       <b id="pilotRank">Çaylak Pilot</b>
                                       <em id="pilotXp">0 XP</em>
                                       <i><b id="pilotXpFill"></b></i>
                                   </div>
                                   <div class="daily-card">
                                       <div>
                                           <span id="dailyTitle">Günlük Rota</span>
                                           <b id="dailyMeta">Bugünün hedefi hazırlanıyor</b>
                                       </div>
                                       <strong id="dailyProgress">0/0</strong>
                                       <i><b id="dailyFill"></b></i>
                                   </div>
                                   <div class="inventory-card">
                                       <div class="inventory-head"><span>🎒 STOK</span><b>Toplanan materyaller</b></div>
                                       <div class="inventory-grid">
                                           <div><span>💎</span><b id="stockCoins">0</b><small>Kristal</small></div>
                                           <div><span>⛽</span><b id="stockFuel">0</b><small>Yakıt</small></div>
                                           <div><span>🛡</span><b id="stockShield">0</b><small>Kalkan</small></div>
                                           <div><span>🧲</span><b id="stockMagnet">0</b><small>Mıknatıs</small></div>
                                           <div><span>⚡</span><b id="stockBoost">0</b><small>Overdrive</small></div>
                                       </div>
                                   </div>
                                   <div class="briefing">
                                       <span><b>Basılı tut</b> yüksel</span>
                                       <span><b>Bırak</b> süzül</span>
                                       <span><b>Overdrive</b> skor çarpanı</span>
                                   </div>
                                   <div class="menu-actions">
                                       <button class="play-btn" id="playBtn"><span class="nav-icon">▶</span><span>Bölümler</span></button>
                                       <button class="mode-btn" id="endlessOpen"><span class="nav-icon">♾</span><span>Sonsuz Mod</span></button>
                                       <div class="menu-icons">
                                           <button class="icon-btn" id="inventoryOpen"><span class="icon-glyph">🎒</span><small>Envanter</small></button>
                                           <button class="icon-btn" id="guideOpen"><span class="icon-glyph">❔</span><small>Rehber</small></button>
                                           <button class="icon-btn" id="settingsOpen"><span class="icon-glyph">⚙</span><small>Ayarlar</small></button>
                                           <button class="icon-btn" id="privacyOpen"><span class="icon-glyph">🔒</span><small>Gizlilik</small></button>
                                       </div>
                                   </div>
                                   <div class="shop" id="shop">
                                       <div class="shop-title"><span>🚀 Gemi</span><b id="shopShipsMeta">1/5 sende</b></div>
                                       <div class="shop-row" id="ship-row"></div>
                                       <div class="shop-title"><span>✨ İz</span><b id="shopTrailsMeta">1/5 sende</b></div>
                                       <div class="shop-row" id="trail-row"></div>
                                   </div>
                                   <button class="primary-btn inventory-back" id="inventoryBack">Ana menü</button>
                                   <div class="tap-hint">▶ Kalkış için dokun</div>
                               </section>
                           </div>

                           <div class="overlay levels" id="levels">
                               <section class="levels-panel">
                                   <div class="menu-kicker">BÖLÜM SEÇ</div>
                                   <div class="world-nav">
                                       <button class="world-arrow" id="worldPrev" aria-label="Önceki dünya">‹</button>
                                       <div class="world-title">
                                           <b id="worldName">Buz Mağarası</b>
                                           <span id="worldMeta">0 / 45 ★</span>
                                       </div>
                                       <button class="world-arrow" id="worldNext" aria-label="Sonraki dünya">›</button>
                                   </div>
                                   <div class="stage-grid" id="stageGrid"></div>
                                   <button class="primary-btn levels-back" id="levelsBack">Ana menü</button>
                               </section>
                           </div>

                             <div class="overlay levels" id="soundTest">
                               <section class="levels-panel">
                                 <div class="menu-kicker">SES TESTİ · GEÇİCİ</div>
                                 <p class="sub">Dinle, beğendiğinin adını not al.</p>
                                 <div class="st-list" id="soundTestList"></div>
                                 <button class="primary-btn levels-back" id="soundTestBack">Ana menü</button>
                               </section>
                             </div>

                           <div class="overlay guide" id="guide">
                               <section class="guide-panel">
                                   <div class="menu-kicker">KISA REHBER</div>
                                   <h2>Nasıl oynanır?</h2>
                                   <div class="guide-grid">
                                       <div><b>👆 Basılı tut</b><span>Gemi yükselir, yakıt daha hızlı azalır.</span></div>
                                       <div><b>🪂 Bırak</b><span>Gemi süzülür, yakıt daha yavaş harcanır.</span></div>
                                       <div><b>⭕ Kapı</b><span>Ortadan geçersen seri ve skor kazanırsın.</span></div>
                                       <div><b>💎 Kristal</b><span>Para ve seri verir; hangarda kozmetik açar.</span></div>
                                       <div><b>⛽ Yakıt</b><span>Depoyu doldurur. Yakıt biterse yükselme zayıflar.</span></div>
                                       <div><b>⚡ Overdrive</b><span>Doluysa sağ alttan bas; kısa süre skor ve hız artar.</span></div>
                                       <div><b>🛡 Gövde</b><span>3 hasar hakkın var. Kalkan hasarı emer.</span></div>
                                       <div><b>⭐ XP</b><span>Her tur pilot rütbeni kalıcı olarak yükseltir.</span></div>
                                   </div>
                                   <button class="primary-btn" id="guideOk">Anladım</button>
                               </section>
                           </div>

                           <div class="overlay guide" id="settings">
                               <section class="guide-panel settings-panel">
                                   <div class="menu-kicker">TERCİHLER</div>
                                   <h2>Ayarlar</h2>
                                   <div class="settings-list">
                                       <button class="settings-row" id="settingsSound"><span><i>🔊</i>Ses efektleri</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsMusic"><span><i>🎵</i>Arka plan müziği</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsEngine"><span><i>🚀</i>Motor sesi</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsHaptic"><span><i>📳</i>Titreşim</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsEffects"><span><i>✨</i>Görsel efekt</span><b>Zengin</b></button>
                                       <button class="settings-row" id="settingsShake"><span><i>💥</i>Ekran sarsıntısı</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsRoute"><span><i>〰️</i>Rota çizgisi</span><b>Açık</b></button>
                                       <button class="settings-row" id="settingsGuide"><span><i>❔</i>Rehber</span><b>Göster</b></button>
                                       <button class="settings-row" id="soundTestOpen"><span><i>🎧</i>Ses testi</span><b>Geçici</b></button>
                                       <button class="settings-row" id="settingsPrivacy"><span><i>🔒</i>Gizlilik</span><b>Bilgi</b></button>
                                   </div>
                                   <button class="primary-btn" id="settingsOk">Ana menü</button>
                               </section>
                           </div>

                           <div class="overlay guide" id="privacy">
                               <section class="guide-panel">
                                   <div class="menu-kicker">VERİ VE GİZLİLİK</div>
                                   <h2>Gizlilik</h2>
                                   <div class="privacy-copy">
                                       <p>İlerlemen, rekorun, XP'n ve kozmetik seçimlerin yalnızca bu cihazda saklanır. Hesap açman gerekmez, bu bilgiler bir sunucuya gönderilmez.</p>
                                       <p>Oyunda reklam göstermek için Google Mobile Ads kullanılır. Reklam kişiselleştirmesini cihazının reklam ayarlarından yönetebilirsin.</p>
                                       <p>Uygulama verisini silmek istersen cihaz ayarlarından uygulama verilerini temizlemen yeterli; kayıtlı ilerleme de bununla birlikte silinir.</p>
                                   </div>
                                   <button class="primary-btn" id="privacyOk">Anladım</button>
                               </section>
                           </div>

                           <div class="overlay" id="over">
                               <div class="crash" id="overTitle">GÖREV BİTTİ</div>
                               <div class="big" id="final">0<small>m</small></div>
                               <div class="stage-stars" id="stageStars" aria-hidden="true"></div>
                               <div class="grade-badge" id="finalGrade">A</div>
                               <div class="rec" id="rec"></div>
                               <div class="result-grid">
                                   <div><span>Skor</span><b id="finalScore">0</b></div>
                                   <div><span>Kristal</span><b id="finalCoins">0</b></div>
                                   <div><span>En iyi seri</span><b id="finalCombo">0</b></div>
                                   <div><span>XP</span><b id="finalXp">+0</b></div>
                               </div>
                               <div class="result-detail">
                                   <div><span>Kapı</span><b id="finalGates">0</b></div>
                                   <div><span>Yakın geçiş</span><b id="finalNear">0</b></div>
                                   <div><span>Görev</span><b id="finalMissions">0</b></div>
                                   <div><span>İlerleme</span><b id="finalMission">0%</b></div>
                                   <div><span>Yakıt</span><b id="finalFuel">0</b></div>
                                   <div><span>Kalkan</span><b id="finalShield">0</b></div>
                                   <div><span>Mıknatıs</span><b id="finalMagnet">0</b></div>
                                   <div><span>Overdrive</span><b id="finalBoost">0</b></div>
                                   <div><span>Rütbe</span><b id="finalRank">Çaylak Pilot</b></div>
                               </div>
                               <div class="coach-card">
                                   <b id="runDelta">Rekor analizi hazır</b>
                                   <span id="coachText">Bir sonraki koşu için rota analizi hazırlanıyor.</span>
                               </div>
                               <button class="reward-btn" id="rewardAdBtn">Reklam izle · sonraki koşuya kalkan</button>
                               <div class="over-actions">
                                   <button class="retry-btn" id="retryBtn">▶ Tekrar oyna</button>
                                   <button class="menu-btn" id="menu-btn">🛒 Hangar</button>
                               </div>
                               <div class="tap-hint" id="over-hint">Skor ve ödüller kaydedildi</div>
                           </div>
                       </div>

                       <script>
                       {{assetScript}}
                       </script>
                       <script>
                       window.nativeAds = {
                           showBanner: function () { location.href = 'ucusads://show-banner'; },
                           hideBanner: function () { location.href = 'ucusads://hide-banner'; },
                           showInterstitial: function () { location.href = 'ucusads://show-interstitial'; },
                           showRewarded: function () { location.href = 'ucusads://show-rewarded'; }
                       };
                       window.nativeAudio = (function () {
                           var queue = [];
                           var busy = false;
                           function bridge() {
                               return window.ucusAudioBridge || null;
                           }
                           function send(url) {
                               queue.push(url);
                               if (busy) return;
                               busy = true;
                               (function flush() {
                                   var next = queue.shift();
                                   if (!next) { busy = false; return; }
                                   location.href = next;
                                   setTimeout(flush, 6);
                               })();
                           }
                           function enc(value) { return encodeURIComponent(value || ''); }
                           return {
                               sfx: function (kind, volume) {
                                   var b = bridge();
                                   if (b && b.playEffect) {
                                       b.playEffect(String(kind || ''), String(volume == null ? 1 : volume));
                                       return;
                                   }
                                   send('ucusaudio://sfx/' + enc(kind) + '?volume=' + encodeURIComponent(volume == null ? 1 : volume));
                               },
                               loop: function (kind, command, volume) {
                                   var b = bridge();
                                   if (b && b.startLoop && b.stopLoop) {
                                       if (command === 'stop') b.stopLoop(String(kind || ''));
                                       else b.startLoop(String(kind || ''), String(volume == null ? 1 : volume));
                                       return;
                                   }
                                   send('ucusaudio://loop/' + enc(kind) + '?cmd=' + enc(command) + '&volume=' + encodeURIComponent(volume == null ? 1 : volume));
                               },
                               stopAll: function () {
                                   var b = bridge();
                                   if (b && b.stopAll) {
                                       b.stopAll();
                                       return;
                                   }
                                   send('ucusaudio://all/stop');
                               }
                           };
                       })();
                       </script>
                       <script>
                       {{js}}
                       </script>
                   </body>
                   </html>
                   """
        };
    }

    private void ConfigureNativeAudioBridge()
    {
#if ANDROID
        GameWebView.HandlerChanged += (_, _) => AttachNativeAudioBridge();
        AttachNativeAudioBridge();
#endif
    }

#if ANDROID
    private Platforms.Android.GameAudioBridge? gameAudioBridge;

    private void AttachNativeAudioBridge()
    {
        if (GameWebView.Handler?.PlatformView is not global::Android.Webkit.WebView androidWebView)
        {
            return;
        }

        gameAudioBridge ??= new Platforms.Android.GameAudioBridge(gameAudio);
        androidWebView.Settings.JavaScriptEnabled = true;
        androidWebView.RemoveJavascriptInterface("ucusAudioBridge");
        androidWebView.AddJavascriptInterface(gameAudioBridge, "ucusAudioBridge");
        LogAudio("JavaScript audio bridge attached");
    }
#endif

    private void OnGameWebViewNavigating(object? sender, WebNavigatingEventArgs e)
    {
        if (!Uri.TryCreate(e.Url, UriKind.Absolute, out var uri))
        {
            return;
        }

        if (string.Equals(uri.Scheme, AdsScheme, StringComparison.OrdinalIgnoreCase))
        {
            e.Cancel = true;
            switch (uri.Host)
            {
                case "show-banner":
                    ads.ShowBanner();
                    break;
                case "hide-banner":
                    ads.HideBanner();
                    break;
                case "show-interstitial":
                    ads.ShowInterstitial();
                    break;
                case "show-rewarded":
                    ads.ShowRewarded(GrantRewardedShield, NotifyRewardedAdUnavailable);
                    break;
            }
            return;
        }

        if (string.Equals(uri.Scheme, AudioScheme, StringComparison.OrdinalIgnoreCase))
        {
            e.Cancel = true;
            HandleAudioCommand(uri);
        }
    }

    private void HandleAudioCommand(Uri uri)
    {
        LogAudio($"Command uri={uri}");
        var kind = Uri.UnescapeDataString(uri.AbsolutePath.Trim('/'));
        var query = ParseQuery(uri.Query);
        var volume = query.TryGetValue("volume", out var volumeText) &&
            double.TryParse(volumeText, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var parsed)
                ? parsed
                : 1;

        if (string.Equals(uri.Host, "sfx", StringComparison.OrdinalIgnoreCase))
        {
            gameAudio.PlayEffect(kind, volume);
            return;
        }

        if (string.Equals(uri.Host, "loop", StringComparison.OrdinalIgnoreCase))
        {
            var command = query.TryGetValue("cmd", out var cmd) ? cmd : "start";
            if (string.Equals(command, "stop", StringComparison.OrdinalIgnoreCase))
            {
                gameAudio.StopLoop(kind);
            }
            else
            {
                gameAudio.StartLoop(kind, volume);
            }
            return;
        }

        if (string.Equals(uri.Host, "all", StringComparison.OrdinalIgnoreCase))
        {
            gameAudio.StopAll();
        }
    }

    private static void LogAudio(string message)
    {
#if ANDROID
        global::Android.Util.Log.Debug(AudioLogTag, message);
#else
        System.Diagnostics.Debug.WriteLine($"{AudioLogTag}: {message}");
#endif
    }

    private static Dictionary<string, string> ParseQuery(string query)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var part in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pieces = part.Split('=', 2);
            var key = Uri.UnescapeDataString(pieces[0]);
            var value = pieces.Length > 1 ? Uri.UnescapeDataString(pieces[1]) : string.Empty;
            result[key] = value;
        }
        return result;
    }

    private void GrantRewardedShield()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            _ = GameWebView.EvaluateJavaScriptAsync("window.ucusRewardGranted && window.ucusRewardGranted();");
        });
    }

    private void NotifyRewardedAdUnavailable()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            _ = GameWebView.EvaluateJavaScriptAsync("window.ucusRewardUnavailable && window.ucusRewardUnavailable();");
        });
    }

    private static string ReadEmbeddedText(System.Reflection.Assembly assembly, string resourceName)
    {
        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Embedded resource not found: {resourceName}");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    private static string BuildAssetScript(System.Reflection.Assembly assembly)
    {
        var assets = new Dictionary<string, string>
        {
            ["shipIdle"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.ship_idle.png", "image/png"),
            ["shipThrust"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.ship_thrust.png", "image/png"),
            ["shipBoost"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.ship_boost.png", "image/png"),
            ["crystal"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.crystal.png", "image/png"),
            ["fuel"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.fuel.png", "image/png"),
            ["drone"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.drone.png", "image/png"),
            ["gateArc"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.gate_arc.png", "image/png"),
            ["shieldRing"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.shield_ring.png", "image/png"),
            ["boostRing"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.boost_ring.png", "image/png"),
            ["explosion"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.explosion.png", "image/png"),
            ["smokeLarge"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.smoke_large.png", "image/png"),
            ["smokeMedium"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.smoke_medium.png", "image/png"),
            ["smokeSmall"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.smoke_small.png", "image/png"),
            ["parallaxCave"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.parallax_cave.webp", "image/webp"),
            ["parallaxSpace"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.deep-space-v2.png", "image/png"),
            ["parallaxLava"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.asset.volcanic-cavern-v2.png", "image/png"),
#if !ANDROID
            ["audioBoost"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.boost.wav", "audio/wav"),
            ["audioCoin"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.coin.wav", "audio/wav"),
            ["audioEngineIdle"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.engine_idle.wav", "audio/wav"),
            ["audioEngineThrust"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.engine_thrust.wav", "audio/wav"),
            ["audioFuel"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.fuel.wav", "audio/wav"),
            ["audioFuelWarn"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.fuel_warn.wav", "audio/wav"),
            ["audioGroundCrash"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.ground_crash.wav", "audio/wav"),
            ["audioIdleDown"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.idle_down.wav", "audio/wav"),
            ["audioLaunch"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.launch.wav", "audio/wav"),
            ["audioMagnet"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.magnet.wav", "audio/wav"),
            ["audioMusicLoop"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.music_arcade_loop.wav", "audio/wav"),
            ["audioPerfect"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.perfect.wav", "audio/wav"),
            ["audioGatePass"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.gate_pass.wav", "audio/wav"),
            ["audioStageComplete"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.stage_complete.wav", "audio/wav"),
            ["audioShield"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.shield.wav", "audio/wav"),
            ["audioTap"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.tap.wav", "audio/wav"),
            ["audioThrustOn"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.thrust_on.wav", "audio/wav"),
            ["audioWallHit"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.wall_hit.wav", "audio/wav"),
            ["audioWarn"] = ReadEmbeddedDataUri(assembly, "SonsuzUcus.audio.warn.wav", "audio/wav")
#endif
        };

        // GECICI: ses karsilastirma paneli adaylari. Joker EmbeddedResource
        // ile geldikleri icin tek tek yazilmaz, sayarak bulunur.
        // Secim kesinlestiginde bu blok, csproj satiri ve wwwroot/game/audition/ silinir.
        var audition = new Dictionary<string, string>();
        foreach (var res in assembly.GetManifestResourceNames())
        {
            const string prefix = "SonsuzUcus.audition.aud_";
            if (!res.StartsWith(prefix, StringComparison.Ordinal)) continue;
            var key = res.Substring(prefix.Length);
            if (key.EndsWith(".wav", StringComparison.Ordinal))
                key = key.Substring(0, key.Length - 4);
            audition[key] = ReadEmbeddedDataUri(assembly, res, "audio/wav");
        }

        return $"window.UCUS_ASSETS = {System.Text.Json.JsonSerializer.Serialize(assets)};"
             + $"window.UCUS_AUDITION = {System.Text.Json.JsonSerializer.Serialize(audition)};";
    }

    private static string ReadEmbeddedDataUri(System.Reflection.Assembly assembly, string resourceName, string mimeType)
    {
        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Embedded resource not found: {resourceName}");
        using var memory = new MemoryStream();
        stream.CopyTo(memory);
        return $"data:{mimeType};base64,{Convert.ToBase64String(memory.ToArray())}";
    }
}

