using Microsoft.Extensions.Configuration;
using Pilotos.WinFormsClient.Forms;
using Pilotos.WinFormsClient.Services;

namespace Pilotos.WinFormsClient;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        var config = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        var baseUrl = config["ApiGateway"] ?? "http://localhost:5000";
        var api = new ApiClient(baseUrl);

        using var login = new LoginForm(api);
        if (login.ShowDialog() != DialogResult.OK)
            return;

        Application.Run(new MainForm(api));
    }
}
