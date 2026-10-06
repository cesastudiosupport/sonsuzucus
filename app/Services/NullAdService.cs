namespace SonsuzUcus.Services;

public sealed class NullAdService : IAdService
{
    public void Initialize()
    {
    }

    public void ShowBanner()
    {
    }

    public void HideBanner()
    {
    }

    public void LoadInterstitial()
    {
    }

    public void ShowInterstitial()
    {
    }

    public void LoadRewarded()
    {
    }

    public void ShowRewarded(Action onRewardEarned, Action? onUnavailable = null)
    {
        onUnavailable?.Invoke();
    }
}

