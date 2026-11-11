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








CREATE TABLE IF NOT EXISTS exercises (
    id             SERIAL        PRIMARY KEY,
    titulo         VARCHAR(255)  NOT NULL,
    enunciado      TEXT          NOT NULL,
    dificuldade    INTEGER       NOT NULL CHECK (dificuldade BETWEEN 1 AND 10),
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_por     INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    criado_em      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_cases (
    id              SERIAL       PRIMARY KEY,
    exercicio_id    INTEGER      NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    ordem           INTEGER      NOT NULL,
    entrada         TEXT         NOT NULL DEFAULT '',
    saida_esperada  TEXT         NOT NULL,
    oculto          BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS test_cases_exercicio_idx ON test_cases (exercicio_id, ordem);

CREATE TABLE IF NOT EXISTS submissions (
    id                   BIGSERIAL    PRIMARY KEY,
    usuario_id           INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    exercicio_id         INTEGER      NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    linguagem            VARCHAR(20)  NOT NULL,
    codigo               TEXT         NOT NULL,
    status  VARCHAR(30)  NOT NULL DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'ACEITO', 'RESPOSTA_INCORRETA', 'ERRO_DE_EXECUCAO',
                          'TEMPO_EXCEDIDO', 'MEMORIA_EXCEDIDA', 'ERRO_INTERNO')),
    tempo_ms             INTEGER,
    memoria_kb           INTEGER,
    mensagem             TEXT,
    teste_falhou_indice  INTEGER,
    criado_em            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);



CREATE INDEX IF NOT EXISTS submissions_usuario_exercicio_idx
    ON submissions (usuario_id, exercicio_id, criado_em DESC);




