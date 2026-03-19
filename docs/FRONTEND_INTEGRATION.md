# Integração Front-end — TL EM PAR

Guia para o time front-end consumir a API com React + Vite + Styled Components.

---

## 1. Configuração Base

### Variáveis de ambiente (`.env`)

```env
VITE_API_URL=/api
VITE_STRIPE_PRICE_ID=price_your_default_price_id
```

> **IMPORTANTE:** Nunca coloque chaves do Stripe ou qualquer secret no front-end. O front só recebe a URL de checkout gerada pelo backend.

### HTTP Client (Axios)

```ts
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@tlEmPar:accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('@tlEmPar:refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem('@tlEmPar:accessToken', data.data.accessToken);
          localStorage.setItem('@tlEmPar:refreshToken', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('@tlEmPar:accessToken');
          localStorage.removeItem('@tlEmPar:refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api };
```

---

## 2. Fluxo de Autenticação

### Registro
1. Usuário preenche form de cadastro
2. Front chama `POST /api/auth/register`
3. Recebe `accessToken` e `refreshToken`
4. Salva no `localStorage`
5. Chama `POST /api/subscriptions/checkout` com `priceId`
6. Redireciona para Stripe Checkout (`window.location.href = checkoutUrl`)
7. Após pagamento, Stripe redireciona para `/assinatura/sucesso`

> **IMPORTANTE:** O acesso ao painel só é liberado após pagamento. Sem assinatura ativa, o usuário é redirecionado para `/assinar`.

### Login
1. Usuário informa email e senha
2. Front chama `POST /api/auth/login`
3. Recebe tokens
4. Salva e redireciona para `/dashboard` ou `/empresas`

### Token Refresh (automático)
- O interceptor do Axios detecta 401
- Tenta refresh automático
- Se falhar, limpa storage e redireciona para `/login`

### Logout
- Remove tokens do `localStorage`
- Redireciona para `/login`

---

## 3. Fluxo de Assinatura (Stripe)

1. Usuário clica em "Assinar"
2. Front chama `POST /api/subscriptions/checkout` com `priceId`
3. Backend retorna `checkoutUrl` do Stripe
4. Front faz `window.location.href = checkoutUrl`
5. Stripe cuida do pagamento
6. Stripe redireciona para URL de sucesso/cancelamento
7. Webhook do Stripe (backend) atualiza assinatura
8. Ao voltar, front chama `GET /api/subscriptions/status` para confirmar

**Páginas de retorno do Stripe:**
- Sucesso: `/assinatura/sucesso`
- Cancelamento: `/assinatura/cancelado`

---

## 4. Fluxo de Validação por QR Code

### Como funciona

1. Usuário acessa `/validar` (ou botão "Escanear QR Code")
2. Front abre câmera usando lib como `react-qr-reader` ou `html5-qrcode`
3. Ao ler o QR Code, extrai o `qrToken` (UUID)
4. Front chama `POST /api/benefits/validate` com `{ qrToken }`
5. Frontend exibe resultado:

### Estados da tela

| Estado | Condição | UI |
|--------|----------|-----|
| Escaneando | Câmera aberta, aguardando leitura | Viewfinder com overlay |
| Validando | Request em andamento | Loading spinner |
| Sucesso | Validação aprovada | Tela verde com check, nome da empresa e benefício |
| Erro: já usou | `BENEFIT_ALREADY_USED` | Tela amarela: "Você já usou este benefício nesta edição" |
| Erro: sem assinatura | `SUBSCRIPTION_REQUIRED` | Tela vermelha: "Assinatura inativa" + link para assinar |
| Erro: QR inválido | `INVALID_QR_TOKEN` | Tela vermelha: "QR Code inválido" |
| Erro: empresa inativa | `COMPANY_INACTIVE` | Tela vermelha: "Empresa não está participando" |
| Erro: sem edição | `NO_ACTIVE_EDITION` | Tela cinza: "Nenhuma edição ativa no momento" |

### Exemplo de implementação

```tsx
const handleScan = async (qrToken: string) => {
  try {
    setStatus('validating');
    const { data } = await api.post('/benefits/validate', { qrToken });
    setResult(data.data);
    setStatus('success');
  } catch (error) {
    const code = error.response?.data?.error?.code;
    setErrorCode(code);
    setStatus('error');
  }
};
```

