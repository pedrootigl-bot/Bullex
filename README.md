# 🚀 Bullex

Sistema web para gerenciamento e divulgação de campanhas promocionais, desenvolvido para centralizar informações, materiais de divulgação, regras e recursos de cada campanha em uma única plataforma.

O projeto permite que usuários visualizem campanhas ativas, consultem materiais disponíveis e acompanhem informações importantes, enquanto administradores conseguem cadastrar e gerenciar campanhas de forma dinâmica.

---

## 📌 Sobre o projeto

O **Bullex** nasceu com o objetivo de facilitar a organização e distribuição de campanhas de marketing.

A plataforma permite:

* Cadastro e gerenciamento de campanhas
* Divulgação de materiais promocionais
* Organização de kits completos de campanha
* Controle de regras e informações importantes
* Exibição dinâmica de conteúdos através de APIs
* Integração com banco de dados
* Área administrativa para gerenciamento

---

## 🛠️ Tecnologias utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript Vanilla
* Responsividade Mobile/Desktop
* Manipulação dinâmica do DOM
* Consumo de APIs REST

### Backend

* Node.js
* Express.js
* APIs REST
* Rotas organizadas por módulos

### Banco de dados

* Supabase
* PostgreSQL

Recursos utilizados:

* Tabelas relacionais
* Armazenamento de arquivos
* Consultas dinâmicas
* Integração via API

---

## 📂 Estrutura do projeto

```
Bullex/
│
├── frontend/
│   ├── index.html
│   ├── campanhas.html
│   ├── campanha-form.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── campanhas.js
│   │   ├── materiais.js
│   │   ├── kits.js
│   │   └── regras.js
│   │
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

* Cadastro de novas campanhas
* Visualização de campanhas disponíveis
* Exibição de informações principais
* Controle de datas
* Organização por categorias

---

## 📦 Materiais de divulgação

Cada campanha pode possuir materiais relacionados:

* Imagens
* Arquivos promocionais
* Conteúdos para divulgação
* Links de acesso

Os materiais são carregados dinamicamente através da API.

---

## 🎯 Kits completos

Sistema para disponibilizar um conjunto completo de materiais de uma campanha.

Exemplo:

* Artes para redes sociais
* Banners
* Documentos
* Arquivos complementares

---

## 📋 Regras da campanha

Cada campanha pode possuir regras específicas:

* Informações gerais
* Condições
* Orientações
* Regulamentos

---

## 🔐 Área administrativa

Funcionalidades administrativas:

* Criar campanhas
* Editar informações
* Gerenciar materiais
* Atualizar conteúdos
* Controlar dados enviados ao sistema

---

# 🔌 API

Exemplo de endpoints:

## Campanhas

```
GET /api/campanhas
```

Retorna campanhas cadastradas.

---

## Materiais

```
GET /api/materiais/:campanha_id
```

Retorna materiais vinculados a uma campanha.

---

## Kits

```
GET /api/kits/:campanha_id
```

Retorna o kit completo da campanha.

---

## Regras

```
GET /api/regras/:campanha_id
```

Retorna regras relacionadas à campanha.

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

Configure as variáveis de ambiente:

Crie um arquivo:

```
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

# 🚧 Desenvolvimento

O projeto está em evolução e novas funcionalidades podem ser adicionadas:

* Melhorias no painel administrativo
* Sistema de autenticação
* Upload de arquivos avançado
* Controle de permissões
* Dashboard com métricas
* Melhorias de UX/UI

---

# 📱 Responsividade

O sistema foi desenvolvido pensando em diferentes dispositivos:

✅ Desktop
✅ Tablet
✅ Mobile

Com layouts adaptáveis para facilitar o acesso aos usuários.

---

# 👨‍💻 Desenvolvedor

Projeto desenvolvido por:

**Pedro Tiago**

---

# 📄 Licença

Este projeto é privado e destinado ao uso interno.

---

⭐ Desenvolvido com foco em organização, escalabilidade e experiência do usuário.
