namespace Pilotos.Common.Contracts;

// ---------- Autenticacao ----------
public record LoginRequest(string Login, string Senha);

public record LoginResponse(string Token, DateTime ExpiraEm, string Nome, string Login);

public record RegistrarUsuarioRequest(string Login, string Senha, string Nome);

// ---------- Clientes ----------
public class ClienteDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Cpf { get; set; } = "";
    public string? Telefone { get; set; }
    public string? Endereco { get; set; }
}

// ---------- Projetos ----------
public class ProjetoDto
{
    public int Id { get; set; }
    public int IdCliente { get; set; }
    public string Projeto { get; set; } = "";
    public string? Descricao { get; set; }
    public string? Dimensao { get; set; }
    public decimal Valor { get; set; }
}
