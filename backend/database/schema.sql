CREATE TABLE IF NOT EXISTS users (
    id          SERIAL       PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    perfil      VARCHAR(20)  NOT NULL DEFAULT 'aluno'
                CHECK (perfil IN ('administrador', 'professor', 'aluno')),
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unico
    ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS logs (
    id          BIGSERIAL    PRIMARY KEY,
    usuario_id  INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    acao        VARCHAR(80)  NOT NULL,
    detalhes    JSONB,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS logs_usuario_idx ON logs (usuario_id);
CREATE INDEX IF NOT EXISTS logs_criado_em_idx ON logs (criado_em);
