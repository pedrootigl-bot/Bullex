# Visão geral da campanha (formulário admin)

## Campos adicionados

No formulário **Nova Campanha** / edição:

| Campo | UI | Persistência |
|-------|----|--------------|
| Público recomendado | texto livre | `campanhas.publico_recomendado` |
| Objetivo | chips (Retenção, Redepósito, Aquisição, Volume) | `campanhas.objetivo` (ex.: `Retenção · Volume`) |
| Mecânica | lista numerada editável | `campanhas.mecanica` (JSON array) |
| Ângulos de divulgação | cards título + descrição | tabela `angulos_divulgacao` |
| Descrição curta | texto curto sob o título no modal | `campanhas.descricao` |
| Resumo | seção RESUMO na aba Visão geral | `campanhas.resumo` |
| Texto do header | título grande só no hero da home | `campanhas.texto_header` |

## SQL necessário

Executar no Supabase SQL Editor:

`database/add-campanha-visao-geral.sql`

## API

- `POST/PUT /api/campanhas` aceitam `publico_recomendado` e `mecanica`
- `POST /api/angulos` cria ângulo (auth)
- `GET /api/angulos/:campanha_id` lista ângulos
