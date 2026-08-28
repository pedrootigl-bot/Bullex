# Download otimizado — Partner Hub

> Base de conhecimento: comportamento de download de materiais, story e kit após a atualização alinhada ao Partner Hub Shiver.

## Contexto

Antes, o frontend fazia `fetch → blob → <a download>` para arquivos individuais e o kit baixava cada item **em sequência** no backend com `zlib level 9` antes de enviar headers. A notificação do navegador demorava e a UI ficava sem feedback.

## UX

1. Ao clicar em **Baixar** (material, story ou kit), abre o modal **“Baixando arquivo”** com spinner.
2. Botões de download ficam desabilitados enquanto `isDownloading`.
3. Em erro / URL inválida, abre o dialog **arquivo indisponível** (não trava a UI).
4. Download “instantâneo” (arquivo único) mantém o modal ~**450ms** só para feedback visual.

## Frontend (HTML/JS estático)

Não há Partner Hub React neste repositório; o equivalente é:

| Shiver (React) | Bullex |
| --- | --- |
| `DownloadingDialog` | `#downloadingDialog` + CSS `download-dialogs.css` |
| Dialog indisponível | `#unavailableDownloadDialog` |
| `useAssetDownload` | `frontend/js/download-asset.js` → `window.BullexDownload` |
| `downloadAsset` | `BullexDownload.startDownload({ type, url, campanhaId, nome, label })` |

### Estratégia por tipo

| Tipo | Comportamento |
| --- | --- |
| Arquivo único (`type: "file"`) | Dispara `<a href>` em `/api/download/file?url=&nome=` **sem** esperar blob. Storage Supabase sempre via backend. Assets locais/relativos usam `<a>` direto. |
| Kit (`type: "kit"`) | `fetch` + `blob` em `/api/download/kit/:id` — o modal permanece até o ZIP estar pronto. |

Pontos de uso:

- Lista de materiais do modal (`modal.js`)
- **Baixar kit completo** (`#downloadKit`)
- **Baixar story** (`#highlightDownloadStory` em `destaque.js`)
- Seção auxiliar `#kitMateriais` (`materiais.js`)
- `campanha-modal.js` via `forcarDownloadArquivo` (delega ao `BullexDownload`)

## Backend (`backend/routes/download.js`)

### `GET /api/download/kit/:campanha_id`

- Baixa itens com concorrência limitada (**até 6** em paralelo).
- ZIP com `archiver` e `zlib: { level: 1 }` (mídia quase não comprime; level 9 só atrasava).
- Headers: `Content-Type: application/zip`, `Content-Disposition: attachment`, `Cache-Control: no-store`.

### `GET /api/download/file?url=&nome=`

- Prefere **stream** da URL pública (`fetch` + `Readable.fromWeb(...).pipe(res)`), enviando headers cedo.
- Fallback: download via Supabase Storage SDK (buffer).
- Buckets permitidos: `campanhas`, `stories`.

### `GET /api/download/:arquivo` (legado)

- Mantido; também envia `Cache-Control: no-store`.

## Critérios de aceite

- [x] Clique em Baixar → modal “Baixando arquivo” imediato
- [x] Arquivo individual → stream / notificação do browser mais cedo
- [x] Kit → modal até o ZIP; montagem mais rápida (paralelo + zlib 1)
- [x] Erro → dialog indisponível
- [x] Sem redesenho do hub / sem mudança de aquecimento-status

## Operação

Reiniciar a API Express para carregar a rota atualizada:

```bash
cd backend
npm run dev
# ou
npm start
```

Abrir o Partner Hub pela mesma origem da API (`http://localhost:3000`) e validar downloads com **Ctrl+F5**.
