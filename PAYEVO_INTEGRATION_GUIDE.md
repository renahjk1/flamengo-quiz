# Guia de Integração PAYEVO

## Visão Geral

Este documento descreve a integração da gateway de pagamento PAYEVO no site Flamengo Quiz, substituindo a SKALEPAY anterior.

## Arquivos Modificados/Criados

### 1. Novos Arquivos

- **`server/payevo.ts`** - Integração com API PAYEVO
  - Função `createPixTransaction()` - Cria transação PIX
  - Função `getTransaction()` - Verifica status da transação

- **`server/payevo-webhook-handler.ts`** - Handler para webhooks PAYEVO
  - Processa notificações de pagamento
  - Atualiza status no banco de dados
  - Envia conversão para UTMify quando pagamento é confirmado

### 2. Arquivos Modificados

- **`server/routers.ts`**
  - Alteração da importação: `skalepay` → `payevo`
  - Atualização das chamadas de função para incluir endereço
  - Webhook URL alterada para `/api/webhook/payevo`

- **`server/_core/index.ts`**
  - Adição da importação do handler PAYEVO
  - Registro da rota POST `/api/webhook/payevo`

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# PAYEVO Configuration
PAYEVO_SECRET_KEY=sk_like_xfOdhbgCUAjqckqIMD8yMO8KvAyc8DoFQ2ecFOupJEC6OYwn
PAYEVO_COMPANY_ID=bddc27e4-cb08-4af5-8b88-9b5567d2dcb6

# Webhook Configuration
WEBHOOK_URL=https://seu-dominio.com/api/webhook/payevo
APP_URL=https://seu-dominio.com
```

## Fluxo de Pagamento

### 1. Criação de Transação PIX

Quando o usuário chega na página de pagamento:

```typescript
// Cliente envia dados para createPix
const result = await trpc.payment.createPix.useMutation({
  customer: { name, email, phone, cpf },
  address: { cep, street, number, neighborhood, city, state },
  freteValue: 29.90,
  camisaName: "Camisa Flamengo",
  camisaId: "1",
  camisaSize: "M",
  utm: { utm_source, utm_medium, ... }
});
```

### 2. Resposta PAYEVO

A API PAYEVO retorna:

```json
{
  "id": "transaction-uuid",
  "status": "waiting_payment",
  "amount": 2990,
  "pix": {
    "qrcode": "00020126580014br.gov.bcb.pix...",
    "expirationDate": "2025-12-13T18:31:00-03:00"
  }
}
```

### 3. Exibição do PIX

O frontend exibe:
- **QR Code** - Gerado a partir do `pix.qrcode`
- **Chave PIX** - Copiável para colar no banco

### 4. Verificação de Pagamento

O frontend faz polling a cada 5 segundos:

```typescript
const statusQuery = trpc.payment.checkStatus.useQuery(
  { transactionId },
  { enabled: !!transactionId && !isPaid, refetchInterval: 5000 }
);
```

### 5. Webhook de Confirmação

Quando o pagamento é confirmado, PAYEVO envia POST para:

```
https://seu-dominio.com/api/webhook/payevo
```

Com payload:

```json
{
  "id": "webhook-id",
  "type": "transaction",
  "objectId": "transaction-uuid",
  "data": {
    "id": "transaction-uuid",
    "status": "paid",
    "amount": 2990,
    "paidAt": "2025-12-13T17:31:00-03:00",
    "pix": {
      "end2EndId": "E00000000000000000000000000000000000000",
      "receiptUrl": "https://..."
    }
  }
}
```

### 6. Processamento do Webhook

1. Valida se é webhook de transação
2. Busca transação no banco de dados
3. Atualiza status para "paid"
4. Envia conversão para UTMify
5. Marca como enviado para UTMify

### 7. Redirecionamento ao Upsell

Após confirmação de pagamento, o usuário é redirecionado para:

```
https://flamengo-quiz-production.up.railway.app/nf1
```

## Endpoints da API

### POST `/api/trpc/payment.createPix`

Cria uma transação PIX.

**Input:**
```typescript
{
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  freteType: "sedex" | "pac" | "transportadora";
  freteValue: number;
  camisaId: string;
  camisaName: string;
  camisaSize: string;
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    src?: string;
    sck?: string;
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  transactionId: string;
  orderId: string;
  pixPayload: string; // QR Code PIX
  status: "waiting_payment";
  error?: string;
}
```

### GET `/api/trpc/payment.checkStatus`

Verifica o status de uma transação.

**Input:**
```typescript
{ transactionId: string }
```

**Output:**
```typescript
{
  success: boolean;
  status: string;
  isPaid: boolean;
  error?: string;
}
```

### POST `/api/webhook/payevo`

Recebe notificações de pagamento da PAYEVO.

**Payload:** Webhook PAYEVO (veja seção 5 acima)

## Diferenças SKALEPAY vs PAYEVO

| Aspecto | SKALEPAY | PAYEVO |
|---------|----------|--------|
| Autenticação | Basic Auth `key:x` | Basic Auth `key:` |
| URL Base | `https://api.conta.skalepay.com.br/v1` | `https://apiv2.payevo.com.br/functions/v1` |
| ID Transação | Numérico | UUID |
| QR Code | Campo `qrcode` | Campo `qrcode` |
| Status | `paid`, `waiting_payment`, etc. | `paid`, `waiting_payment`, etc. |
| Webhook | `/api/webhook/skale` | `/api/webhook/payevo` |

