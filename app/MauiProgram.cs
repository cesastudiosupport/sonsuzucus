using Microsoft.Extensions.Logging;
using SonsuzUcus.Services;

namespace SonsuzUcus;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        // MAUI Preferences (ses, oyuncu adı gibi ayarlar)
        builder.Services.AddSingleton<IPreferences>(Preferences.Default);
        builder.Services.AddSingleton<MainPage>();
#if ANDROID
        builder.Services.AddSingleton<IAdService, Platforms.Android.AdMobService>();
        builder.Services.AddSingleton<IGameAudioService, Platforms.Android.GameAudioService>();
#else
        builder.Services.AddSingleton<IAdService, NullAdService>();
        builder.Services.AddSingleton<IGameAudioService, NullGameAudioService>();
#endif

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}

