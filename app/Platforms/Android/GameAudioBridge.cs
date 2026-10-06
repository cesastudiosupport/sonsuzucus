using Android.Webkit;
using Java.Interop;
using SonsuzUcus.Services;

namespace SonsuzUcus.Platforms.Android;

public sealed class GameAudioBridge : Java.Lang.Object
{
    private readonly IGameAudioService audio;

    public GameAudioBridge(IGameAudioService audio)
    {
        this.audio = audio;
    }

    [JavascriptInterface]
    [Export("playEffect")]
    public void PlayEffect(string kind, string volume)
    {
        audio.PlayEffect(kind, ParseVolume(volume));
    }

    [JavascriptInterface]
    [Export("startLoop")]
    public void StartLoop(string kind, string volume)
    {
        audio.StartLoop(kind, ParseVolume(volume));
    }

    [JavascriptInterface]
    [Export("stopLoop")]
    public void StopLoop(string kind)
    {
        audio.StopLoop(kind);
    }

    [JavascriptInterface]
    [Export("stopAll")]
    public void StopAll()
    {
        audio.StopAll();
    }

    private static double ParseVolume(string volume)
    {
        return double.TryParse(
            volume,
            System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture,
            out var parsed)
            ? parsed
            : 1;
    }

    private int sharing;

    [JavascriptInterface]
    [Export("shareCard")]
    public void ShareCard(string dataUrl)
    {
        const string prefix = "data:image/png;base64,";
        if (dataUrl is null || dataUrl.Length > 4000000 || !dataUrl.StartsWith(prefix, StringComparison.Ordinal)) return;
        if (System.Threading.Interlocked.Exchange(ref sharing, 1) != 0) return;
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(async () =>
        {
            try
            {
                var bytes = Convert.FromBase64String(dataUrl[prefix.Length..]);
                if (bytes.Length < 8 || bytes[0] != 137 || bytes[1] != 80 || bytes[2] != 78 || bytes[3] != 71)
                    throw new InvalidDataException("Invalid challenge image");
                var path = Path.Combine(Microsoft.Maui.Storage.FileSystem.CacheDirectory, "sonsuz-ucus-meydan-okuma.png");
                await File.WriteAllBytesAsync(path, bytes);
                await Microsoft.Maui.ApplicationModel.DataTransfer.Share.Default.RequestAsync(
                    new Microsoft.Maui.ApplicationModel.DataTransfer.ShareFileRequest
                    {
                        Title = "Sonsuz Uçuş",
                        File = new Microsoft.Maui.ApplicationModel.DataTransfer.ShareFile(path, "image/png")
                    });
            }
            catch (Exception ex)
            {
                global::Android.Util.Log.Warn("SonsuzShare", ex.GetType().Name);
                global::Android.Widget.Toast.MakeText(global::Android.App.Application.Context,
                    "Paylaşım açılamadı. Tekrar deneyebilirsin.", global::Android.Widget.ToastLength.Short)?.Show();
            }
            finally { System.Threading.Interlocked.Exchange(ref sharing, 0); }
        });
    }

    [JavascriptInterface]
    [Export("haptic")]
    public void Haptic(string duration)
    {
        if (!int.TryParse(duration, out var milliseconds)) return;
        Microsoft.Maui.ApplicationModel.MainThread.BeginInvokeOnMainThread(() =>
        {
            try
            {
                if (Microsoft.Maui.Devices.Vibration.Default.IsSupported)
                    Microsoft.Maui.Devices.Vibration.Default.Vibrate(TimeSpan.FromMilliseconds(Math.Clamp(milliseconds, 1, 80)));
            }
            catch (Exception ex)
            {
                global::Android.Util.Log.Debug("SonsuzAudio", $"Haptic unavailable: {ex.Message}");
            }
        });
    }
}

