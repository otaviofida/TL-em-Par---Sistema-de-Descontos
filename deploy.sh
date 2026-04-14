#!/bin/bash
set -euo pipefail

# ===========================================
# TL EM PAR — Script de Deploy para VPS
# ===========================================

echo "🚀 TL EM PAR — Deploy"
echo "====================="

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "   Copie .env.production.example para .env e preencha os valores."
    echo "   cp .env.production.example .env"
    exit 1
fi

# Carregar variáveis
source .env

echo "📦 Construindo imagens Docker..."
docker compose build --no-cache

echo "🗄️ Subindo banco de dados..."
docker compose up -d db
echo "   Aguardando PostgreSQL ficar pronto..."
sleep 5

echo "🔄 Rodando migrations do Prisma..."
docker compose run --rm backend npx prisma migrate deploy

echo "🌱 Rodando seed (se necessário)..."
docker compose run --rm backend npx tsx prisma/seed.ts || echo "   Seed já executado ou não necessário."

echo "🚀 Subindo todos os serviços..."
docker compose up -d

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Aponte o DNS de tlempar.com.br para o IP desta VPS"
echo "   2. Para obter o certificado SSL:"
echo "      cp nginx/conf.d/tlempar-init.conf nginx/conf.d/tlempar.conf"
echo "      docker compose restart nginx"
echo "      docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d tlempar.com.br -d www.tlempar.com.br --email seu@email.com --agree-tos"
echo "      Depois restaure o conf original com SSL:"
echo "      (o arquivo tlempar.conf original já tem a config SSL)"
echo "      docker compose restart nginx"
echo ""
echo "   3. Verifique os logs: docker compose logs -f"
echo "   4. Health check: curl https://tlempar.com.br/api/health"
