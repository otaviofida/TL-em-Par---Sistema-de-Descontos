# TL EM PAR

Clube de benefícios gastronômicos por assinatura.

## Estrutura

```
backend/   → API REST (Node.js + Express + Prisma + Zod)
frontend/  → SPA (React + Vite + Styled Components)
docs/      → Documentação técnica
```

## Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- Conta Stripe (keys de teste)

## Setup rápido

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Links úteis

- [Contexto do Projeto](CONTEXT.md)
- [Documentação da API](docs/API.md)
- [Regras de Negócio](docs/BUSINESS_RULES.md)
- [Integração Front-end](docs/FRONTEND_INTEGRATION.md)
- [Roadmap](docs/ROADMAP.md)
