# Central de Notificações Automáticas

## Banco

Usa a tabela existente `notificacoes`:

- `id`, `created_at`, `campanha_id`, `tipo`, `titulo`, `mensagem`, `lida`

**Nenhuma coluna nova foi necessária.**

## API

| Método | Rota | Auth | Função |
|--------|------|------|--------|
| GET | `/api/notificacoes` | sim | Sync de eventos + lista + `nao_lidas` |
| PATCH | `/api/notificacoes/:id/lida` | sim | Marca `lida=true` |
| POST | `/api/notificacoes/sincronizar` | sim | Força geração de eventos |

## Deduplicação

Sem coluna extra:

- `campanha_iniciada` / `campanha_encerrada` → 1 por `campanha_id + tipo`
- `campanha_encerrando` → 1 por `campanha_id + tipo + mensagem` (7 dias / 3 dias / amanhã)

## Eventos automáticos

Reutiliza `campanhaStatus` (`agendada` → `ativa` → `finalizada`):

1. Iniciada (campanha ativa)
2. Termina em 7 dias
3. Termina em 3 dias
4. Termina amanhã
5. Encerrada

Timezone: `America/Sao_Paulo`.

## Frontend admin

Sino no topbar/header (`notificacoes-admin.js` + CSS), páginas:

- dashboard, campanhas, materiais, copies, formulário de campanha

## Teste rápido

1. Reiniciar backend
2. Login no admin → sino deve mostrar a notificação de teste
3. Marcar como lida → badge diminui
4. Recarregar → permanece lida
5. Abrir sino com campanha ativa → gera `campanha_iniciada` uma única vez
6. `POST /api/notificacoes/sincronizar` com Bearer token (cron futuro)
