using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Pilotos.Common.Contracts;

namespace Pilotos.WinFormsClient.Services;

/// <summary>
/// Cliente HTTP unico para todos os microservicos, acessados atraves do API Gateway.
/// </summary>
public class ApiClient
{
    private readonly HttpClient _http;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public string? Token { get; private set; }
    public string? UsuarioNome { get; private set; }

    public ApiClient(string baseUrl)
    {
        _http = new HttpClient { BaseAddress = new Uri(baseUrl) };
    }

    // ---------------- Autenticacao ----------------
    public async Task LoginAsync(string login, string senha)
    {
        var resp = await _http.PostAsJsonAsync("/api/auth/login", new LoginRequest(login, senha), Json);
        await EnsureSuccess(resp);
        var dados = await resp.Content.ReadFromJsonAsync<LoginResponse>(Json)
                    ?? throw new InvalidOperationException("Resposta de login invalida.");
        Token = dados.Token;
        UsuarioNome = dados.Nome;
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
    }

    // ---------------- Clientes ----------------
    public async Task<List<ClienteDto>> ListarClientesAsync()
        => await _http.GetFromJsonAsync<List<ClienteDto>>("/api/clientes", Json) ?? new();

    public async Task<ClienteDto> CriarClienteAsync(ClienteDto c)
    {
        var resp = await _http.PostAsJsonAsync("/api/clientes", c, Json);
        await EnsureSuccess(resp);
        return (await resp.Content.ReadFromJsonAsync<ClienteDto>(Json))!;
    }

    public async Task AtualizarClienteAsync(ClienteDto c)
    {
        var resp = await _http.PutAsJsonAsync($"/api/clientes/{c.Id}", c, Json);
        await EnsureSuccess(resp);
    }

    public async Task ExcluirClienteAsync(int id)
    {
        var resp = await _http.DeleteAsync($"/api/clientes/{id}");
        await EnsureSuccess(resp);
    }

    // ---------------- Projetos ----------------
    public async Task<List<ProjetoDto>> ListarProjetosAsync()
        => await _http.GetFromJsonAsync<List<ProjetoDto>>("/api/projetos", Json) ?? new();

    public async Task<ProjetoDto> CriarProjetoAsync(ProjetoDto p)
    {
        var resp = await _http.PostAsJsonAsync("/api/projetos", p, Json);
        await EnsureSuccess(resp);
        return (await resp.Content.ReadFromJsonAsync<ProjetoDto>(Json))!;
    }

    public async Task AtualizarProjetoAsync(ProjetoDto p)
    {
        var resp = await _http.PutAsJsonAsync($"/api/projetos/{p.Id}", p, Json);
        await EnsureSuccess(resp);
    }

    public async Task ExcluirProjetoAsync(int id)
    {
        var resp = await _http.DeleteAsync($"/api/projetos/{id}");
        await EnsureSuccess(resp);
    }

    // ---------------- Util ----------------
    private static async Task EnsureSuccess(HttpResponseMessage resp)
    {
        if (resp.IsSuccessStatusCode) return;

        var corpo = await resp.Content.ReadAsStringAsync();
        string mensagem = resp.StatusCode switch
        {
            HttpStatusCode.Unauthorized => "Nao autorizado. Faca login novamente.",
            _ => $"Erro {(int)resp.StatusCode}",
        };

        try
        {
            using var doc = JsonDocument.Parse(corpo);
            if (doc.RootElement.TryGetProperty("mensagem", out var m))
                mensagem = m.GetString() ?? mensagem;
        }
        catch { /* corpo nao e JSON */ }

        throw new ApiException(mensagem);
    }
}

public class ApiException(string mensagem) : Exception(mensagem);
