# 🚀 Bullex

Sistema web para **gerenciamento, organização e divulgação de campanhas promocionais**, desenvolvido para centralizar campanhas, materiais de divulgação, kits, copies, regras e informações estratégicas em uma única plataforma.

O Bullex possui uma área pública para apresentação das campanhas e uma área administrativa para gerenciamento dinâmico dos conteúdos através de integração com **Node.js, Express e Supabase**.

O projeto foi desenvolvido com foco em **organização, escalabilidade, automação de processos e experiência do usuário**.

---

# 📌 Sobre o projeto

O **Bullex** nasceu com o objetivo de facilitar o gerenciamento e a distribuição de campanhas de marketing.

A plataforma permite centralizar todas as informações necessárias para uma campanha, desde sua criação até a disponibilização dos materiais para divulgação.

Atualmente, o sistema conta com:

* Cadastro e gerenciamento de campanhas
* Campanhas dinâmicas
* Controle de datas de início e término
* Organização por categorias
* Copies de campanhas
* Regras e informações específicas
* Materiais de divulgação
* Imagens e vídeos
* Kits completos de campanha
* Download individual de materiais
* Download completo do kit em ZIP
* Upload de arquivos para armazenamento
* Dashboard administrativo
* Estatísticas do sistema
* Integração com Supabase
* Supabase Storage para arquivos
* Controle de acesso através de Row Level Security (RLS)
* APIs REST
* Interface administrativa para gerenciamento dos conteúdos

---

# 🛠️ Tecnologias utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript Vanilla
* Design responsivo
* Mobile/Desktop
* Manipulação dinâmica do DOM
* Consumo de APIs REST
* Modais dinâmicos
* Upload de arquivos
* Integração com o backend
* Integração com Supabase

## Backend

* Node.js
* Express.js
* APIs REST
* Rotas organizadas por módulos
* Integração com Supabase
* Gerenciamento de downloads
* Geração de arquivos ZIP
* Processamento de materiais

## Banco de dados

* Supabase
* PostgreSQL

Recursos utilizados:

* Tabelas relacionais
* Consultas dinâmicas
* Relacionamento entre campanhas e conteúdos
* Row Level Security (RLS)
* Supabase Storage
* Upload de arquivos
* Download de arquivos
* Integração através de API

---

# 📂 Estrutura do projeto

```text
Bullex/
│
├── frontend/
│   ├── index.html
│   ├── campanhas.html
│   ├── campanha-form.html
│   ├── admin/
│   │   ├── campanhas.html
│   │   ├── campanha-detalhes.html
│   │   └── ...
│   │
│   ├── css/
│   │   └── admin/
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── campanha-modal.js
│   │   ├── modal.js
│   │   ├── materiais.js
│   │   ├── stats.js
│   │   ├── destaque.js
│   │   └── ...
│   │
│   ├── images/
│   └── downloads/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── campanhas.js
│   │   ├── materiais.js
│   │   ├── kits.js
│   │   ├── regras.js
│   │   ├── destaque.js
│   │   ├── download.js
│   │   └── stats.js
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── config/
│
├── database/
│
├── README.md
└── package.json
```

---

# ✨ Funcionalidades

## 📢 Campanhas

O sistema possui gerenciamento dinâmico de campanhas.

É possível:

* Criar campanhas
* Editar campanhas
* Exibir campanhas
* Definir título
* Definir descrição
* Definir categoria
* Definir período
* Definir status
* Adicionar banner
* Adicionar imagem de card
* Adicionar cupom
* Adicionar conteúdos relacionados

As campanhas são carregadas dinamicamente através da API.

---

# 📅 Controle de campanhas

As campanhas possuem controle de período através de:

```text
data_inicio
data_fim
status
```

O sistema utiliza as datas da campanha para controlar sua disponibilidade no frontend.

A estrutura também está preparada para evolução do ciclo de vida das campanhas, incluindo:

```text
AGENDADA
   ↓
ATIVA
   ↓
ENCERRADA
```

---

# 📝 Copies

As campanhas podem possuir diferentes copies e conteúdos de comunicação.

O sistema permite organizar textos relacionados à campanha, possibilitando separar informações utilizadas na divulgação.

Exemplos:

* Headlines
* Textos promocionais
* CTAs
* Legendas
* Mensagens de campanha

---

# 🎨 Materiais de divulgação

Cada campanha pode possuir diversos materiais.

Atualmente a estrutura suporta diferentes tipos de conteúdo, incluindo:

* Imagens
* Vídeos
* Arquivos promocionais
* Artes para redes sociais
* Materiais complementares

