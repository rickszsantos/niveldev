# syntax=docker/dockerfile:1

# ---------- Estágio 1: instala só as dependências de produção ----------
FROM node:22-alpine AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# ---------- Estágio 2: imagem final (enxuta) ----------
# O backend serve o frontend (../../frontend), por isso as duas pastas vão na imagem
# e o contexto de build é a RAIZ do projeto (não a pasta backend).
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app/backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY backend/database ./database
COPY frontend /app/frontend

# Não roda como root dentro do contêiner
USER node

EXPOSE 5050

# "healthy" só quando o servidor responde E consegue falar com o banco (/health faz SELECT 1)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5050)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
