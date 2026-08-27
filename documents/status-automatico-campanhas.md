# Status automático de campanhas

## Status

| Status | Quando | Site público (hub) |
|--------|--------|--------------------|
| `agendada` | hoje **antes** de (`data_inicio` − 5 dias) | Oculta |
| `em_aquecimento` | (`data_inicio` − 5) ≤ hoje **<** `data_inicio` | Visível — label **EM AQUECIMENTO** (`pre_active`) |
| `ativa` | `data_inicio` ≤ hoje **<** `data_fim` | Visível |
| `finalizada` | hoje **≥** `data_fim` | Oculta |

Timezone de referência: `America/Sao_Paulo`.

Constante única: `CAMPAIGN_WARMUP_DAYS = 5` em `backend/utils/campanhaStatus.js`.

Ver também: [pre-campanha-aquecimento.md](./pre-campanha-aquecimento.md).

## Como funciona

1. Em todo `GET /api/campanhas` e `GET /api/campanhas/:id`, o backend **recalcula** o status pelas datas e grava no banco se estiver desatualizado.
2. Em `POST` / `PUT` de campanha, o status é **sempre** derivado das datas (não depende do select manual).
3. Em `PUT`, se a campanha já estava `ativa`, **não** rebaixa para `em_aquecimento`.
4. Respostas anexam `data_inicio_aquecimento` (calculado; sem coluna obrigatória).
5. Scheduler (`jobs/campanhas.job.js`) só persiste o status calculado.
6. Endpoint opcional: `POST /api/campanhas/sincronizar-status` (autenticado).

Arquivo central: `backend/utils/campanhaStatus.js`.

## Admin

- Formulário: Agendada / Em aquecimento / Ativa / Finalizada (atualiza ao mudar as datas).
- Lista: filtros e pills alinhados a esses status.
- Campanhas `inativa` legadas são tratadas como finalizadas na UI após sync.

## Stats

Métricas de “campanhas ativas” contam **somente** `ativa` (aquecimento não entra).

## Notificações

Inclui `campanha_em_aquecimento` (dedupe `campanha_id + tipo`). Ver `central-notificacoes.md`.