Os materiais são relacionados à campanha através do banco de dados e carregados dinamicamente.

---

# 📱 Organização por tipo de publicação

Os materiais podem ser organizados de acordo com o formato de divulgação.

Exemplos:

```text
Feed
Stories
Reels
Vídeos
Banners
```

Isso permite que o usuário encontre mais facilmente o material que precisa para cada canal de divulgação.

---

# 📦 Kits completos

O Bullex possui um sistema de **kits de campanha**.

Um kit pode reunir diversos materiais relacionados a uma campanha.

Exemplo:

```text
Campanha Haval H6 GT
│
├── Feed
├── Stories
├── Reels
├── Vídeos
└── Banners
```

O usuário pode acessar os materiais individualmente ou baixar o kit completo.

---

# ⬇️ Download individual

Os materiais podem ser baixados individualmente.

Exemplo:

```text
Story 01
[Baixar]

Story 02
[Baixar]

Feed 01
[Baixar]
```

O sistema utiliza o armazenamento configurado no Supabase para disponibilizar os arquivos.

---

# 📦 Download do kit completo

Também foi implementado o download completo do kit.

Ao selecionar:

```text
Baixar kit completo
```

o backend:

1. Busca os arquivos relacionados à campanha
2. Localiza os materiais no Storage
3. Organiza os arquivos
4. Cria um arquivo ZIP
5. Disponibiliza o ZIP para download

A estrutura do arquivo pode ser organizada por categoria:

```text
Campanha-Haval-H6-GT/
│
├── Feed/
│   ├── feed-01.png
│   └── feed-02.png
│
├── Stories/
│   ├── story-01.png
│   └── story-02.png
│
├── Reels/
│   └── reels-01.mp4
│
└── Videos/
    └── video-01.mp4
```

---

# 📋 Regras da campanha

Cada campanha pode possuir regras específicas.

As regras são relacionadas à campanha e podem ser organizadas por ordem.

Exemplos:

* Condições de participação
* Informações gerais
* Orientações
* Regulamentos
* Critérios da campanha

A API permite buscar as regras relacionadas a uma campanha específica.

---

# 📊 Dashboard e estatísticas

O projeto possui estrutura para apresentar estatísticas administrativas.

Entre os dados disponíveis estão informações como:

* Quantidade de campanhas
* Quantidade de materiais
* Quantidade de copies
* Quantidade de vídeos

Esses dados são obtidos dinamicamente através da API.

---

# 🔐 Área administrativa

O Bullex possui uma área administrativa destinada ao gerenciamento das campanhas.

Entre as funcionalidades disponíveis estão:

* Criar campanhas
* Editar campanhas
* Gerenciar materiais
* Fazer upload de arquivos
* Gerenciar kits
* Gerenciar regras
* Gerenciar copies
* Visualizar informações das campanhas
* Acompanhar estatísticas
* Gerenciar conteúdos relacionados

---

# ☁️ Supabase Storage

Os arquivos de campanha são armazenados utilizando o **Supabase Storage**.

O sistema possui integração para:

* Upload de imagens
* Upload de vídeos
* Armazenamento de materiais
* Download de arquivos
* Download de kits completos

A estrutura de Storage foi configurada com políticas de acesso utilizando **Row Level Security**.

---

# 🔒 Segurança e RLS

O projeto utiliza políticas de **Row Level Security (RLS)** no Supabase para controlar operações relacionadas ao banco e armazenamento.

As políticas permitem controlar operações como:

* Upload
* Acesso aos arquivos
* Operações relacionadas às campanhas
* Controle de acesso ao Storage

O RLS permanece habilitado nas estruturas que utilizam políticas de segurança.

---

# 🔌 API

O backend disponibiliza APIs REST para comunicação entre frontend, backend e banco de dados.

## Campanhas

```http
GET /api/campanhas
```

Retorna as campanhas cadastradas.

---

## Materiais

```http
GET /api/materiais/:campanha_id
```

Retorna os materiais vinculados a uma campanha.

---

## Kits

```http
GET /api/kits/:campanha_id
```

Retorna os kits relacionados à campanha.

---

## Regras

```http
GET /api/regras/:campanha_id
```

Retorna as regras relacionadas à campanha.

---

## Download do kit

```http
GET /api/download/kit/:campanhaId
```

Gera e disponibiliza o download do kit completo da campanha em formato ZIP.

---

## Estatísticas

```http
GET /api/stats
```

Retorna informações estatísticas utilizadas no dashboard administrativo.

---

# 🔔 Sistema de notificações

