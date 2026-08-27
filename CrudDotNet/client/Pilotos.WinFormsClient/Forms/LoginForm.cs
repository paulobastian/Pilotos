using Pilotos.WinFormsClient.Services;

namespace Pilotos.WinFormsClient.Forms;

public class LoginForm : Form
{
    private readonly ApiClient _api;
    private readonly TextBox _txtLogin = new() { Text = "admin" };
    private readonly TextBox _txtSenha = new() { UseSystemPasswordChar = true, Text = "admin123" };
    private readonly Button _btnEntrar = new() { Text = "Entrar", DialogResult = DialogResult.None };
    private readonly Label _lblStatus = new() { ForeColor = Color.Firebrick, AutoSize = true };

    public LoginForm(ApiClient api)
    {
        _api = api;

        Text = "Pilotos - Login";
        FormBorderStyle = FormBorderStyle.FixedDialog;
        StartPosition = FormStartPosition.CenterScreen;
        MaximizeBox = false;
        MinimizeBox = false;
        ClientSize = new Size(320, 200);
        AcceptButton = _btnEntrar;

        var lblLogin = new Label { Text = "Login", Left = 20, Top = 20, Width = 80 };
        _txtLogin.SetBounds(110, 17, 180, 23);
        var lblSenha = new Label { Text = "Senha", Left = 20, Top = 55, Width = 80 };
        _txtSenha.SetBounds(110, 52, 180, 23);
        _btnEntrar.SetBounds(110, 95, 180, 32);
        _lblStatus.SetBounds(20, 140, 280, 40);

        _btnEntrar.Click += async (_, _) => await EntrarAsync();

        Controls.AddRange(new Control[] { lblLogin, _txtLogin, lblSenha, _txtSenha, _btnEntrar, _lblStatus });
    }

    private async Task EntrarAsync()
    {
        _btnEntrar.Enabled = false;
        _lblStatus.Text = "Autenticando...";
        _lblStatus.ForeColor = Color.Gray;
        try
        {
            await _api.LoginAsync(_txtLogin.Text.Trim(), _txtSenha.Text);
            DialogResult = DialogResult.OK;
            Close();
        }
        catch (Exception ex)
        {
            _lblStatus.ForeColor = Color.Firebrick;
            _lblStatus.Text = ex.Message;
        }
        finally
        {
            _btnEntrar.Enabled = true;
        }
    }
}
