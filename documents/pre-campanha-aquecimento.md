# Pré-campanha / Aquecimento

## Ciclo de status

```
agendada
  → em_aquecimento   (data_inicio − CAMPAIGN_WARMUP_DAYS)
  → ativa            (no data_inicio)
  → finalizada       (no data_fim)
```

Timezone de referência: `America/Sao_Paulo`.

## Constante única

Arquivo: `backend/utils/campanhaStatus.js`

```js
const CAMPAIGN_WARMUP_DAYS = 5;
```

Toda regra temporal de aquecimento (cálculo de status, `data_inicio_aquecimento`, notificações) usa essa constante. **Não duplicar** em outros arquivos de negócio.

## Campo calculado (sem migration obrigatória)

`data_inicio_aquecimento` **não** é coluna obrigatória no banco.

É calculado e anexado nas respostas da API (`GET/POST/PUT` campanhas) via `anexarCamposCalculados()`.

## Regras importantes

1. Datas (`data_inicio` / `data_fim`) são a fonte da verdade.
2. O scheduler (`backend/jobs/campanhas.job.js`) só **persiste** o status calculado pelo util.
3. Campanha já **ativa** (ativação antecipada) **não** é rebaixada para `em_aquecimento`.
4. Hub público lista `ativa` **e** `em_aquecimento` (label UI: `EM AQUECIMENTO` / `pre_active`).
5. Stats / métricas de “campanhas ativas” continuam contando **somente** `ativa`.

## Notificação

Tipo: `campanha_em_aquecimento`

- Criada no backend (`notificacoes.service.js`) via `criarSeNaoExistir`
- Dedupe: `campanha_id + tipo` (uma vez por campanha)
- No lançamento oficial segue `campanha_iniciada` (sem recriar aquecimento)

Índice opcional (recomendado): `database/add-notificacoes-unique-tipo-campanha.sql`

## Onde aparece na UI

| Área | Comportamento |
|------|----------------|
| Hub (`campanha.js`, calendário) | Lista ativa + aquecimento; badge `EM AQUECIMENTO` |
| Admin lista / filtro / form | Status `em_aquecimento` / “Em aquecimento” |
| Destaque / Post do Dia | Continua preferindo campanhas `ativa` |
| Stats | Só `ativa` |

## Testes

```bash
cd backend
npm test
```

Cobertura: 10/5/3/1 dias antes, início hoje, encerrada, edição de data, criação na janela, não rebaixar ativa, notificação sem duplicar aquecimento.
