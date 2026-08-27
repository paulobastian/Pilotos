using Microsoft.EntityFrameworkCore;
using Pilotos.Projetos.Models;

namespace Pilotos.Projetos.Data;

public class ProjetosDbContext(DbContextOptions<ProjetosDbContext> options) : DbContext(options)
{
    public DbSet<Projeto> Projetos => Set<Projeto>();
}
