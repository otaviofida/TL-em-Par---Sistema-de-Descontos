# API REST — TL EM PAR

Base URL: `http://localhost:3333/api`

Formato padrão de resposta:
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

Formato padrão de erro:
```json
{
  "success": false,
  "error": {
    "code": "BENEFIT_ALREADY_USED",
    "message": "Você já utilizou este benefício nesta edição."
  }
}
```

---

## Autenticação

Todas as rotas protegidas exigem header:
```
Authorization: Bearer <access_token>
```

Rotas admin exigem `role: ADMIN` no token.

---

## Auth

### POST /api/auth/register

Cria conta de usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senhaForte123",
  "phone": "11999998888",
  "cpf": "12345678900",
  "birthDate": "1995-06-15",
  "gender": "masculino"
}
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "João Silva", "email": "joao@email.com" },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

**Erros:**
| Código | Status | Descrição |
|--------|--------|-----------|
| EMAIL_ALREADY_EXISTS | 409 | Email já cadastrado |
| VALIDATION_ERROR | 400 | Campos inválidos |

---

### POST /api/auth/login

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senhaForte123"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "role": "USER" },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

**Erros:**
| Código | Status | Descrição |
|--------|--------|-----------|
| INVALID_CREDENTIALS | 401 | Email ou senha incorretos |

---

### POST /api/auth/refresh

**Body:**
```json
{
  "refreshToken": "jwt..."
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "novo_jwt...",
    "refreshToken": "novo_refresh..."
  }
}
```

**Erros:**
| Código | Status | Descrição |
|--------|--------|-----------|
| INVALID_REFRESH_TOKEN | 401 | Token inválido ou expirado |

---

### GET /api/auth/me

Retorna perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999998888",
    "cpf": "12345678900",
    "role": "USER",
    "subscription": {
      "id": "uuid",
      "status": "ACTIVE",
      "currentPeriodEnd": "2026-05-31T23:59:59Z"
    }
  }
}
```

---

### PUT /api/auth/profile

Atualiza dados do perfil.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "João da Silva",
  "phone": "11999997777"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "João da Silva", "phone": "11999997777" }
}
```

---

## Assinatura (Stripe)

### POST /api/subscriptions/checkout

Cria sessão de checkout no Stripe.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "priceId": "price_stripe_id"
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

---

### POST /api/subscriptions/webhook

Webhook do Stripe (não requer auth, valida signature).

**Headers:** `Stripe-Signature: ...`

**Eventos tratados:**
- `checkout.session.completed` → cria Subscription ACTIVE
- `invoice.paid` → renova período
- `invoice.payment_failed` → marca PAST_DUE
- `customer.subscription.deleted` → marca CANCELED

---

### GET /api/subscriptions/status

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "status": "ACTIVE",
    "currentPeriodStart": "2026-03-01T00:00:00Z",
    "currentPeriodEnd": "2026-03-31T23:59:59Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

### POST /api/subscriptions/cancel

Cancela a assinatura (mantém acesso até o fim do período).

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "success": true,
  "data": { "status": "ACTIVE", "cancelAtPeriodEnd": true }
}
```

---

## Empresas (Público — requer assinatura ativa)

### GET /api/companies

Lista empresas participantes da edição vigente.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| page | number | Página (default: 1) |
| limit | number | Itens por página (default: 20) |
| search | string | Busca por nome |
| category | string | Filtrar por categoria (japonesa, brasileira, marmitex, lanches, pizza, acai, sorvete, doces, bebidas, saudavel, pastel, italiana, padaria) |

**Resposta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Restaurante Sabor",
      "description": "Culinária italiana",
      "category": "RESTAURANT",
      "logoUrl": "https://...",
      "address": "Rua...",
      "benefitDescription": "Compre 1 pizza e ganhe outra",
      "alreadyUsed": false
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

---

### GET /api/companies/:id

Detalhe de uma empresa.

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante Sabor",
    "description": "Culinária italiana...",
    "category": "RESTAURANT",
    "logoUrl": "https://...",
    "coverUrl": "https://...",
    "address": "Rua tal, 123",
    "city": "São Paulo",
    "phone": "11999990000",
    "instagram": "@restaurantesabor",
    "benefitDescription": "Compre 1 pizza e ganhe outra",
    "benefitRules": "Válido de segunda a quinta",
    "alreadyUsed": false,
    "usedAt": null
  }
}
```

---

## Validação de Benefício

### POST /api/benefits/validate

