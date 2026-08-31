# 🚀 Bullex

> Plataforma web para **gerenciamento, organização e divulgação de campanhas promocionais**, centralizando toda a operação de marketing em um único ambiente.

O **Bullex** permite que equipes administrativas criem e gerenciem campanhas, organizem materiais de divulgação, disponibilizem copies e regras, acompanhem estatísticas e automatizem notificações relacionadas ao ciclo de vida das campanhas.

A plataforma é dividida entre uma **área pública**, voltada à divulgação das campanhas, e um **painel administrativo**, utilizado para gerenciamento e operação interna.

---

## 📌 Visão geral

O Bullex foi desenvolvido para resolver um problema comum em operações de marketing: a dispersão de informações e materiais em diferentes ferramentas.

Com a plataforma, uma campanha pode concentrar em um único lugar:

* 📢 Informações da campanha
* 📅 Período de divulgação
* 🖼️ Materiais gráficos
* 🎥 Vídeos
* ✍️ Copies
* 📋 Regras
* 🎯 Ângulos de comunicação
* 📦 Kits completos de materiais
* 🔔 Notificações automáticas
* 📊 Estatísticas
* 👀 Visão geral estratégica

---

## ✨ Principais funcionalidades

### 📢 Gerenciamento de campanhas

* Criação e edição de campanhas
* Definição de período de início e término
* Controle automático do status
* Organização por categorias
* Banner e imagem de destaque
* Visão geral estratégica da campanha

### 📦 Gerenciamento de materiais

Os materiais podem ser organizados por diferentes formatos de publicação:

* Stories
* Feed
* Vídeos
* Banners

Cada material possui informações sobre seu tipo e formato, permitindo uma organização mais intuitiva no painel e na área pública.

Também é possível:

* Fazer upload de múltiplos arquivos
* Visualizar materiais
* Baixar arquivos individualmente
* Baixar todos os materiais como um kit `.ZIP`
* Organizar automaticamente o ZIP por formato de postagem

### ✍️ Copies

Cada campanha pode possuir diferentes copies para utilização na divulgação, permitindo que a equipe tenha textos prontos e organizados em um único lugar.

### 📋 Regras

As regras da campanha ficam vinculadas diretamente à campanha e são apresentadas na área pública para facilitar o acesso às informações.

### 🎯 Ângulos de divulgação

O sistema permite cadastrar diferentes ângulos estratégicos para orientar a comunicação e divulgação das campanhas.

### 📊 Dashboard

O painel administrativo apresenta indicadores relacionados ao sistema, incluindo:

* Campanhas
* Materiais
* Copies
* Vídeos
* Outros indicadores operacionais

### 🔔 Central de notificações

O Bullex possui uma central de notificações administrativa que acompanha automaticamente o ciclo das campanhas.

São geradas notificações para eventos como:

* 🚀 Campanha iniciada
* ⏳ Campanha terminando em 7 dias
* ⏳ Campanha terminando em 3 dias
* ⚠️ Campanha terminando amanhã
* 🏁 Campanha encerrada

O sistema evita a criação de notificações duplicadas.

---

# 🏗️ Arquitetura

A aplicação utiliza uma arquitetura dividida em três principais camadas:

```text
┌──────────────────────────────┐
│          Frontend            │
│       HTML / CSS / JS        │
└──────────────┬───────────────┘
               │
               │ HTTP / REST
               ▼
┌──────────────────────────────┐
│           Backend            │
│       Node.js / Express      │
└──────────────┬───────────────┘
               │
               │ Supabase SDK
               ▼
┌──────────────────────────────┐
│           Supabase           │
│ PostgreSQL / Auth / Storage  │
└──────────────────────────────┘
```

### Fluxo principal

```text
Administrador
      │
      ▼
Painel Administrativo
      │
      ▼
API REST
      │
      ▼
Supabase
      │
      ├── PostgreSQL
      ├── Authentication
      └── Storage
      │
      ▼
Área Pública
      │
      ▼
Usuário final
```

---

# 🛠️ Stack

| Camada                      | Tecnologia              |
| --------------------------- | ----------------------- |
| Frontend                    | HTML5, CSS3, JavaScript |
| Backend                     | Node.js + Express       |
| Banco de dados              | PostgreSQL              |
| Backend as a Service        | Supabase                |
| Autenticação                | Supabase Auth           |
| Armazenamento               | Supabase Storage        |
| Segurança                   | JWT + RLS               |
| Controle de versão          | Git + GitHub            |
| Ambiente de desenvolvimento | Node.js + Nodemon       |

---

# 📁 Estrutura do projeto

```text
Bullex/
│
├── frontend/
│   ├── index.html
│   │
│   ├── admin/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── campanhas.html
│   │   ├── campanha-detalhes.html
│   │   └── ...
│   │
│   ├── css/
│   │   ├── admin/
│   │   └── ...
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── campanhas.js
│   │   ├── materiais.js
│   │   ├── campanha-modal.js
│   │   ├── stats.js
│   │   └── ...
│   │
│   ├── images/
│   └── downloads/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── middleware/
│   ├── config/
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── *.sql
│
├── documents/
│   └── *.md
│
└── README.md
```

