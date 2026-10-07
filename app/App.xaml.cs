namespace SonsuzUcus;

public partial class App : Application
{
    private readonly MainPage mainPage;

    public App(MainPage mainPage)
    {
        this.mainPage = mainPage;
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        var window = new Window(mainPage);
#if IOS
        window.Deactivated += (_, _) => mainPage.PauseGameAudio();
        window.Stopped += (_, _) => mainPage.PauseGameAudio();
        window.Activated += (_, _) => mainPage.ResumeGameAudio();
#endif
        return window;
    }
}

