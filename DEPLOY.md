# TL EM PAR — Guia de Deploy para VPS

## Pré-requisitos na VPS

```bash
# Instalar Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Fazer logout e login novamente

# Verificar instalação
docker --version
docker compose version
```

## 1. Enviar o projeto para a VPS

```bash
# Opção A: Git (recomendado)
# No seu repositório Git:
git add .
git commit -m "Prepare for production deploy"
git push

# Na VPS:
git clone https://github.com/SEU_USUARIO/tl-em-par.git
cd tl-em-par

# Opção B: SCP (upload direto)
scp -r "TL em par/" root@SEU_IP_VPS:~/tl-em-par
ssh root@SEU_IP_VPS
cd tl-em-par
```

## 2. Configurar variáveis de ambiente

```bash
# Copiar template
cp .env.production.example .env

# Editar com seus valores reais
nano .env
```

### Gerar secrets seguros:

```bash
# JWT_SECRET
openssl rand -base64 64

# JWT_REFRESH_SECRET
openssl rand -base64 64

# DB_PASSWORD
openssl rand -base64 32
```

### Exemplo de `.env` preenchido:

```env
DB_USER=tlempar
DB_PASSWORD=suaSenhaSeguraGerada123

JWT_SECRET=chave_gerada_com_openssl_aqui
JWT_REFRESH_SECRET=outra_chave_gerada_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_51P83bsGz7v2DPrwm...
STRIPE_WEBHOOK_SECRET=whsec_DnXNK7lL0o7a9Lr9...
STRIPE_PRICE_ID=price_1TArWnGz7v2DPrwmWngcKWs5
```

## 3. Apontar DNS

No painel do seu registrador de domínio:

| Tipo | Nome | Valor          |
|------|------|----------------|
| A    | @    | IP_DA_SUA_VPS  |
| A    | www  | IP_DA_SUA_VPS  |

> **Aguarde a propagação DNS (pode levar até 24h, geralmente 5-30min).**

Verificar propagação:
```bash
dig tlempar.com.br +short
# Deve retornar o IP da VPS
```

## 4. Primeiro deploy (sem SSL)

```bash
# Construir e subir tudo
docker compose build

# Subir DB primeiro
docker compose up -d db
sleep 5

# Rodar migrations
docker compose run --rm backend npx prisma migrate deploy

# Rodar seed (criar admin, etc.)
docker compose run --rm backend npx tsx prisma/seed.ts

# Usar config temporária sem SSL
cp nginx/conf.d/tlempar-init.conf nginx/conf.d/tlempar.conf.bak
cp nginx/conf.d/tlempar-init.conf nginx/conf.d/tlempar.conf

# Subir tudo
docker compose up -d

# Verificar se está rodando
docker compose ps
curl http://tlempar.com.br/api/health
```

## 5. Configurar SSL (Let's Encrypt)

```bash
# Emitir certificado
docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d tlempar.com.br \
  -d www.tlempar.com.br \
  --email seu@email.com \
  --agree-tos \
  --no-eff-email

# Restaurar config com SSL
cp nginx/conf.d/tlempar.conf.bak nginx/conf.d/tlempar.conf
# O arquivo original (tlempar.conf) já tem a config SSL

# Restartar nginx
docker compose restart nginx

# Testar HTTPS
curl https://tlempar.com.br/api/health
```

### Renovação automática de SSL

O container `certbot` já está configurado para renovar automaticamente a cada 12h. Para forçar renovação:

```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

## 6. Configurar Webhook do Stripe

No Dashboard do Stripe:

1. Vá em **Developers → Webhooks**
2. Clique **Add endpoint**
3. URL: `https://tlempar.com.br/api/subscriptions/webhook`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copie o **Signing secret** (whsec_...) e atualize no `.env`

```bash
# Atualizar webhook secret
nano .env
# Altere STRIPE_WEBHOOK_SECRET=whsec_novo_valor

# Restartar backend
docker compose restart backend
```

## Comandos úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f nginx

# Restartar tudo
docker compose restart

# Parar tudo
docker compose down

# Parar e remover volumes (⚠️ APAGA O BANCO!)
docker compose down -v

# Rebuild após mudanças no código
docker compose build --no-cache
docker compose up -d

# Acessar terminal do backend
docker compose exec backend sh

# Acessar Prisma Studio (expor porta temporariamente)
docker compose exec backend npx prisma studio

# Ver uso de recursos
docker stats
```

## Troubleshooting

### Backend não conecta no banco
```bash
docker compose logs db
docker compose exec db psql -U tlempar -d tlempar -c "SELECT 1"
```

### Certificado SSL não emitido
```bash
# Verificar se DNS está correto
dig tlempar.com.br +short

# Verificar logs do certbot
docker compose logs certbot

# Verificar se porta 80 está acessível
curl http://tlempar.com.br/.well-known/acme-challenge/test
```

### Webhook do Stripe falhando
```bash
# Verificar logs
docker compose logs -f backend | grep WEBHOOK

# Testar endpoint
curl -X POST https://tlempar.com.br/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Deve retornar 400 (signature inválida) — isso é esperado
```

### Uploads não funcionam
```bash
# Verificar permissões
docker compose exec backend ls -la uploads/

# Recriar diretórios
docker compose exec backend mkdir -p uploads/avatars uploads/covers uploads/logos
```
