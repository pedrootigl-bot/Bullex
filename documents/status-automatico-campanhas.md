# Status automático de campanhas

## Status

| Status | Quando | Site público |
|--------|--------|--------------|
| `agendada` | hoje **antes** de `data_inicio` | Oculta |
| `ativa` | `data_inicio` ≤ hoje **<** `data_fim` | Visível |
| `finalizada` | hoje **≥** `data_fim` | Oculta |

Timezone de referência: `America/Sao_Paulo`.

## Como funciona (MVP)

1. Em todo `GET /api/campanhas` e `GET /api/campanhas/:id`, o backend **recalcula** o status pelas datas e grava no banco se estiver desatualizado.
2. Em `POST` / `PUT` de campanha, o status é **sempre** derivado das datas (não depende do select manual).
3. Endpoint opcional para cron/admin: `POST /api/campanhas/sincronizar-status` (autenticado).

Arquivo central: `backend/utils/campanhaStatus.js`.

## Admin

- Formulário: opções Agendada / Ativa / Finalizada (atualiza ao mudar as datas).
- Lista: filtros e pills alinhados a esses três status.
- Campanhas `inativa` legadas são tratadas como finalizadas na UI após sync.

## Evolução futura

- Cron diário (00:05) chamando `sincronizar-status`
- Flag `status_manual_override` para pausar sem perder o fluxo automático
- Histórico de mudanças de status
- Notificações quando uma campanha fica ativa ou finalizada