---

## 5. Páginas do Front-end

### Área Pública
| Página | Rota | Descrição |
|--------|------|-----------|
| Home | `/` | Landing page do clube |
| Login | `/login` | Form de login |
| Cadastro | `/cadastro` | Form de registro |
| Assinatura Sucesso | `/assinatura/sucesso` | Retorno positivo do Stripe |
| Assinatura Cancelada | `/assinatura/cancelado` | Retorno negativo do Stripe |

### Área do Assinante (protegida)
| Página | Rota | Descrição |
|--------|------|-----------|
| Checkout | `/assinar` | Página para iniciar assinatura Stripe |
| Dashboard | `/painel` | Status da assinatura, resumo |
| Empresas | `/empresas` | Lista de empresas participantes |
| Detalhe Empresa | `/empresas/:id` | Info da empresa + benefício |
| Validar QR Code | `/validar` | Scanner de QR Code |
| Histórico | `/historico` | Validações realizadas |
| Perfil | `/perfil` | Editar dados pessoais |

### Área Admin (protegida, role ADMIN)
| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard Admin | `/admin` | Métricas e resumo |
| Empresas Admin | `/admin/empresas` | CRUD de empresas |
| Nova Empresa | `/admin/empresas/nova` | Form de criação |
| Editar Empresa | `/admin/empresas/:id/editar` | Form de edição |
| Edições | `/admin/edicoes` | CRUD de edições |
| Usuários | `/admin/usuarios` | Listagem de usuários |
| Assinaturas | `/admin/assinaturas` | Listagem de assinaturas |
| Métricas Admin | `/admin/metricas` | Gráficos e métricas avançadas |
| Validações | `/admin/validacoes` | Histórico geral com filtros |

---

## 6. Mensagens de Erro Mapeadas

```ts
// src/utils/errorMessages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  INVALID_REFRESH_TOKEN: 'Sessão expirada. Faça login novamente.',
  SUBSCRIPTION_REQUIRED: 'Você precisa de uma assinatura ativa.',
  INVALID_QR_TOKEN: 'QR Code inválido. Tente novamente.',
  COMPANY_INACTIVE: 'Esta empresa não está participando no momento.',
  NO_ACTIVE_EDITION: 'Nenhuma edição ativa no momento.',
  COMPANY_NOT_IN_EDITION: 'Esta empresa não participa da edição atual.',
  BENEFIT_ALREADY_USED: 'Você já utilizou este benefício nesta edição.',
  UNAUTHORIZED: 'Acesso não autorizado.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  VALIDATION_ERROR: 'Verifique os dados informados.',
  INTERNAL_ERROR: 'Erro interno. Tente novamente mais tarde.',
};
```

---

## 7. Headers Necessários

| Header | Quando usar | Valor |
|--------|-------------|-------|
| `Authorization` | Todas as rotas autenticadas | `Bearer <accessToken>` |
| `Content-Type` | POST/PUT com body | `application/json` |

---

## 8. Guards de Rota (React Router)

```tsx
// Rota protegida para assinantes
<Route element={<PrivateRoute />}>
  <Route path="/painel" element={<Dashboard />} />
  <Route path="/empresas" element={<Companies />} />
  {/* ... */}
</Route>

// Rota protegida para admins
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<AdminDashboard />} />
  {/* ... */}
</Route>
```

**PrivateRoute** verifica:
1. Token existe no localStorage
2. `GET /api/auth/me` retorna sucesso
3. Se falhar → redireciona para `/login`

**SubscriptionRoute** verifica:
1. `user.subscription.status === 'ACTIVE'`
2. Se não ativa → redireciona para `/assinar`
3. Se ativa e na página `/assinar` → redireciona para `/painel`

**AdminRoute** verifica:
1. Tudo do PrivateRoute
2. `user.role === 'ADMIN'`
3. Se não admin → redireciona para `/painel`

---

## 9. Libs Recomendadas

| Lib | Uso |
|-----|-----|
| `axios` | HTTP client |
| `react-router-dom` | Rotas |
| `react-qr-reader` ou `html5-qrcode` | Scanner QR |
| `react-hook-form` | Forms |
| `@tanstack/react-query` | Cache e estado de server |
| `date-fns` | Formatação de datas |
| `react-hot-toast` | Notificações |
| `zustand` | Estado global leve |
