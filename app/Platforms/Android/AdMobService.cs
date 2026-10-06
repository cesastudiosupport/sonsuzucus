using Android.App;
using Android.Views;
using Google.Android.Gms.Ads;
using Google.Android.Gms.Ads.Interstitial;
using Google.Android.Gms.Ads.Rewarded;
using Microsoft.Maui.ApplicationModel;

namespace SonsuzUcus.Platforms.Android;

public sealed class AdMobService : SonsuzUcus.Services.IAdService
{
    private const string BannerAdUnitId = "ca-app-pub-3940256099942544/9214589741";
    private const string InterstitialAdUnitId = "ca-app-pub-3940256099942544/1033173712";
    private const string RewardedAdUnitId = "ca-app-pub-3940256099942544/5224354917";

    private bool initialized;
    private AdView? bannerView;
    private InterstitialAd? interstitialAd;
    private RewardedAd? rewardedAd;
    private bool loadingInterstitial;
    private bool loadingRewarded;

    public void Initialize()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (initialized || CurrentActivity() is not { } activity)
            {
                return;
            }

            MobileAds.Initialize(activity);
            initialized = true;
            LoadInterstitial();
            LoadRewarded();
        });
    }

    public void ShowBanner()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (CurrentActivity() is not { } activity)
            {
                return;
            }

            EnsureBanner(activity);
            bannerView!.Visibility = ViewStates.Visible;
            bannerView.Resume();
        });
    }

    public void HideBanner()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (bannerView is null)
            {
                return;
            }

            bannerView.Pause();
            bannerView.Visibility = ViewStates.Gone;
        });
    }

    public void LoadInterstitial()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (loadingInterstitial || interstitialAd is not null || CurrentActivity() is not { } activity)
            {
                return;
            }

            loadingInterstitial = true;
            InterstitialAd.Load(activity, InterstitialAdUnitId, CreateRequest(), new InterstitialLoadCallback(this));
        });
    }

    public void ShowInterstitial()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (CurrentActivity() is not { } activity || interstitialAd is null)
            {
                LoadInterstitial();
                return;
            }

            var ad = interstitialAd;
            interstitialAd = null;
            ad.FullScreenContentCallback = new ReloadingFullScreenCallback(LoadInterstitial);
            ad.Show(activity);
        });
    }

    public void LoadRewarded()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (loadingRewarded || rewardedAd is not null || CurrentActivity() is not { } activity)
            {
                return;
            }

            loadingRewarded = true;
            RewardedAd.Load(activity, RewardedAdUnitId, CreateRequest(), new RewardedLoadCallback(this));
        });
    }

    public void ShowRewarded(Action onRewardEarned, Action? onUnavailable = null)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            if (CurrentActivity() is not { } activity || rewardedAd is null)
            {
                LoadRewarded();
                onUnavailable?.Invoke();
                return;
            }

            var ad = rewardedAd;
            rewardedAd = null;
            ad.FullScreenContentCallback = new ReloadingFullScreenCallback(LoadRewarded);
            ad.Show(activity, new RewardEarnedListener(onRewardEarned));
        });
    }

    private static Activity? CurrentActivity() => Platform.CurrentActivity;

    private static AdRequest CreateRequest() => new AdRequest.Builder().Build();

    private void EnsureBanner(Activity activity)
    {
        if (bannerView is not null)
        {
            return;
        }

        bannerView = new AdView(activity)
        {
            AdUnitId = BannerAdUnitId,
            AdSize = AdSize.Banner,
            Visibility = ViewStates.Gone
        };

        var density = activity.Resources?.DisplayMetrics?.Density ?? 1f;
        var heightPx = (int)(50 * density);
        var frameLayout = new global::Android.Widget.FrameLayout.LayoutParams(ViewGroup.LayoutParams.MatchParent, heightPx)
        {
            Gravity = GravityFlags.Bottom | GravityFlags.CenterHorizontal
        };

        activity.AddContentView(bannerView, frameLayout);
        bannerView.LoadAd(CreateRequest());
    }

    private sealed class InterstitialLoadCallback(AdMobService owner) : InterstitialAdLoadCallback
    {
        public override void OnAdLoaded(InterstitialAd ad)
        {
            owner.loadingInterstitial = false;
            owner.interstitialAd = ad;
        }

        public override void OnAdFailedToLoad(LoadAdError error)
        {
            owner.loadingInterstitial = false;
            owner.interstitialAd = null;
        }
    }

    private sealed class RewardedLoadCallback(AdMobService owner) : RewardedAdLoadCallback
    {
        public override void OnAdLoaded(RewardedAd ad)
        {
            owner.loadingRewarded = false;
            owner.rewardedAd = ad;
        }

        public override void OnAdFailedToLoad(LoadAdError error)
        {
            owner.loadingRewarded = false;
            owner.rewardedAd = null;
        }
    }

    private sealed class ReloadingFullScreenCallback(Action reload) : FullScreenContentCallback
    {
        public override void OnAdDismissedFullScreenContent()
        {
            reload();
        }

        public override void OnAdFailedToShowFullScreenContent(AdError adError)
        {
            reload();
        }
    }

    private sealed class RewardEarnedListener(Action onRewardEarned) : Java.Lang.Object, IOnUserEarnedRewardListener
    {
        public void OnUserEarnedReward(IRewardItem rewardItem)
        {
            onRewardEarned();
        }
    }
}

