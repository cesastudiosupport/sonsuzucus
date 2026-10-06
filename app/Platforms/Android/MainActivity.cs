using Android.App;
using Android.Content.PM;
using Android.OS;

namespace SonsuzUcus;

[Activity(Theme = "@style/Maui.SplashTheme", MainLauncher = true,
    LaunchMode = LaunchMode.SingleTop,
    ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation |
        ConfigChanges.UiMode | ConfigChanges.ScreenLayout |
        ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        var window = Window;
        if (window is null)
        {
            return;
        }

#pragma warning disable CA1422
        window.SetStatusBarColor(Android.Graphics.Color.ParseColor("#080A0F"));
        window.SetNavigationBarColor(Android.Graphics.Color.ParseColor("#080A0F"));

        if (OperatingSystem.IsAndroidVersionAtLeast(30))
        {
            window.SetDecorFitsSystemWindows(true);
        }
#pragma warning restore CA1422
    }

    protected override void OnPause()
    {
        base.OnPause();
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() => MainPage.Current?.PauseGameAudio());
    }

    protected override void OnStop()
    {
        base.OnStop();
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() => MainPage.Current?.PauseGameAudio());
    }

    protected override void OnResume()
    {
        base.OnResume();
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() => MainPage.Current?.ResumeGameAudio());
    }

    protected override void OnDestroy()
    {
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() => MainPage.Current?.PauseGameAudio());
        base.OnDestroy();
    }
}

