-- ============================================================
-- Banco de dados do projeto Pilotos
-- Criado automaticamente pelo container postgres na primeira execucao
-- ============================================================

-- ---------- Controle de acesso (login e senha) ----------
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    login       VARCHAR(100)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)  NOT NULL,
    nome        VARCHAR(200)  NOT NULL DEFAULT '',
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------- Cadastro de clientes ----------
CREATE TABLE IF NOT EXISTS clientes (
    id        SERIAL PRIMARY KEY,
    nome      VARCHAR(200) NOT NULL,
    cpf       VARCHAR(14)  NOT NULL UNIQUE,
    telefone  VARCHAR(20),
    endereco  VARCHAR(300)
);

-- ---------- Cadastro de projetos ----------
CREATE TABLE IF NOT EXISTS projetos (
    id          SERIAL PRIMARY KEY,
    id_cliente  INTEGER      NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    projeto     VARCHAR(200) NOT NULL,
    descricao   TEXT,
    dimensao    VARCHAR(100),
    valor       NUMERIC(14,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_projetos_id_cliente ON projetos (id_cliente);

-- O usuario administrador padrao (admin / admin123) e criado/garantido
-- pelo auth-service durante o startup (hash BCrypt gerado em codigo).
