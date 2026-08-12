# Formato de postagem nos materiais

## Objetivo

Separar claramente:

| Campo | Função | Valores |
|-------|--------|---------|
| `tipo` | Tipo do arquivo | `imagem`, `video`, `arquivo` |
| `formato` | Categoria da postagem | `stories`, `feed`, `videos`, `banners` |

## Supabase

A coluna `formato` (`text`, nullable) deve existir em `materiais`.

Script: `database/add-materiais-formato.sql`

```sql
ALTER TABLE materiais
ADD COLUMN IF NOT EXISTS formato text;
```

Não alterar nem remover a coluna `tipo`.

## Uso no sistema

- **Formulário (Nova/Editar campanha e Gerenciar materiais):** select **Formato da postagem**; `tipo` é inferido no upload.
- **API** `POST`/`PUT` `/api/materiais`: aceita e persiste `formato`; `GET` retorna `select *` (inclui `formato`).
- **Modal público:** agrupa por `formato` (Stories → Feed → Vídeos → Banners). Sem `formato`, tenta legado em `tipo` se for categoria; senão **Outros**.
- **Kit ZIP:** pastas `stories/`, `feed/`, `videos/`, `banners/`, `outros/`.

## Compatibilidade

Materiais antigos sem `formato` continuam válidos; aparecem em **Outros** (ou na categoria se `tipo` ainda guardar Stories/Feed/etc.).
