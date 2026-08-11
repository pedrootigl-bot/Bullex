# Camada 1 — Testes do Sistema Atual

**Data:** 2026-08-11  
**Base:** commit `d39455d` (checkpoint antes das otimizações), pós `dd1a20a` (Post do Dia)  
**Ambiente:** backend local (`node server.js` porta 3000) + frontend estático; sem Docker

---

## STATUS

✅ Concluída (com limitações de cobertura em uploads autenticados e ZIP com arquivos reais no Storage)

---

## ANÁLISE

### Estrutura relevante

| Área | Arquivos principais |
|------|---------------------|
| Post do Dia | `frontend/js/destaque.js`, `frontend/js/calendario.js`, `backend/routes/destaque.js` |
| Campanhas CRUD | `backend/routes/campanhaRoutes.js`, `frontend/admin/campanhas.js`, `campanha-form.js` |
| Detalhes | `materiaisRoutes.js`, `copiesRoutes.js`, `regras.js`, `kits.js` |
| ZIP | `backend/routes/download.js` |
| Dashboard | `backend/routes/stats.js`, `frontend/admin/dashboard.js` |

### Post do Dia — regra atual

1. Campanha vigente hoje (`data_inicio <= hoje <= data_fim`), priorizando `status === "ativa"`
2. Senão, próxima futura por `data_inicio`
3. Senão, fallback `GET /api/destaque`

A mesma lógica existe em `destaque.js` e `calendario.js` (duplicação a tratar na Camada 6).

### Estado do banco no início dos testes

- `campanhas`, `materiais`, `copies`, `regras`, `kits`: **vazios**
- `destaques`: 1 registro ativo (fallback “Post do dia”)

---

## ALTERAÇÕES

| Arquivo | Descrição |
|---------|-----------|
| `backend/routes/kits.js` | Filtra kits por `campanha_id`; valida ID inválido (400) |
| `backend/routes/download.js` | Baixa buffers **antes** de abrir resposta ZIP; evita ZIP vazio/corrupto com `Content-Type: application/zip` |

---

## TESTES

### Post do Dia (unitário)

| Caso | Resultado |
|------|-----------|
| Campanha ativa hoje | ✅ |
| Sem ativa → futura mais próxima | ✅ |
| Duas futuras | ✅ escolhe a mais próxima |
| Várias vigentes → prioriza `status=ativa` | ✅ |
| Só encerrada → `null` (fallback API) | ✅ |
| Datas iguais (`inicio=fim=hoje`) | ✅ |
| Lista vazia → `null` | ✅ |

### Post do Dia (API + browser)

| Caso | Resultado |
|------|-----------|
| Ativa + futura no banco → escolhe ativa | ✅ |
| Sem campanhas → fallback `/api/destaque` no DOM | ✅ (`#highlightTitle` = “Post do dia”) |

### Campanhas CRUD

| Caso | Resultado |
|------|-----------|
| Criar | ✅ 201 |
| Ler | ✅ 200 |
| Editar | ✅ 200 |
| Excluir + cascata de vínculos | ✅ 200 / 404 após delete |

### Detalhes / associações por `campanha_id`

| Recurso | Filtro | Resultado |
|---------|--------|-----------|
| Regras | `.eq("campanha_id")` | ✅ |
| Copies | `.eq("campanha_id")` | ✅ |
| Materiais | `.eq("campanha_id")` | ✅ |
| Kits | **antes:** sem filtro / **depois:** com filtro | ✅ corrigido |

### Kits / ZIP

| Caso | Antes | Depois |
|------|-------|--------|
| Kit/campanha sem arquivos | 404 JSON | ✅ 404 JSON |
| Registro com URL inválida | 404 com `Content-Type: application/zip` | ✅ 404 `application/json` |
| ZIP com arquivos reais no Storage | Não testável (banco/storage sem arquivos válidos) | ⚠️ Pendente reteste com dados reais |
| Upload autenticado (imagem/banner/material/vídeo/kit) | Requer sessão admin no Supabase | ⚠️ Não executado nesta camada |

### Dashboard / Stats

| Caso | Resultado |
|------|-----------|
| `GET /api/stats` com dados temporários | ✅ contagens coerentes |
| Após limpeza | ✅ zera |

---

## PROBLEMAS ENCONTRADOS

1. **`GET /api/kits/:campanha_id` ignorava `campanha_id`** — retornava todos os kits. **Corrigido.**
2. **Download ZIP** abria resposta `application/zip` antes de garantir buffers — falha total gerava resposta inconsistente. **Corrigido.**
3. **Banco sem campanhas/materiais/kits** no momento do teste — limita validação de ZIP feliz e uploads reais.
4. **Uploads** ocorrem no frontend direto ao Supabase Storage (não via backend) — cobertura completa depende de login admin (Camada 3).
5. **Lógica do Post do Dia duplicada** em destaque + calendário — observação para Camada 6 (não alterado agora).

---

## COMMIT

A ser registrado após `git commit` desta camada.

---

## PRÓXIMA CAMADA

Camada 2 — Segurança