---

# ⚙️ Pré-requisitos

Antes de executar o projeto, tenha instalado:

* [Node.js](https://nodejs.org/) 18 ou superior
* Git
* Um projeto no [Supabase](https://supabase.com/)
* VS Code, Cursor ou outro editor de código
* Um servidor HTTP para executar o frontend

---

# 🚀 Instalação

## 1. Clonar o repositório

```bash
git clone https://github.com/pedrootigl-bot/Bullex.git
cd Bullex
```

---

## 2. Instalar dependências do backend

```bash
cd backend
npm install
```

---

## 3. Configurar variáveis de ambiente

Crie o arquivo:

```text
backend/.env
```

Utilizando `.env.example` como referência:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

PORT=3000

CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000
```

### ⚠️ Importante

A variável:

```env
SUPABASE_SERVICE_ROLE_KEY
```

deve existir **somente no backend**.

Nunca coloque a Service Role Key em arquivos JavaScript do frontend ou em qualquer arquivo versionado.

---

# ▶️ Executando o projeto

## Backend

Dentro da pasta `backend`:

```bash
npm run dev
```

Ou:

```bash
npm start
```

A API ficará disponível em:

```text
http://localhost:3000
```

---

## Frontend

Execute a pasta `frontend` através de um servidor HTTP.

Por exemplo, utilizando o Live Server do VS Code/Cursor.

### Área pública

```text
frontend/index.html
```

### Painel administrativo

```text
frontend/admin/login.html
```

---

# 🗄️ Banco de dados

O Bullex utiliza o **Supabase PostgreSQL** para armazenar os dados da aplicação.

Entre as principais entidades utilizadas estão:

```text
campanhas
│
├── materiais
├── copies
├── regras
├── kits
├── angulos
├── notificacoes
└── estatísticas
```

Os arquivos SQL auxiliares ficam disponíveis em:

```text
database/
```

Exemplos:

```text
database/
├── add-campanha-visao-geral.sql
├── add-materiais-formato.sql
└── fix-storage-campanhas-auth.sql
```

---

# 📅 Status automático das campanhas

O status das campanhas é determinado automaticamente com base nas datas da campanha.

Timezone utilizado:

```text
America/Sao_Paulo
```

| Status       | Condição                         | Área pública |
| ------------ | -------------------------------- | ------------ |
| `agendada`   | Antes de `data_inicio`           | Oculta       |
| `ativa`      | Entre `data_inicio` e `data_fim` | Visível      |
| `finalizada` | A partir de `data_fim`           | Oculta       |

Fluxo:

```text
       AGENDADA
    │
    │ Pré Aquecimento
    │ data_inicio
    ▼
 ATIVA
    │
    │ data_fim
    ▼
FINALIZADA
```

Documentação:

`documents/status-automatico-campanhas.md`

---

# 🖼️ Organização dos materiais

Os materiais possuem duas classificações principais.

### Tipo do arquivo

```text
imagem
video
arquivo
```

### Formato da publicação

```text
stories
feed
videos
banners
```

Exemplo:

```text
Campanha
│
├── Stories
│   ├── imagem
│   └── video
│
├── Feed
│   └── imagem
│
├── Vídeos
│   └── video
│
└── Banners
    └── imagem
```

No painel administrativo, os materiais podem ser gerenciados individualmente.

Na área pública, eles são agrupados por formato.

---

# 📦 Download de materiais

O usuário pode escolher entre:

### Download individual

Baixa somente o arquivo selecionado.

### Download do kit completo

Baixa todos os materiais da campanha em um único arquivo:

```text
kit-campanha.zip
```

O ZIP mantém a organização por formato:

```text
kit-campanha.zip
│
├── stories/
│   ├── material-01.png
│   └── material-02.png
│
├── feed/
│   └── material-03.png
│
├── videos/
│   └── video-01.mp4
│
└── banners/
    └── banner-01.png
```

Endpoint:

```http
GET /api/download/kit/:id
```

---

# 🔔 Sistema de notificações

As notificações são armazenadas na tabela:

```text
notificacoes
```

O sistema possui sincronização automática para identificar mudanças no ciclo das campanhas.

### Eventos

```text
Campanha iniciada
        ↓
Campanha terminando em 7 dias
        ↓
Campanha terminando em 3 dias
        ↓
Campanha terminando amanhã
        ↓
Campanha encerrada
```

### Endpoints

```http
GET   /api/notificacoes
PATCH /api/notificacoes/:id/lida
POST  /api/notificacoes/sincronizar
```

Documentação:

`documents/central-notificacoes.md`

---

# 🔌 API

Principais endpoints disponíveis:

| Método | Endpoint                      | Descrição            |
| ------ | ----------------------------- | -------------------- |
| `GET`  | `/api/campanhas`              | Lista campanhas      |
| `GET`  | `/api/campanhas/:id`          | Detalha uma campanha |
| `POST` | `/api/campanhas`              | Cria campanha        |
| `PUT`  | `/api/campanhas`              | Atualiza campanha    |
| `GET`  | `/api/materiais/:campanha_id` | Lista materiais      |
| `GET`  | `/api/copies/:campanha_id`    | Lista copies         |
| `GET`  | `/api/regras/:campanha_id`    | Lista regras         |
| `GET`  | `/api/kits/:campanha_id`      | Lista kits           |
| `GET`  | `/api/angulos/:campanha_id`   | Lista ângulos        |
| `GET`  | `/api/download/kit/:id`       | Gera/download do ZIP |
| `GET`  | `/api/stats`                  | Retorna estatísticas |
| `GET`  | `/api/notificacoes`           | Lista notificações   |
| `POST` | `/api/upload`                 | Realiza upload       |

> Rotas administrativas e operações de escrita exigem autenticação.

---

# 🔐 Segurança

O projeto utiliza diferentes camadas de proteção.

### Autenticação

O painel administrativo utiliza:

```text
Supabase Auth
        ↓
JWT
        ↓
Middleware requireAuth
        ↓
API protegida
```

### Row Level Security

O Supabase Storage utiliza políticas de **RLS** para controlar operações de acesso aos arquivos.

### Service Role

A `SUPABASE_SERVICE_ROLE_KEY` é utilizada exclusivamente no backend.

### Variáveis de ambiente

Informações sensíveis devem permanecer em:

```text
backend/.env
```

E nunca devem ser commitadas no Git.

---

# 🔄 Fluxo operacional

```text
┌─────────────────────┐
│ Admin cria campanha │
└──────────┬──────────┘
           ↓
┌──────────────────────────────┐
│ Define datas e informações  │
│ Copies, regras e materiais  │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────┐
│ Status automático        │
│ agendada / ativa / fim   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│ Área pública             │
│ exibe campanhas ativas   │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│ Usuário acessa materiais │
└──────────┬───────────────┘
           ↓
     ┌─────┴─────┐
     ↓           ↓
 Download      Kit ZIP
 individual    completo
```

---

# 📚 Documentação

Documentações técnicas e funcionais adicionais estão disponíveis em:

```text
documents/
```

### Status automático

`documents/status-automatico-campanhas.md`

### Formato dos materiais

`documents/formato-materiais.md`

### Central de notificações

`documents/central-notificacoes.md`

### Visão geral da campanha

`documents/visao-geral-campanha.md`

### Testes

`documents/camada-1-testes-sistema-atual.md`

### Segurança

`documents/camada-2-seguranca.md`

---

# 🧪 Desenvolvimento

Para iniciar o backend em modo de desenvolvimento:

```bash
cd backend
npm run dev
```

O projeto utiliza **Nodemon** para reiniciar automaticamente o servidor durante alterações no código.

Arquitetura local:

```text
Frontend
   │
   │ HTTP
   ▼
Express API
   │
   │ Supabase SDK
   ▼
Supabase
   ├── PostgreSQL
   ├── Auth
   └── Storage
```

---

# 🌎 Variáveis de ambiente

| Variável                    | Descrição                       |
| --------------------------- | ------------------------------- |
| `SUPABASE_URL`              | URL do projeto Supabase         |
| `SUPABASE_KEY`              | Chave pública/anon              |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave administrativa do backend |
| `PORT`                      | Porta da API                    |
| `CORS_ORIGINS`              | Origens autorizadas             |

---

# 🚧 Status do projeto

**Em desenvolvimento ativo.**

O núcleo da plataforma já contempla:

* [x] Gerenciamento de campanhas
* [x] Status automático
* [x] Dashboard administrativo
* [x] Materiais por formato
* [x] Upload de arquivos
* [x] Downloads individuais
* [x] Download de kit completo em ZIP
* [x] Copies
* [x] Regras
* [x] Ângulos de divulgação
* [x] Central de notificações
* [x] Autenticação administrativa
* [x] Supabase Storage
* [x] Políticas de segurança
* [x] API REST

---

# 🔮 Próximos passos

Possíveis evoluções da plataforma:

* [ ] Melhorias no dashboard
* [ ] Mais indicadores e métricas
* [ ] Melhorias na gestão de permissões
* [ ] Histórico de alterações
* [ ] Auditoria de ações administrativas
* [ ] Melhorias de UX/UI
* [ ] Testes automatizados
* [ ] CI/CD
* [ ] Deploy em ambiente de produção
* [ ] Monitoramento e observabilidade

---

# 👨‍💻 Desenvolvedor

**Pedro Henrique Sá Pinheiro**

Desenvolvimento e implementação da plataforma Bullex.

---

# 📄 Licença

Projeto **privado e de uso interno**.

Todos os direitos reservados.

---

<div align="center">

### 🚀 Bullex

**Organização • Automação • Performance • Experiência**

Desenvolvido para centralizar e simplificar a operação de campanhas promocionais.

</div>
