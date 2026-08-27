using Pilotos.Common.Contracts;
using Pilotos.WinFormsClient.Services;

namespace Pilotos.WinFormsClient.Forms;

public class ProjetosForm : UserControl
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
    private readonly ComboBox _cboCliente = new() { Width = 250, DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly TextBox _txtProjeto = new() { Width = 250 };
    private readonly TextBox _txtDescricao = new() { Width = 250 };
    private readonly TextBox _txtDimensao = new() { Width = 140 };
    private readonly NumericUpDown _numValor = new()
    {
        Width = 140, DecimalPlaces = 2, Maximum = 1_000_000_000, ThousandsSeparator = true,
    };

    public ProjetosForm(ApiClient api)
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
            Dock = DockStyle.Top, Height = 220, ColumnCount = 2, Padding = new Padding(10),
        };
        painel.Controls.Add(Rotulado("Id", _txtId));
        painel.Controls.Add(Rotulado("Cliente", _cboCliente));
        painel.Controls.Add(Rotulado("Projeto", _txtProjeto));
        painel.Controls.Add(Rotulado("Descricao", _txtDescricao));
        painel.Controls.Add(Rotulado("Dimensao", _txtDimensao));
        painel.Controls.Add(Rotulado("Valor", _numValor));

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
            var clientes = await _api.ListarClientesAsync();
            _cboCliente.DataSource = clientes;
            _cboCliente.DisplayMember = nameof(ClienteDto.Nome);
            _cboCliente.ValueMember = nameof(ClienteDto.Id);

            _bs.DataSource = await _api.ListarProjetosAsync();
            LimparCampos();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private void PreencherCampos()
    {
        if (_bs.Current is not ProjetoDto p) return;
        _txtId.Text = p.Id.ToString();
        _cboCliente.SelectedValue = p.IdCliente;
        _txtProjeto.Text = p.Projeto;
        _txtDescricao.Text = p.Descricao ?? "";
        _txtDimensao.Text = p.Dimensao ?? "";
        _numValor.Value = Math.Min(_numValor.Maximum, Math.Max(_numValor.Minimum, p.Valor));
    }

    private void LimparCampos()
    {
        _txtId.Clear(); _txtProjeto.Clear(); _txtDescricao.Clear();
        _txtDimensao.Clear(); _numValor.Value = 0;
        _txtProjeto.Focus();
    }

    private async Task SalvarAsync()
    {
        if (_cboCliente.SelectedValue is not int idCliente)
        {
            MessageBox.Show("Selecione um cliente (cadastre um cliente primeiro).");
            return;
        }
        if (string.IsNullOrWhiteSpace(_txtProjeto.Text))
        {
            MessageBox.Show("O nome do projeto e obrigatorio.");
            return;
        }

        var dto = new ProjetoDto
        {
            Id = int.TryParse(_txtId.Text, out var id) ? id : 0,
            IdCliente = idCliente,
            Projeto = _txtProjeto.Text.Trim(),
            Descricao = NuloSeVazio(_txtDescricao.Text),
            Dimensao = NuloSeVazio(_txtDimensao.Text),
            Valor = _numValor.Value,
        };

        try
        {
            if (dto.Id == 0) await _api.CriarProjetoAsync(dto);
            else await _api.AtualizarProjetoAsync(dto);
            await CarregarAsync();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private async Task ExcluirAsync()
    {
        if (!int.TryParse(_txtId.Text, out var id)) return;
        if (MessageBox.Show($"Excluir o projeto {id}?", "Confirmar", MessageBoxButtons.YesNo) != DialogResult.Yes)
            return;
        try
        {
            await _api.ExcluirProjetoAsync(id);
            await CarregarAsync();
        }
        catch (Exception ex) { Erro(ex); }
    }

    private static string? NuloSeVazio(string s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static void Erro(Exception ex) =>
        MessageBox.Show(ex.Message, "Erro", MessageBoxButtons.OK, MessageBoxIcon.Warning);
}
