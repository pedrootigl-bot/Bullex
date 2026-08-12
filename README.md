# Bullex

Sistema web para **gerenciamento, organização e divulgação de campanhas promocionais**.

O Bullex centraliza campanhas, materiais, kits, copies, regras, visão geral estratégica e notificações administrativas em uma única plataforma — com área pública para divulgação e painel admin para operação.

---

## Sobre o projeto

A plataforma permite:

- Cadastrar e gerenciar campanhas
- Controlar ciclo de vida por datas (`agendada` → `ativa` → `finalizada`)
- Organizar materiais por formato (`stories`, `feed`, `videos`, `banners`)
- Disponibilizar copies, regras e ângulos de divulgação
- Baixar materiais individualmente ou o kit completo em ZIP
- Acompanhar estatísticas no dashboard
- Receber notificações automáticas do ciclo das campanhas

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js, Express |
| Banco / Auth / Storage | Supabase (PostgreSQL + Auth + Storage) |
| Segurança | JWT (Supabase Auth), RLS no Storage |

---

## Estrutura do repositório

```text
Bullex/
├── frontend/                 # Site público + painel admin
│   ├── index.html
│   ├── admin/                # Login, dashboard, campanhas, materiais, copies
│   ├── css/
│   ├── js/
│   ├── images/
│   └── downloads/
├── backend/                  # API REST
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── middleware/
│   ├── config/
│   └── .env.example
├── database/                 # Scripts SQL auxiliares
├── documents/                # Documentação de features
└── README.md
```

---

## Pré-requisitos

- Node.js 18+ (recomendado)
- Conta e projeto no [Supabase](https://supabase.com)
- Servidor estático para o frontend (ex.: Live Server, `npx serve`)

---

## Instalação

### 1. Clone

```bash
git clone https://github.com/pedrootigl-bot/Bullex.git
cd Bullex
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `backend/.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PORT=3000
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000
```

> A API usa `SUPABASE_SERVICE_ROLE_KEY` no servidor.  
> Nunca exponha a service role no frontend.

### 3. Subir a API

```bash
npm run dev
# ou
npm start
```

A API responde em `http://localhost:3000`.

### 4. Frontend

Abra a pasta `frontend/` com um servidor estático (ex.: extensão Live Server no VS Code/Cursor) e acesse:

- Site público: `frontend/index.html`
- Admin: `frontend/admin/login.html`

---

## Áreas do sistema

### Site público

- Destaque / “O que divulgar hoje”
- Listagem de campanhas ativas
- Calendário de oportunidades
- Modal unificado (materiais, visão geral, copies, regras)
- Download individual e kit ZIP

### Painel administrativo

- Dashboard com estatísticas
- CRUD de campanhas
- Materiais (upload múltiplo, formato de postagem)
- Copies e regras
- Central de notificações (sino no topbar)

---

## Status automático das campanhas

O status é derivado das datas (`America/Sao_Paulo`):

| Status | Condição | Site público |
|--------|----------|--------------|
| `agendada` | antes de `data_inicio` | oculta |
| `ativa` | no período da campanha | visível |
| `finalizada` | a partir de `data_fim` | oculta |

Detalhes: [`documents/status-automatico-campanhas.md`](documents/status-automatico-campanhas.md)

---

## Materiais por formato

Cada material possui:

- `tipo` → tipo do arquivo (`imagem`, `video`, `arquivo`)
- `formato` → categoria da postagem (`stories`, `feed`, `videos`, `banners`)

No modal público, os materiais são agrupados por `formato`.  
O kit ZIP é organizado em pastas equivalentes.

Detalhes: [`documents/formato-materiais.md`](documents/formato-materiais.md)

---

## Central de notificações

Tabela `notificacoes` no Supabase.

Eventos automáticos (sem duplicar):

- Campanha iniciada
- Campanha terminando em 7 / 3 dias / amanhã
- Campanha encerrada

Endpoints:

```http
GET  /api/notificacoes
PATCH /api/notificacoes/:id/lida
POST /api/notificacoes/sincronizar
```

Detalhes: [`documents/central-notificacoes.md`](documents/central-notificacoes.md)

---

## Principais endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/campanhas` | Lista campanhas (sincroniza status) |
| GET | `/api/campanhas/:id` | Detalhe da campanha |
| POST/PUT | `/api/campanhas` | Criar / atualizar (auth) |
| GET | `/api/materiais/:campanha_id` | Materiais da campanha |
| GET | `/api/copies/:campanha_id` | Copies |
| GET | `/api/regras/:campanha_id` | Regras |
| GET | `/api/kits/:campanha_id` | Kits |
| GET | `/api/angulos/:campanha_id` | Ângulos |
| GET | `/api/download/kit/:id` | ZIP do kit |
| GET | `/api/stats` | Estatísticas |
| GET | `/api/notificacoes` | Notificações (auth) |
| POST | `/api/upload` | Upload de arquivos (auth) |

---

## Banco e scripts

Scripts SQL auxiliares em `database/`:

- `add-campanha-visao-geral.sql`
- `add-materiais-formato.sql` (se aplicável no ambiente)
- `fix-storage-campanhas-auth.sql`

Documentação adicional em `documents/`.

---

## Fluxo operacional

```text
Admin cria campanha
      ↓
Define datas, visão geral, copies, regras, materiais
      ↓
Status automático (agendada / ativa / finalizada)
      ↓
Site público exibe apenas campanhas ativas
      ↓
Usuário baixa materiais ou kit ZIP
      ↓
Admin recebe notificações do ciclo da campanha
```

---

## Segurança

- Rotas de escrita protegidas com JWT (`requireAuth`)
- Frontend admin usa chave **anon** do Supabase
- Backend usa **service role** apenas no servidor
- RLS permanece habilitado no Supabase Storage
- Variáveis sensíveis apenas em `.env` (não versionado)

---

## Desenvolvimento

```bash
cd backend
npm run dev   # nodemon
```

Arquitetura:

```text
Frontend (estático)
    ↓
API REST (Express :3000)
    ↓
Supabase (PostgreSQL + Auth + Storage)
```

---

## Documentação relacionada

- [Status automático](documents/status-automatico-campanhas.md)
- [Formato de materiais](documents/formato-materiais.md)
- [Central de notificações](documents/central-notificacoes.md)
- [Visão geral da campanha](documents/visao-geral-campanha.md)
- [Camada 1 — testes](documents/camada-1-testes-sistema-atual.md)
- [Camada 2 — segurança](documents/camada-2-seguranca.md)

---

## Licença

Projeto privado, de uso interno.

---

Desenvolvido com foco em **organização, automação e experiência do usuário**.
