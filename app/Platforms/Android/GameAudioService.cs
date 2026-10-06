using Android.Media;
using Microsoft.Maui.ApplicationModel;

namespace SonsuzUcus.Platforms.Android;

public sealed class GameAudioService : SonsuzUcus.Services.IGameAudioService
{
    private const string Tag = "SonsuzAudio";

    private static readonly IReadOnlyDictionary<string, string> ResourceNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["boost"] = "SonsuzUcus.audio.boost.wav",
        ["coin"] = "SonsuzUcus.audio.coin.wav",
        ["crash"] = "SonsuzUcus.audio.ground_crash.wav",
        ["engine_idle"] = "SonsuzUcus.audio.engine_idle.wav",
        ["engine_thrust"] = "SonsuzUcus.audio.engine_thrust.wav",
        ["fuel"] = "SonsuzUcus.audio.fuel.wav",
        ["fuelWarn"] = "SonsuzUcus.audio.fuel_warn.wav",
        ["groundCrash"] = "SonsuzUcus.audio.ground_crash.wav",
        ["idle"] = "SonsuzUcus.audio.idle_down.wav",
        ["launch"] = "SonsuzUcus.audio.launch.wav",
        ["magnet"] = "SonsuzUcus.audio.magnet.wav",
        ["music"] = "SonsuzUcus.audio.music_arcade_loop.wav",
        ["near"] = "SonsuzUcus.audio.tap.wav",
        ["perfect"] = "SonsuzUcus.audio.perfect.wav",
        ["gatePass"] = "SonsuzUcus.audio.gate_pass.wav",
        ["stageComplete"] = "SonsuzUcus.audio.stage_complete.wav",
        ["shield"] = "SonsuzUcus.audio.shield.wav",
        ["tap"] = "SonsuzUcus.audio.tap.wav",
        ["thrustOn"] = "SonsuzUcus.audio.thrust_on.wav",
        ["wall"] = "SonsuzUcus.audio.wall_hit.wav",
        ["warn"] = "SonsuzUcus.audio.warn.wav"
    };

    private static readonly HashSet<string> LoopKinds = new(StringComparer.OrdinalIgnoreCase)
    {
        "engine_idle",
        "engine_thrust",
        "music"
    };

    private readonly Dictionary<string, string> extractedFiles = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, MediaPlayer> loops = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, int> soundIds = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<int> loadedSoundIds = new();
    private readonly List<int> activeStreams = new();
    private readonly object gate = new();
    private readonly SoundPool soundPool;
    private readonly AudioAttributes loopAttributes = new AudioAttributes.Builder()
        .SetUsage(AudioUsageKind.Game)
        .SetContentType(AudioContentType.Music)
        .Build();
    private readonly AudioAttributes effectAttributes = new AudioAttributes.Builder()
        .SetUsage(AudioUsageKind.Game)
        .SetContentType(AudioContentType.Sonification)
        .Build();
    private volatile bool suspended;

    public GameAudioService()
    {
        soundPool = new SoundPool.Builder()
            .SetMaxStreams(12)
            .SetAudioAttributes(effectAttributes)
            .Build();
        soundPool.SetOnLoadCompleteListener(new LoadCompleteListener(this));
        MainThread.BeginInvokeOnMainThread(PreloadEffects);
    }

    public void PlayEffect(string kind, double volume = 1)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            try
            {
                if (suspended) return;
                if (LoopKinds.Contains(kind))
                {
                    StartLoop(kind, volume);
                    return;
                }

                if (!TrySoundId(kind, out var soundId))
                {
                    global::Android.Util.Log.Warn(Tag, $"Effect not ready: {kind}");
                    return;
                }

                lock (gate)
                {
                    if (!loadedSoundIds.Contains(soundId))
                    {
                        global::Android.Util.Log.Debug(Tag, $"Effect still loading: {kind}");
                        return;
                    }
                }

                var safeVolume = SafeVolume(volume);
                var streamId = soundPool.Play(soundId, safeVolume, safeVolume, 1, 0, 1f);
                if (streamId != 0)
                {
                    lock (gate)
                    {
                        activeStreams.Add(streamId);
                        if (activeStreams.Count > 32) activeStreams.RemoveRange(0, activeStreams.Count - 32);
                    }
                }
                global::Android.Util.Log.Debug(Tag, $"SoundPool Play kind={kind} volume={safeVolume:0.00} stream={streamId}");
            }
            catch (Exception ex)
            {
                global::Android.Util.Log.Error(Tag, $"PlayEffect failed kind={kind}: {ex}");
            }
        });
    }

    public void StartLoop(string kind, double volume = 1)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            try
            {
                if (suspended) return;
                if (!TryFile(kind, out var file))
                {
                    global::Android.Util.Log.Warn(Tag, $"Loop file not found: {kind}");
                    return;
                }

                if (!loops.TryGetValue(kind, out var player))
                {
                    player = new MediaPlayer();
                    player.SetAudioAttributes(loopAttributes);
                    player.SetDataSource(file);
                    player.Looping = true;
                    player.Prepare();
                    loops[kind] = player;
                }

                var safeVolume = SafeVolume(volume);
                player.SetVolume(safeVolume, safeVolume);
                if (!player.IsPlaying && safeVolume > 0.001f) player.Start();
                if (safeVolume <= 0.001f && player.IsPlaying) player.Pause();
            }
            catch (Exception ex)
            {
                global::Android.Util.Log.Error(Tag, $"StartLoop failed kind={kind}: {ex}");
            }
        });
    }

    public void StopLoop(string kind)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            try
            {
                if (!loops.TryGetValue(kind, out var player)) return;
                if (player.IsPlaying) player.Pause();
                player.SeekTo(0);
            }
            catch (Exception ex)
            {
                global::Android.Util.Log.Error(Tag, $"StopLoop failed kind={kind}: {ex}");
            }
        });
    }

    public void StopAll()
    {
        MainThread.BeginInvokeOnMainThread(StopAllNow);
    }

    public void Suspend()
    {
        suspended = true;
        MainThread.BeginInvokeOnMainThread(() =>
        {
            suspended = true;
            StopAllNow();
            soundPool.AutoPause();
            global::Android.Util.Log.Debug(Tag, "Suspended");
        });
    }

    public void Resume()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            suspended = false;
            global::Android.Util.Log.Debug(Tag, "Resumed");
        });
    }

    private void StopAllNow()
    {
        try
        {
            lock (gate)
            {
                foreach (var streamId in activeStreams)
                {
                    soundPool.Stop(streamId);
                }
                activeStreams.Clear();
            }

            foreach (var player in loops.Values)
            {
                if (player.IsPlaying) player.Pause();
                player.SeekTo(0);
            }
        }
        catch (Exception ex)
        {
            global::Android.Util.Log.Error(Tag, $"StopAll failed: {ex}");
        }
    }

    private void PreloadEffects()
    {
        foreach (var kind in ResourceNames.Keys)
        {
            if (!LoopKinds.Contains(kind))
            {
                TrySoundId(kind, out _);
            }
        }
        foreach (var kind in LoopKinds) StartLoop(kind, 0);
    }

    private bool TrySoundId(string kind, out int soundId)
    {
        soundId = 0;
        if (soundIds.TryGetValue(kind, out soundId)) return soundId != 0;
        if (!TryFile(kind, out var file)) return false;

        soundId = soundPool.Load(file, 1);
        if (soundId == 0) return false;
        soundIds[kind] = soundId;
        global::Android.Util.Log.Debug(Tag, $"SoundPool loaded request kind={kind} id={soundId}");
        return true;
    }

    private bool TryFile(string kind, out string file)
    {
        file = string.Empty;
        if (extractedFiles.TryGetValue(kind, out file!)) return true;
        if (!ResourceNames.TryGetValue(kind, out var resourceName))
        {
            global::Android.Util.Log.Warn(Tag, $"Unknown audio kind: {kind}");
            return false;
        }

        var assembly = typeof(GameAudioService).Assembly;
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream is null)
        {
            global::Android.Util.Log.Warn(Tag, $"Embedded resource missing: {resourceName}");
            return false;
        }

        var cacheDir = global::Android.App.Application.Context.CacheDir?.AbsolutePath;
        if (string.IsNullOrWhiteSpace(cacheDir))
        {
            global::Android.Util.Log.Warn(Tag, "Android cache directory is not available.");
            return false;
        }

        // A new master can have the same byte length; cache by content, not size.
        var fingerprint = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(stream))[..16];
        stream.Position = 0;
        file = Path.Combine(cacheDir, fingerprint + "-" + resourceName.Replace("SonsuzUcus.audio.", string.Empty));
        if (!File.Exists(file) || new FileInfo(file).Length != stream.Length)
        {
            using var output = File.Create(file);
            stream.CopyTo(output);
        }

        extractedFiles[kind] = file;
        return true;
    }

    private static float SafeVolume(double volume)
    {
        if (double.IsNaN(volume)) return 1f;
        return (float)Math.Clamp(volume, 0, 1);
    }

    private sealed class LoadCompleteListener : Java.Lang.Object, SoundPool.IOnLoadCompleteListener
    {
        private readonly GameAudioService owner;

        public LoadCompleteListener(GameAudioService owner)
        {
            this.owner = owner;
        }

        public void OnLoadComplete(SoundPool? soundPool, int sampleId, int status)
        {
            if (status != 0)
            {
                global::Android.Util.Log.Warn(Tag, $"SoundPool load failed id={sampleId} status={status}");
                return;
            }

            lock (owner.gate)
            {
                owner.loadedSoundIds.Add(sampleId);
            }
            global::Android.Util.Log.Debug(Tag, $"SoundPool ready id={sampleId}");
        }
    }
}