A estrutura inicial da **Central de Notificações** já foi criada no banco de dados.

Tabela:

```text
notificacoes
```

Estrutura atual:

```text
notificacoes
├── id
├── created_at
├── campanha_id
├── tipo
├── titulo
├── mensagem
└── lida
```

A estrutura foi criada para suportar futuras automações, como:

* Campanha iniciada
* Campanha próxima do encerramento
* Campanha encerrada
* Novo material
* Novo kit
* Outras notificações administrativas

A implementação completa da central e da geração automática das notificações está prevista como próxima etapa de desenvolvimento.

---

# ⚙️ Automação de campanhas

O projeto já possui estrutura de controle baseada nas datas das campanhas.

O próximo estágio de evolução é consolidar a automação do ciclo de vida:

```text
Data de início
      ↓
AGENDADA
      ↓
ATIVA
      ↓
Data de término
      ↓
ENCERRADA
```

Essa estrutura poderá alimentar posteriormente o sistema de notificações e outras automações.

---

# 🗄️ Estrutura de dados

O projeto trabalha com diferentes entidades relacionadas às campanhas.

Entre elas:

```text
campanhas
regras
copies
materiais
kits
stats
notificacoes
```

Relacionamento conceitual:

```text
                 CAMPANHA
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
    REGRAS        COPIES      MATERIAIS
                                  │
                                  ↓
                                 KITS
                                  │
                                  ↓
                              DOWNLOADS
```

---

# 🔄 Fluxo de uma campanha

O fluxo atual do sistema pode ser representado da seguinte maneira:

```text
Criar campanha
      ↓
Adicionar informações
      ↓
Adicionar regras
      ↓
Adicionar copies
      ↓
Adicionar materiais
      ↓
Organizar materiais
      ↓
Criar/disponibilizar kit
      ↓
Campanha disponível
      ↓
Usuário acessa os materiais
      ↓
Download individual
      ou
Download do kit completo
```

---

# 📱 Responsividade

O sistema foi desenvolvido considerando diferentes dispositivos:

* ✅ Desktop
* ✅ Tablet
* ✅ Mobile

As interfaces administrativas e públicas possuem layouts adaptáveis para diferentes tamanhos de tela.

---

# 🚧 Próximas evoluções

O Bullex continua em desenvolvimento.

Entre as próximas funcionalidades planejadas estão:

* 🔔 Central de notificações
* 🤖 Automação de notificações
* 📥 Rastreamento de downloads
* ✅ Sistema de aprovação de materiais
* 📊 Dashboard com métricas avançadas
* 📅 Automação completa do ciclo de vida das campanhas
* 👤 Sistema de autenticação e permissões
* 🔐 Controle de acesso por usuário
* 📦 Melhorias no gerenciamento de kits
* 🤖 Integração com IA para criação de campanhas
* 📈 Relatórios de desempenho
* 🔄 Mais automações operacionais

---

# ⚙️ Instalação

Clone o projeto:

```bash
git clone https://github.com/pedrootigl-bot/Bullex.git
```

Entre na pasta:

```bash
cd Bullex
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente.

Crie um arquivo:

```text
.env
```

Adicione:

```env
SUPABASE_URL=sua_url
SUPABASE_KEY=sua_chave
PORT=3000
```

Execute o projeto:

```bash
npm start
```

---

# 🧪 Desenvolvimento

Durante o desenvolvimento, o projeto utiliza uma arquitetura separando:

```text
Frontend
    ↓
API REST
    ↓
Backend
    ↓
Supabase
    ↓
PostgreSQL / Storage
```

Essa separação permite evoluir cada camada de maneira independente e facilita a implementação de novas funcionalidades e automações.

---

# 🎯 Objetivo do projeto

O objetivo do Bullex é evoluir de uma plataforma de gerenciamento de campanhas para um sistema completo de **operação e automação de campanhas de marketing**.

A visão futura é permitir que o sistema automatize processos como:

```text
Criar campanha
      ↓
Gerar estrutura
      ↓
Adicionar materiais
      ↓
Organizar kit
      ↓
Publicar
      ↓
Notificar equipe
      ↓
Acompanhar downloads
      ↓
Acompanhar métricas
      ↓
Gerar relatório
```

---

# 👨‍💻 Desenvolvedor

Projeto desenvolvido por:

**Pedro Henrique Sá Pinheiro**

---

# 📄 Licença

Este projeto é privado e destinado ao uso interno.

---

⭐ Desenvolvido com foco em **organização, escalabilidade, automação e experiência do usuário**.
