# Camada 2 — Segurança

**Data:** 2026-08-11  
**Base:** pós Camada 1 (`a26a766`)

---

## STATUS

⚠️ Parcial — correções de código aplicadas e testadas; policy de Storage no Supabase depende de SQL manual; chave `SERVICE_ROLE` deve ser rotacionada (estava no Git).

---

## ANÁLISE

### Secrets

| Item | Resultado |
|------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` no frontend | ✅ Não presente |
| Frontend usa chave `anon` | ✅ |
| `backend/.env` versionado no Git | ❌ **Confirmado** (histórico desde commits antigos) |

### RLS (tabelas) — teste com chave anon

| Tabela | SELECT anon | INSERT anon |
|--------|-------------|-------------|
| campanhas, regras, copies, materiais, kits, destaques, angulos_divulgacao | permitido (público) | bloqueado em campanhas (42501) |

SELECT público é coerente com o site de divulgação. Escritas via anon estão bloqueadas nas tabelas; o risco real era a **API backend sem autenticação** (usa service role e ignora RLS).

### Storage

| Bucket | Público | List anon | Upload anon |
|--------|---------|-----------|-------------|
| stories | sim | ok | ❌ bloqueado |
| campanhas | sim | ok | ⚠️ **permitido sem login** |

Buckets `materiais`, `vídeos`, `kits` **não existem** no projeto (uploads usam `campanhas` / `stories`).

### Backend

| Item | Antes | Depois |
|------|-------|--------|
| CORS | `cors()` aberto | origins via `CORS_ORIGINS` |
| POST/PUT/DELETE campanhas/copies/regras/materiais | sem auth | `requireAuth` (JWT Supabase) |
| Erros 500 | `error.message` interno | mensagem genérica |
| Download legado | path traversal possível | bloqueia `..` `/` `\` |
| Log da URL Supabase no boot | sim | removido |

---

## ALTERAÇÕES

- `.gitignore` — ignora `.env` e `node_modules`
- `backend/.env` — removido do tracking Git (arquivo local preservado)
- `backend/.env.example` — template sem secrets
- `backend/middleware/requireAuth.js` — JWT Bearer obrigatório em escritas
- `backend/utils/httpErrors.js` — respostas 500 sem vazamento
- `backend/server.js` — CORS restrito + limite JSON 2mb
- `backend/config/supabase.js` — sem log de URL; valida env
- `backend/routes/campanhaRoutes.js` — auth + validação ID + erros seguros
- `backend/routes/materiaisRoutes.js` / `copiesRoutes.js` / `regras.js` — auth em POST
- `backend/routes/download.js` — validação de path
- `backend/routes/stats.js` / `destaque.js` / `angulosRoutes.js` — erros seguros
- `frontend/admin/supabase-client.js` — helpers de sessão/auth headers
- `frontend/admin/campanha-form.js` / `campanhas.js` / `dashboard.js` / `login.js` + HTMLs — sessão admin + Bearer nas escritas
- `database/fix-storage-campanhas-auth.sql` — SQL para restringir upload do bucket `campanhas`

---

## TESTES

| Teste | Resultado |
|-------|-----------|
| GET `/api/campanhas` sem auth | ✅ 200 |
| GET `/api/stats` / `/api/destaque` | ✅ 200 |
| POST/PUT/DELETE campanhas sem auth | ✅ 401 |
| POST copies/regras/materiais sem auth | ✅ 401 |
| Bearer inválido | ✅ 401 |
| Download com `..` no nome | ✅ 400 |
| SERVICE_ROLE no frontend | ✅ ausente |
| `.env` fora do `git ls-files` | ✅ |
| Upload anon no bucket campanhas | ⚠️ ainda permitido até aplicar o SQL |
| Fluxo admin autenticado completo (login + criar) | ⚠️ requer credencial real (não executado aqui) |

---

## PROBLEMAS ENCONTRADOS

1. **`backend/.env` no Git** (inclui service role) — removido do tracking; **rotar a chave no Supabase**
2. **API de escrita aberta** — corrigido com `requireAuth`
3. **Bucket `campanhas` aceita upload anônimo** — SQL em `database/fix-storage-campanhas-auth.sql` (aplicar no SQL Editor)
4. Possível copy órfã criada no teste intermediário (antes do restart) — verificar/limpar se `copies=1` com campanha inexistente

---

## AÇÃO MANUAL OBRIGATÓRIA

1. No Supabase: **Settings → API → Reset service_role key** (a chave antiga vazou no histórico Git/GitHub)
2. Atualizar `backend/.env` local com a nova chave
3. Executar `database/fix-storage-campanhas-auth.sql` no SQL Editor
4. Confirmar que uploads do admin (logado) continuam funcionando

---

## COMMIT

A ser registrado após o commit desta camada.

---

## PRÓXIMA CAMADA

Camada 3 — Uploads
