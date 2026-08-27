using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Pilotos.Common.Contracts;
using Pilotos.Projetos.Data;
using Pilotos.Projetos.Models;

namespace Pilotos.Projetos.Controllers;

[ApiController]
[Authorize]
[Route("api/projetos")]
public class ProjetosController(ProjetosDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<ProjetoDto>> Listar([FromQuery] int? idCliente)
    {
        var q = db.Projetos.AsQueryable();
        if (idCliente is not null) q = q.Where(p => p.IdCliente == idCliente);
        return await q.OrderBy(p => p.Nome).Select(p => Map(p)).ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjetoDto>> Obter(int id)
    {
        var p = await db.Projetos.FindAsync(id);
        return p is null ? NotFound() : Map(p);
    }

    [HttpPost]
    public async Task<ActionResult<ProjetoDto>> Criar(ProjetoDto dto)
    {
        var p = new Projeto
        {
            IdCliente = dto.IdCliente,
            Nome = dto.Projeto,
            Descricao = dto.Descricao,
            Dimensao = dto.Dimensao,
            Valor = dto.Valor,
        };
        db.Projetos.Add(p);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23503" })
        {
            return BadRequest(new { mensagem = $"Cliente {dto.IdCliente} nao existe." });
        }
        return CreatedAtAction(nameof(Obter), new { id = p.Id }, Map(p));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Atualizar(int id, ProjetoDto dto)
    {
        var p = await db.Projetos.FindAsync(id);
        if (p is null) return NotFound();

        p.IdCliente = dto.IdCliente;
        p.Nome = dto.Projeto;
        p.Descricao = dto.Descricao;
        p.Dimensao = dto.Dimensao;
        p.Valor = dto.Valor;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23503" })
        {
            return BadRequest(new { mensagem = $"Cliente {dto.IdCliente} nao existe." });
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Excluir(int id)
    {
        var p = await db.Projetos.FindAsync(id);
        if (p is null) return NotFound();
        db.Projetos.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ProjetoDto Map(Projeto p) => new()
    {
        Id = p.Id,
        IdCliente = p.IdCliente,
        Projeto = p.Nome,
        Descricao = p.Descricao,
        Dimensao = p.Dimensao,
        Valor = p.Valor,
    };
}
