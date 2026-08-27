using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pilotos.Auth.Data;

[Table("usuarios")]
public class Usuario
{
    [Column("id")]
    public int Id { get; set; }

    [Column("login")]
    public string Login { get; set; } = "";

    [Column("senha_hash")]
    public string SenhaHash { get; set; } = "";

    [Column("nome")]
    public string Nome { get; set; } = "";

    [Column("ativo")]
    public bool Ativo { get; set; } = true;

    [Column("criado_em")]
    public DateTime CriadoEm { get; set; }
}
