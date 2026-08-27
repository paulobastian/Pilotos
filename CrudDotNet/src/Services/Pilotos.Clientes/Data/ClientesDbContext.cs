using Microsoft.EntityFrameworkCore;
using Pilotos.Clientes.Models;

namespace Pilotos.Clientes.Data;

public class ClientesDbContext(DbContextOptions<ClientesDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Cliente>().HasIndex(c => c.Cpf).IsUnique();
    }
}
