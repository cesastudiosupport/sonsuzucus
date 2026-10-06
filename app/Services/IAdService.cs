namespace SonsuzUcus.Services;

public interface IAdService
{
    void Initialize();
    void ShowBanner();
    void HideBanner();
    void LoadInterstitial();
    void ShowInterstitial();
    void LoadRewarded();
    void ShowRewarded(Action onRewardEarned, Action? onUnavailable = null);
}

