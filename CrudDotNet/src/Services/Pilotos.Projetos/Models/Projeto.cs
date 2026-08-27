using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pilotos.Projetos.Models;

[Table("projetos")]
public class Projeto
{
    [Column("id")]
    public int Id { get; set; }

    [Column("id_cliente")]
    public int IdCliente { get; set; }

    [Column("projeto")]
    [Required, MaxLength(200)]
    public string Nome { get; set; } = "";

    [Column("descricao")]
    public string? Descricao { get; set; }

    [Column("dimensao")]
    [MaxLength(100)]
    public string? Dimensao { get; set; }

    [Column("valor")]
    public decimal Valor { get; set; }
}
