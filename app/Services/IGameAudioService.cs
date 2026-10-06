namespace SonsuzUcus.Services;

public interface IGameAudioService
{
    void PlayEffect(string kind, double volume = 1);
    void StartLoop(string kind, double volume = 1);
    void StopLoop(string kind);
    void StopAll();
    void Suspend();
    void Resume();
}

