# Regras de Negócio — TL EM PAR

## 1. Assinatura

| Regra | Descrição |
|-------|-----------|
| RN-ASS-01 | O usuário deve ter uma assinatura com status `ACTIVE` para acessar qualquer funcionalidade do clube |
| RN-ASS-02 | A cobrança é mensal e recorrente via Stripe |
| RN-ASS-03 | Se o pagamento falhar, o status muda para `PAST_DUE` e o usuário perde acesso após período de carência |
| RN-ASS-04 | Ao cancelar, o status muda para `CANCELED` e o usuário mantém acesso até o fim do período pago |
| RN-ASS-05 | Uma reativação cria uma nova Subscription, não reutiliza a antiga |

## 2. Benefício

| Regra | Descrição |
|-------|-----------|
| RN-BEN-01 | O benefício padrão é "compre 1 e ganhe outro" |
| RN-BEN-02 | Cada empresa pode ter uma oferta específica vinculada |
| RN-BEN-03 | O usuário pode usar o benefício **1 vez por empresa por edição** |
| RN-BEN-04 | Se já usou naquela empresa na edição vigente, o sistema **bloqueia** nova validação |
| RN-BEN-05 | Toda validação gera um registro em `BenefitRedemption` |

## 3. Edição / Campanha

| Regra | Descrição |
|-------|-----------|
| RN-EDI-01 | O clube funciona por edições (períodos de campanha) |
| RN-EDI-02 | Cada edição tem data de início e fim |
| RN-EDI-03 | Empresas são vinculadas a edições específicas |
| RN-EDI-04 | Uma empresa pode participar de múltiplas edições |
| RN-EDI-05 | O histórico registra em qual edição o benefício foi usado |
| RN-EDI-06 | Apenas 1 edição pode estar ativa por vez (`ACTIVE`) |

## 4. Validação por QR Code

| Regra | Descrição |
|-------|-----------|
| RN-QRC-01 | Cada empresa tem um QR Code único (token UUID) |
| RN-QRC-02 | O cliente logado escaneia o QR Code no estabelecimento |
| RN-QRC-03 | O sistema valida (nesta ordem): |
|           | 1. Usuário autenticado |
|           | 2. Assinatura ativa (`ACTIVE`) |
|           | 3. Token QR válido (existe e pertence a empresa ativa) |
|           | 4. Empresa ativa na edição vigente |
|           | 5. Edição dentro do período válido |
|           | 6. Usuário não usou benefício naquela empresa naquela edição |
| RN-QRC-04 | Se tudo válido → grava `BenefitRedemption` e retorna sucesso |
| RN-QRC-05 | Se qualquer check falhar → retorna erro específico |
| RN-QRC-06 | A validação deve ser **idempotente**: requests duplicados (mesmo user+company+edition) não geram duplicatas |

## 5. Empresa

| Regra | Descrição |
|-------|-----------|
| RN-EMP-01 | Uma empresa precisa estar com status `ACTIVE` para participar |
| RN-EMP-02 | Empresas inativas não aparecem na listagem do assinante |
| RN-EMP-03 | O admin pode ativar/inativar a qualquer momento |
| RN-EMP-04 | Cada empresa tem um QR Token gerado automaticamente || RN-EMP-05 | Cada empresa tem uma categoria (japonesa, brasileira, marmitex, lanches, pizza, açaí, sorvete, doces, bebidas, saudável, pastel, italiana, padaria) |
| RN-EMP-06 | A categoria é selecionada no cadastro/edição da empresa |
| RN-EMP-07 | O assinante pode filtrar empresas por categoria na listagem |
## 6. Usuário

| Regra | Descrição |
|-------|-----------|
| RN-USR-01 | O email é único por conta |
| RN-USR-02 | A senha deve ter no mínimo 8 caracteres |
| RN-USR-03 | O campo `role` diferencia `USER` de `ADMIN` |
| RN-USR-04 | Admin não pode ser criado por registro público |
| RN-USR-05 | Após cadastro, o usuário é redirecionado para checkout Stripe — acesso ao painel só após pagamento |
| RN-USR-06 | Sem assinatura ativa, o usuário é redirecionado para `/assinar` ao tentar acessar qualquer rota do painel |

## 7. Segurança

| Regra | Descrição |
|-------|-----------|
| RN-SEC-01 | Senhas armazenadas com bcrypt (salt rounds >= 10) |
| RN-SEC-02 | Autenticação via JWT (access token + refresh token) |
| RN-SEC-03 | Access token expira em 15 minutos |
| RN-SEC-04 | Refresh token expira em 7 dias |
| RN-SEC-05 | Chaves do Stripe APENAS no backend |
| RN-SEC-06 | Rate limiting em rotas sensíveis (login, registro, validação) |
| RN-SEC-07 | Validação de entrada com Zod em todas as rotas |
