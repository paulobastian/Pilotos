using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pilotos.Clientes.Models;

[Table("clientes")]
public class Cliente
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    [Required, MaxLength(200)]
    public string Nome { get; set; } = "";

    [Column("cpf")]
    [Required, MaxLength(14)]
    public string Cpf { get; set; } = "";

    [Column("telefone")]
    [MaxLength(20)]
    public string? Telefone { get; set; }

    [Column("endereco")]
    [MaxLength(300)]
    public string? Endereco { get; set; }
}
