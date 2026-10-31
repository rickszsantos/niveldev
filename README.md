# NívelDev

Plataforma de cursos de programação. Frontend em HTML/CSS/JS puro, API em Node.js + Express e banco PostgreSQL. A própria API serve o frontend, então é um único serviço web + o banco.

## Rodando com Docker (recomendado)

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) com o plugin Compose.

```bash
cp .env.example .env        # depois edite o .env: troque JWT_SECRET e DB_PASSWORD
docker compose up -d --build
```

Abra **http://localhost:5050** — o cadastro e o login já funcionam.

Comandos úteis:

| O que fazer | Comando |
|---|---|
| Ver logs da API | `docker compose logs -f app` |
| Parar tudo (mantém os dados) | `docker compose down` |
| Parar e **apagar** o banco | `docker compose down -v` |
| Reconstruir após mudar o código | `docker compose up -d --build` |
| Ver os usuários cadastrados | `docker compose exec db psql -U niveldev -d niveldev -c "SELECT id, nome, email, criado_em FROM users;"` |

> **Atenção:** o PostgreSQL só lê `DB_USER` / `DB_PASSWORD` / `DB_NAME` na **primeira** vez que cria o volume. Se trocar a senha no `.env` depois, o banco antigo continua com a senha velha. Em desenvolvimento, resolva com `docker compose down -v` (apaga os dados); em produção, altere a senha dentro do banco com `ALTER USER`.

## Desenvolvendo sem Docker para a API (com `npm run dev`)

Sobe só o banco no Docker e roda o Node direto na sua máquina (recarrega ao salvar):

```bash
docker compose up -d db
cd backend
cp .env.example .env        # DB_USER / DB_PASSWORD / DB_NAME devem ser iguais aos do .env da raiz
npm install
npm run dev                 # http://localhost:5050
```

## API

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/auth/register` | `{ nome, email, password }` | `201` `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `200` `{ token, user }` |
| GET | `/auth/me` | — (header `Authorization: Bearer <token>`) | `200` `{ user }` |
| GET | `/auth/home` | — (com token) | rota protegida de exemplo |
| GET | `/health` | — | `200` se a API e o banco estão no ar |

Erros vêm sempre como `{ "error": "mensagem" }`: `400` dados inválidos, `401` credenciais/token inválidos, `409` e-mail já cadastrado, `429` muitas tentativas.

Regras: nome de 2 a 120 caracteres, e-mail válido e único (sem diferenciar maiúsculas), senha de 8 a 72 caracteres. Senhas são guardadas com bcrypt; o token JWT vale 1 hora.

Para proteger uma rota nova, basta usar o middleware: `router.get('/algo', minddware, controller.algo)` — o id do usuário fica em `req.user.id`.

## Estrutura

```
Dockerfile, docker-compose.yml, .env.example     # contêiner
backend/
  database/schema.sql                            # tabelas (criadas automaticamente ao iniciar)
  src/
    server.js, app.js
    modules/
      auth/        (routes → controllers → services)
      users/       (repositories: único lugar com SQL de usuários)
    shared/
      database/    (pool de conexões + criação do schema)
      minddware/   (verificação do token + tratador de erros)
      errors/
frontend/
  index.html, login.html, cadastro.html
  js/ (script.js = home, auth.js = sessão e formulários)   css/ (style.css, auth.css)
```

## Antes de ir para produção

- Use HTTPS (o login envia a senha). Atrás de nginx/Traefik/Cloudflare, defina `TRUST_PROXY=1` no serviço `app` para o limite de tentativas enxergar o IP real.
- O token fica no `localStorage` do navegador. É simples, mas qualquer falha de XSS no site conseguiria lê-lo; uma evolução comum é trocar por cookie `HttpOnly`.
- Ainda não existem: recuperação de senha, confirmação de e-mail e logout que invalida o token no servidor (o "Sair" só apaga o token do navegador).