## Teste Manual

### 1. Gerar PIX

```bash
curl -X POST http://localhost:3000/api/trpc/payment.createPix \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "11999999999",
      "cpf": "12345678901"
    },
    "address": {
      "cep": "01310100",
      "street": "Avenida Paulista",
      "number": "1000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP"
    },
    "freteType": "sedex",
    "freteValue": 29.90,
    "camisaId": "1",
    "camisaName": "Camisa Flamengo",
    "camisaSize": "M"
  }'
```

### 2. Verificar Status

```bash
curl http://localhost:3000/api/trpc/payment.checkStatus?transactionId=UUID_AQUI
```

### 3. Simular Webhook

```bash
curl -X POST http://localhost:3000/api/webhook/payevo \
  -H "Content-Type: application/json" \
  -d '{
    "id": "webhook-123",
    "type": "transaction",
    "objectId": "transaction-uuid",
    "data": {
      "id": "transaction-uuid",
      "status": "paid",
      "amount": 2990,
      "paidAt": "2025-12-13T17:31:00-03:00"
    }
  }'
```

## Troubleshooting

### Erro: "Payevo credentials not configured"

**Solução:** Verifique se as variáveis de ambiente estão definidas:
```bash
echo $PAYEVO_SECRET_KEY
echo $PAYEVO_COMPANY_ID
```

### Erro: "Transaction not found in database"

**Solução:** Verifique se a transação foi salva no banco de dados após criação do PIX.

### Webhook não é recebido

**Solução:** 
1. Verifique se a URL do webhook está configurada corretamente em `WEBHOOK_URL`
2. Confirme que o domínio é acessível publicamente
3. Verifique os logs do servidor para erros

### PIX não aparece no frontend

**Solução:**
1. Verifique se `pixPayload` contém o QR Code
2. Confirme que a biblioteca `qrcode.react` está instalada
3. Verifique o console do navegador para erros

## Próximos Passos

1. Testar integração em ambiente de desenvolvimento
2. Configurar variáveis de ambiente em produção
3. Validar fluxo completo de pagamento
4. Monitorar webhooks e transações
5. Configurar alertas para erros de pagamento

## Suporte

Para dúvidas sobre a API PAYEVO, consulte:
- Documentação: https://payevov2.readme.io/reference/introdução
- Email de suporte: support@payevo.com
