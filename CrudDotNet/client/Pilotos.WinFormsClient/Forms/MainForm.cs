using Pilotos.WinFormsClient.Services;

namespace Pilotos.WinFormsClient.Forms;

public class MainForm : Form
{
    public MainForm(ApiClient api)
    {
        Text = $"Pilotos - Cadastros  ({api.UsuarioNome})";
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(900, 560);

        var tabs = new TabControl { Dock = DockStyle.Fill };

        var abaClientes = new TabPage("Clientes");
        abaClientes.Controls.Add(new ClientesForm(api) { Dock = DockStyle.Fill });

        var abaProjetos = new TabPage("Projetos");
        abaProjetos.Controls.Add(new ProjetosForm(api) { Dock = DockStyle.Fill });

        tabs.TabPages.Add(abaClientes);
        tabs.TabPages.Add(abaProjetos);
        Controls.Add(tabs);
    }
}
