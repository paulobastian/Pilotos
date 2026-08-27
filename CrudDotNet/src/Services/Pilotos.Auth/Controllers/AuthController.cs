using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pilotos.Auth.Data;
using Pilotos.Auth.Services;
using Pilotos.Common.Contracts;

namespace Pilotos.Auth.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest req)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Login == req.Login && u.Ativo);
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            return Unauthorized(new { mensagem = "Login ou senha invalidos." });

        var (token, expiraEm) = tokens.GerarToken(usuario);
        return new LoginResponse(token, expiraEm, usuario.Nome, usuario.Login);
    }

    [Authorize]
    [HttpPost("registrar")]
    public async Task<ActionResult> Registrar(RegistrarUsuarioRequest req)
    {
        if (await db.Usuarios.AnyAsync(u => u.Login == req.Login))
            return Conflict(new { mensagem = "Ja existe um usuario com esse login." });

        db.Usuarios.Add(new Usuario
        {
            Login = req.Login,
            Nome = req.Nome,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.Senha),
            Ativo = true,
        });
        await db.SaveChangesAsync();
        return Ok(new { mensagem = "Usuario criado." });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult Me() => Ok(new
    {
        id = User.Identity?.Name,
        claims = User.Claims.Select(c => new { c.Type, c.Value }),
    });
}
