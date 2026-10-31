-- ============================================================
-- NívelDev — schema do banco (PostgreSQL)
-- É idempotente: roda a cada start do servidor sem recriar nada.
-- Para evoluir o schema depois (novas colunas/tabelas), adicione
-- comandos "ALTER TABLE ... IF NOT EXISTS" ou migre para uma
-- ferramenta de migrations (node-pg-migrate, Prisma, Knex...).
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL       PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- E-mail único sem diferenciar maiúsculas/minúsculas
-- (Joao@x.com e joao@x.com são a mesma conta).
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unico
    ON users (LOWER(email));
