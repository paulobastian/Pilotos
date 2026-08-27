using Pilotos.Common.Contracts;
using Pilotos.WinFormsClient.Services;

namespace Pilotos.WinFormsClient.Forms;

public class ClientesForm : UserControl
{
    private readonly ApiClient _api;
    private readonly BindingSource _bs = new();

    private readonly DataGridView _grid = new()
    {
        Dock = DockStyle.Fill,
        ReadOnly = true,
        AllowUserToAddRows = false,
        SelectionMode = DataGridViewSelectionMode.FullRowSelect,
        MultiSelect = false,
        AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
    };

    private readonly TextBox _txtId = new() { ReadOnly = true, Width = 60 };
    private readonly TextBox _txtNome = new() { Width = 250 };
    private readonly TextBox _txtCpf = new() { Width = 140 };
    private readonly TextBox _txtTelefone = new() { Width = 140 };
    private readonly TextBox _txtEndereco = new() { Width = 250 };

    public ClientesForm(ApiClient api)
    {
        _api = api;
        BuildLayout();
        _grid.DataSource = _bs;
        _grid.SelectionChanged += (_, _) => PreencherCampos();
        Load += async (_, _) => await CarregarAsync();
    }

    private void BuildLayout()
    {
        var painel = new TableLayoutPanel
        {
            Dock = DockStyle.Top, Height = 190, ColumnCount = 2, Padding = new Padding(10),
        };
        painel.Controls.Add(Rotulado("Id", _txtId));
        painel.Controls.Add(Rotulado("Nome", _txtNome));
        painel.Controls.Add(Rotulado("CPF", _txtCpf));
        painel.Controls.Add(Rotulado("Telefone", _txtTelefone));
        painel.Controls.Add(Rotulado("Endereco", _txtEndereco));

        var botoes = new FlowLayoutPanel { Dock = DockStyle.Top, Height = 44, Padding = new Padding(8, 6, 0, 0) };
        botoes.Controls.Add(Botao("Novo", (_, _) => LimparCampos()));
        botoes.Controls.Add(Botao("Salvar", async (_, _) => await SalvarAsync()));
        botoes.Controls.Add(Botao("Excluir", async (_, _) => await ExcluirAsync()));
        botoes.Controls.Add(Botao("Atualizar lista", async (_, _) => await CarregarAsync()));

        Controls.Add(_grid);
        Controls.Add(botoes);
        Controls.Add(painel);
    }

    private static Control Rotulado(string texto, Control campo)
    {
        var fl = new FlowLayoutPanel { AutoSize = true, Margin = new Padding(6) };
        fl.Controls.Add(new Label { Text = texto, Width = 70, TextAlign = ContentAlignment.MiddleLeft });
        fl.Controls.Add(campo);
        return fl;
    }

    private static Button Botao(string texto, EventHandler onClick)
    {
        var b = new Button { Text = texto, AutoSize = true, Margin = new Padding(4) };
        b.Click += onClick;
        return b;
    }

    private async Task CarregarAsync()
    {
        try
        {
            _bs.DataSource = await _api.ListarClientesAsync();
            LimparCampos();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private void PreencherCampos()
    {
        if (_bs.Current is not ClienteDto c) return;
        _txtId.Text = c.Id.ToString();
        _txtNome.Text = c.Nome;
        _txtCpf.Text = c.Cpf;
        _txtTelefone.Text = c.Telefone ?? "";
        _txtEndereco.Text = c.Endereco ?? "";
    }

    private void LimparCampos()
    {
        _txtId.Clear(); _txtNome.Clear(); _txtCpf.Clear();
        _txtTelefone.Clear(); _txtEndereco.Clear();
        _txtNome.Focus();
    }

    private async Task SalvarAsync()
    {
        if (string.IsNullOrWhiteSpace(_txtNome.Text) || string.IsNullOrWhiteSpace(_txtCpf.Text))
        {
            MessageBox.Show("Nome e CPF sao obrigatorios.");
            return;
        }

        var dto = new ClienteDto
        {
            Id = int.TryParse(_txtId.Text, out var id) ? id : 0,
            Nome = _txtNome.Text.Trim(),
            Cpf = _txtCpf.Text.Trim(),
            Telefone = NuloSeVazio(_txtTelefone.Text),
            Endereco = NuloSeVazio(_txtEndereco.Text),
        };

        try
        {
            if (dto.Id == 0) await _api.CriarClienteAsync(dto);
            else await _api.AtualizarClienteAsync(dto);
            await CarregarAsync();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private async Task ExcluirAsync()
    {
        if (!int.TryParse(_txtId.Text, out var id)) return;
        if (MessageBox.Show($"Excluir o cliente {id}?", "Confirmar", MessageBoxButtons.YesNo) != DialogResult.Yes)
            return;
        try
        {
            await _api.ExcluirClienteAsync(id);
            await CarregarAsync();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private static string? NuloSeVazio(string s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static void Erro(Exception ex) =>
        MessageBox.Show(ex.Message, "Erro", MessageBoxButtons.OK, MessageBoxIcon.Warning);
}
