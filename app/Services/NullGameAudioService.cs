namespace SonsuzUcus.Services;

public sealed class NullGameAudioService : IGameAudioService
{
    public void PlayEffect(string kind, double volume = 1)
    {
    }

    public void StartLoop(string kind, double volume = 1)
    {
    }

    public void StopLoop(string kind)
    {
    }

    public void StopAll()
    {
    }

    public void Suspend()
    {
    }

    public void Resume()
    {
    }
}

