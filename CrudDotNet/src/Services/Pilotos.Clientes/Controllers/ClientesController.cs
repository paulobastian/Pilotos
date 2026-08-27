using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pilotos.Clientes.Data;
using Pilotos.Clientes.Models;
using Pilotos.Common.Contracts;

namespace Pilotos.Clientes.Controllers;

[ApiController]
[Authorize]
[Route("api/clientes")]
public class ClientesController(ClientesDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<ClienteDto>> Listar()
        => await db.Clientes.OrderBy(c => c.Nome).Select(c => Map(c)).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> Obter(int id)
    {
        var c = await db.Clientes.FindAsync(id);
        return c is null ? NotFound() : Map(c);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Criar(ClienteDto dto)
    {
        if (await db.Clientes.AnyAsync(c => c.Cpf == dto.Cpf))
            return Conflict(new { mensagem = "Ja existe um cliente com esse CPF." });

        var c = new Cliente
        {
            Nome = dto.Nome,
            Cpf = dto.Cpf,
            Telefone = dto.Telefone,
            Endereco = dto.Endereco,
        };
        db.Clientes.Add(c);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Obter), new { id = c.Id }, Map(c));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Atualizar(int id, ClienteDto dto)
    {
        var c = await db.Clientes.FindAsync(id);
        if (c is null) return NotFound();

        c.Nome = dto.Nome;
        c.Cpf = dto.Cpf;
        c.Telefone = dto.Telefone;
        c.Endereco = dto.Endereco;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Excluir(int id)
    {
        var c = await db.Clientes.FindAsync(id);
        if (c is null) return NotFound();
        db.Clientes.Remove(c);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ClienteDto Map(Cliente c) => new()
    {
        Id = c.Id,
        Nome = c.Nome,
        Cpf = c.Cpf,
        Telefone = c.Telefone,
        Endereco = c.Endereco,
    };
}
