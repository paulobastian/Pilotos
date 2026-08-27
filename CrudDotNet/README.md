# Pilotos — CRUD de Clientes e Projetos (microserviços + Docker)

Projeto de exemplo com:

| Camada | Tecnologia |
|--------|-----------|
| Banco de dados | PostgreSQL 16 (Docker) |
| Autenticação (login/senha) | `Pilotos.Auth` — ASP.NET Core + JWT + BCrypt |
| CRUD de clientes | `Pilotos.Clientes` — ASP.NET Core + EF Core |
| CRUD de projetos | `Pilotos.Projetos` — ASP.NET Core + EF Core |
| API Gateway | `Pilotos.Gateway` — YARP (porta única 5000) |
| Aplicativo desktop | `Pilotos.WinFormsClient` — Windows Forms / .NET |

O WinForms **não** roda em container (é uma aplicação de desktop Windows). Ele consome
os microserviços através do gateway.

```
┌──────────────────┐      http://localhost:5000
│  WinForms Client │ ───────────────┐
└──────────────────┘                │
                         ┌──────────▼───────────┐
                         │   Gateway (YARP)     │
                         └───┬───────┬───────┬──┘
                  /api/auth  │       │       │  /api/projetos
                        ┌────▼──┐ ┌──▼─────┐ ┌▼────────┐
                        │ Auth  │ │Clientes│ │Projetos │
                        └────┬──┘ └──┬─────┘ └┬────────┘
                             └───────┴────────┘
                              ┌──────▼───────┐
                              │  PostgreSQL  │
                              └──────────────┘
```

## Estrutura

```
Pilotos.sln
docker-compose.yml
db/init/01-schema.sql          # cria as tabelas: usuarios, clientes, projetos
src/
  Shared/Pilotos.Common/       # DTOs compartilhados
  Services/Pilotos.Auth/
  Services/Pilotos.Clientes/
  Services/Pilotos.Projetos/
  Gateway/Pilotos.Gateway/
client/
  Pilotos.WinFormsClient/
```

## Banco de dados

Criado automaticamente pelo container na primeira execução (`db/init/01-schema.sql`):

- **usuarios** — `id, login, senha_hash, nome, ativo, criado_em` (controle de acesso)
- **clientes** — `id, nome, cpf, telefone, endereco`
- **projetos** — `id, id_cliente (FK), projeto, descricao, dimensao, valor`

Usuário padrão criado pelo `Pilotos.Auth` no startup:

```
login: admin
senha: admin123
```

## Como rodar

### 1. Subir a infraestrutura (banco + microserviços + gateway)

```bash
docker compose up --build
```

Serviços expostos:

| URL | Descrição |
|-----|-----------|
| http://localhost:5000 | Gateway (usado pelo WinForms) |
| http://localhost:5001/swagger | Auth |
| http://localhost:5002/swagger | Clientes |
| http://localhost:5003/swagger | Projetos |
| localhost:5433 | PostgreSQL (`pilotos` / `pilotos123`) |

Teste rápido:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","senha":"admin123"}'
```

### 2. Rodar o aplicativo Windows Forms

Precisa do **.NET 8 SDK** e Windows.

```bash
dotnet run --project client/Pilotos.WinFormsClient
```

Ou abra `Pilotos.sln` no Visual Studio 2022, defina `Pilotos.WinFormsClient`
como projeto de inicialização e pressione F5.

A URL do gateway fica em `client/Pilotos.WinFormsClient/appsettings.json`
(`"ApiGateway": "http://localhost:5000"`).

## Desenvolvimento sem Docker

Suba só o banco:

```bash
docker compose up postgres
```

E rode cada serviço (as `ConnectionStrings` de `appsettings.json` já apontam para `localhost`):

```bash
dotnet run --project src/Services/Pilotos.Auth       # :5001 (ver launchSettings)
dotnet run --project src/Services/Pilotos.Clientes
dotnet run --project src/Services/Pilotos.Projetos
dotnet run --project src/Gateway/Pilotos.Gateway
```

## Observações de arquitetura

- Para simplificar, os três microserviços compartilham **um** banco PostgreSQL
  (a FK `projetos.id_cliente → clientes.id` é garantida pelo banco). Em um cenário
  real de microserviços cada serviço teria seu próprio schema/banco e a integridade
  seria feita por eventos/validação entre serviços.
- O token JWT é emitido pelo `Pilotos.Auth` e validado pelos demais serviços com a
  mesma chave simétrica (variável `Jwt__Key`). Troque essa chave em produção.
- CORS está liberado (`AllowAnyOrigin`) apenas para facilitar os testes.
