---
name: deploy-vps
description: "Deploy para VPS. Use quando: precisar subir alterações, fazer deploy, atualizar VPS, push e build na VPS, publicar mudanças no servidor. Faz git add/commit/push, pull na VPS, rebuild dos containers Docker e testa se tudo está rodando."
argument-hint: "Mensagem de commit (opcional) ou lista de serviços para rebuild"
---

# Deploy para VPS

Skill que automatiza o ciclo completo de deploy: commit → push → pull na VPS → rebuild → teste.

## Informações do Servidor

- **VPS IP**: `66.253.112.233`
- **Usuário SSH**: `root`
- **Diretório no servidor**: `~/tl-em-par`
- **Acesso**: Via SSH com chave (já configurado)
- **Protocolo**: HTTP (sem SSL por enquanto)
- **URL pública**: `http://66.253.112.233`

## Serviços Docker

| Serviço    | Descrição                  | Rebuild necessário quando         |
|------------|----------------------------|------------------------------------|
| `backend`  | API Node.js + Express      | Qualquer alteração em `backend/`   |
| `frontend` | SPA React + Nginx          | Qualquer alteração em `frontend/`  |
| `nginx`    | Reverse proxy              | Alteração em `nginx/`              |
| `db`       | PostgreSQL 16              | Raramente (só config)              |
| `certbot`  | SSL (desativado por ora)   | Quando configurar domínio          |

## Procedimento

### Passo 1 — Identificar arquivos alterados

Execute `git status` para ver o que mudou. Use isso para determinar quais serviços precisam de rebuild.

Regras para determinar serviços:
- Alterações em `backend/` → rebuild `backend`
- Alterações em `frontend/` → rebuild `frontend`
- Alterações em `nginx/` → rebuild `nginx` (ou restart)
- Alterações em `docker-compose.yml` → rebuild dos serviços afetados
- Alterações em `prisma/schema.prisma` → rebuild `backend` + rodar migrations
- Alterações apenas em docs/configs que não afetam build → pular rebuild

### Passo 2 — Git commit e push

```bash
cd "/Users/otaviofida/Desktop/TL em par"
git add -A
git commit -m "<mensagem descritiva>"
git push
```

Se o usuário forneceu uma mensagem de commit, use-a. Senão, gere uma mensagem descritiva baseada nos arquivos alterados.

### Passo 3 — Pull na VPS

```bash
ssh root@66.253.112.233 "cd ~/tl-em-par && git pull 2>&1"
```

### Passo 4 — Rebuild e restart

Rebuildar **apenas** os serviços que tiveram alterações:

```bash
ssh root@66.253.112.233 "cd ~/tl-em-par && docker compose up -d --build <serviços> 2>&1"
```

Exemplos:
- Só backend: `docker compose up -d --build backend`
- Só frontend: `docker compose up -d --build frontend`
- Ambos: `docker compose up -d --build backend frontend`
- Nginx (não precisa build): `docker compose restart nginx`

Se houve alteração no schema Prisma, rodar migrations **antes** do rebuild:
```bash
ssh root@66.253.112.233 "cd ~/tl-em-par && docker compose run --rm backend npx prisma migrate deploy 2>&1"
```

### Passo 5 — Verificar que containers estão rodando

```bash
ssh root@66.253.112.233 "cd ~/tl-em-par && docker compose ps 2>&1"
```

Todos os serviços devem mostrar status `Up` e `healthy` (onde aplicável).

### Passo 6 — Testes de sanidade

Executar **todos** estes testes em sequência:

```bash
# 1. Health check da API
curl -sf http://66.253.112.233/api/health

# 2. Frontend carregando
curl -sf http://66.253.112.233/ | head -3

# 3. Login funcional
curl -sf http://66.253.112.233/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tlempar.com.br","password":"admin12345"}' | jq '.success'
```

Resultados esperados:
- Health: `{"success":true,"data":{"status":"ok",...}}`
- Frontend: `<!doctype html>` (HTML carregando)
- Login: `true`

### Passo 7 — Relatório

Informar ao usuário:
- Quais arquivos foram commitados
- Quais serviços foram rebuilados
- Resultado de cada teste (OK ou FALHOU)
- Se algo falhou, mostrar os logs: `docker compose logs <serviço> --tail 30`

## Rollback em caso de falha

Se o deploy falhar após o push:
```bash
# Ver o commit anterior
ssh root@66.253.112.233 "cd ~/tl-em-par && git log --oneline -3"

# Reverter para o commit anterior (perguntar ao usuário antes!)
ssh root@66.253.112.233 "cd ~/tl-em-par && git checkout HEAD~1 && docker compose up -d --build <serviços>"
```

**SEMPRE perguntar ao usuário antes de fazer rollback.**