Valida benefício via QR Code.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "qrToken": "uuid-token-da-empresa"
}
```

**Resposta 200 (sucesso):**
```json
{
  "success": true,
  "data": {
    "redemptionId": "uuid",
    "company": { "id": "uuid", "name": "Restaurante Sabor" },
    "benefit": "Compre 1 pizza e ganhe outra",
    "redeemedAt": "2026-03-13T14:30:00Z",
    "edition": { "id": "uuid", "name": "Edição Março-Maio 2026" }
  }
}
```

**Erros:**
| Código | Status | Descrição |
|--------|--------|-----------|
| SUBSCRIPTION_REQUIRED | 403 | Usuário sem assinatura ativa |
| INVALID_QR_TOKEN | 404 | QR Code inválido |
| COMPANY_INACTIVE | 403 | Empresa inativa |
| NO_ACTIVE_EDITION | 404 | Nenhuma edição ativa no momento |
| COMPANY_NOT_IN_EDITION | 403 | Empresa não participa da edição atual |
| BENEFIT_ALREADY_USED | 409 | Já usou nesta empresa nesta edição |

---

### GET /api/benefits/history

Histórico de validações do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| page | number | Página (default: 1) |
| limit | number | Itens por página (default: 20) |
| editionId | string | Filtrar por edição |

**Resposta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "company": { "id": "uuid", "name": "Restaurante Sabor", "logoUrl": "..." },
      "benefit": "Compre 1 pizza e ganhe outra",
      "edition": { "id": "uuid", "name": "Edição Março-Maio 2026" },
      "redeemedAt": "2026-03-13T14:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

---

## Admin — Empresas

### GET /api/admin/companies

Lista todas as empresas (com filtros).

**Headers:** `Authorization: Bearer <token>` (ADMIN)

**Query params:** `page`, `limit`, `search`, `status`, `editionId`

---

### POST /api/admin/companies

Cria nova empresa.

**Headers:** `Authorization: Bearer <token>` (ADMIN)

**Body:**
```json
{
  "name": "Restaurante Sabor",
  "description": "Culinária italiana premiada",
  "category": "RESTAURANT",
  "address": "Rua tal, 123",
  "city": "São Paulo",
  "phone": "11999990000",
  "instagram": "@restaurantesabor",
  "logoUrl": "https://...",
  "coverUrl": "https://...",
  "benefitDescription": "Compre 1 pizza e ganhe outra",
  "benefitRules": "Válido de segunda a quinta"
}
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante Sabor",
    "qrToken": "uuid-gerado-automaticamente",
    "status": "ACTIVE"
  }
}
```

---

### PUT /api/admin/companies/:id

Atualiza empresa.

---

### PATCH /api/admin/companies/:id/status

Ativa/inativa empresa.

**Body:**
```json
{
  "status": "INACTIVE"
}
```

---

### GET /api/admin/companies/:id/qr-token

Retorna QR Token da empresa (para gerar QR Code físico).

---

## Admin — Edições

### GET /api/admin/editions

Lista todas as edições.

---

### POST /api/admin/editions

Cria nova edição.

**Body:**
```json
{
  "name": "Edição Março-Maio 2026",
  "startDate": "2026-03-01",
  "endDate": "2026-05-31"
}
```

---

### PUT /api/admin/editions/:id

Atualiza edição.

---

### POST /api/admin/editions/:id/companies

Vincula empresas à edição.

**Body:**
```json
{
  "companyIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

### DELETE /api/admin/editions/:id/companies/:companyId

Remove empresa da edição.

---

## Admin — Usuários

### GET /api/admin/users

Lista usuários com filtros.

**Query params:** `page`, `limit`, `search`, `subscriptionStatus`

---

### GET /api/admin/users/:id

Detalhe do usuário com assinatura e histórico.

---

## Admin — Assinaturas

### GET /api/admin/subscriptions

Lista assinaturas com filtros.

**Query params:** `page`, `limit`, `status`, `userId`

---

## Admin — Validações / Histórico

### GET /api/admin/redemptions

Histórico geral de validações.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| page | number | Página |
| limit | number | Itens por página |
| userId | string | Filtrar por usuário |
| companyId | string | Filtrar por empresa |
| editionId | string | Filtrar por edição |
| startDate | string | Data início |
| endDate | string | Data fim |

---

## Admin — Dashboard

### GET /api/admin/dashboard

Dados resumidos para dashboard.

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeSubscriptions": 980,
    "totalCompanies": 45,
    "activeCompanies": 42,
    "totalRedemptions": 3200,
    "redemptionsThisMonth": 450,
    "currentEdition": {
      "id": "uuid",
      "name": "Edição Março-Maio 2026",
      "redemptionCount": 1200
    },
    "topCompanies": [
      { "id": "uuid", "name": "Restaurante Sabor", "redemptionCount": 89 }
    ]
  }
}
```
