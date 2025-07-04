# Documentação Detalhada do Projeto: Sistema de Questões e Provas

## Sumário

- [Visão Geral](#visão-geral)
- [Estrutura de Pastas e Arquivos](#estrutura-de-pastas-e-arquivos)
- [Fluxo de Funcionamento](#fluxo-de-funcionamento)
- [Detalhamento dos Arquivos](#detalhamento-dos-arquivos)
  - [Raiz do Projeto](#raiz-do-projeto)
  - [src/](#src)
    - [components/](#components)
    - [contexts/](#contexts)
    - [pages/](#pages)
    - [services/](#services)
    - [types/](#types)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Observações](#observações)

---

## Visão Geral

Este projeto é um sistema web para gerenciamento de questões e provas, desenvolvido com React, TypeScript, Vite e Tailwind CSS. Permite cadastrar, editar, listar e excluir questões e provas, além de autenticação simples de usuário.

---

## Estrutura de Pastas e Arquivos

```
project/
│
├── index.html
├── package.json
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js, postcss.config.js
├── eslint.config.js
│
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── vite-env.d.ts
    │
    ├── components/
    │   ├── Button.tsx
    │   ├── Layout.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── Modal.tsx
    │   └── ProtectedRoute.tsx
    │
    ├── contexts/
    │   └── AuthContext.tsx
    │
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── ExamForm.tsx
    │   ├── Exams.tsx
    │   ├── Login.tsx
    │   ├── QuestionForm.tsx
    │   └── Questions.tsx
    │
    ├── services/
    │   └── api.ts
    │
    └── types/
        └── index.ts
```

---

## Fluxo de Funcionamento

1. **Login**: Usuário faz login (qualquer email/senha, simulado).
2. **Dashboard**: Exibe estatísticas e atalhos.
3. **Banco de Questões**: Gerencia questões (listar, filtrar, criar, editar, excluir).
4. **Área de Provas**: Gerencia provas (listar, visualizar, criar, editar, excluir).
5. **Formulários**: Para criar/editar questões e provas, com validações.
6. **Navegação**: Menu superior e responsivo, com logout.

---

## Detalhamento dos Arquivos

### Raiz do Projeto

- **index.html**: HTML principal, ponto de entrada da aplicação. Possui a div `#root` onde o React renderiza a aplicação.
- **package.json**: Gerencia dependências, scripts (dev, build, lint, preview) e metadados do projeto.
- **tsconfig.json, tsconfig.app.json, tsconfig.node.json**: Configurações do TypeScript para diferentes contextos (aplicação, node, referências).
- **vite.config.ts**: Configuração do Vite (build, plugins, etc). Usa o plugin React.
- **tailwind.config.js / postcss.config.js**: Configurações do Tailwind CSS e PostCSS para estilização.
- **eslint.config.js**: Configuração do ESLint para padronização de código.

### src/

#### App.tsx

- Define as rotas da aplicação usando React Router.
- Usa o `AuthProvider` para prover autenticação global.
- Rotas protegidas por `ProtectedRoute` (Dashboard, Questões, Provas).
- Rotas:
  - `/login`: Tela de login
  - `/`: Dashboard
  - `/questions`, `/questions/new`, `/questions/:id`: Listagem, criação e edição de questões
  - `/exams`, `/exams/new`, `/exams/:id`: Listagem, criação e edição de provas

#### main.tsx

- Ponto de entrada do React. Renderiza o App no DOM na div `#root`.

#### index.css

- Importa estilos do Tailwind CSS.

#### vite-env.d.ts

- Tipos globais do Vite para TypeScript.

---

### components/

- **Button.tsx**: Botão customizável com variantes (primary, secondary, success, danger, outline), tamanhos, ícones e loading. Usado em toda a aplicação para ações.
- **Layout.tsx**: Layout principal da aplicação. Inclui barra de navegação superior, menu responsivo (mobile), saudação ao usuário e botão de logout. Renderiza o conteúdo das páginas via `<Outlet />`.
- **LoadingSpinner.tsx**: Componente de loading animado, usado para indicar carregamento de dados.
- **Modal.tsx**: Componente de modal reutilizável para exibir diálogos, visualizações e confirmações.
- **ProtectedRoute.tsx**: Protege rotas, redirecionando para login se o usuário não estiver autenticado.

---

### contexts/

- **AuthContext.tsx**: Contexto de autenticação. Gerencia login, logout e estado do usuário. Fornece hook `useAuth` para acessar o usuário e funções de autenticação em qualquer componente.

---

### pages/

- **Dashboard.tsx**: Página inicial após login. Mostra estatísticas (total de questões, provas, disciplinas, média de questões por prova), atalhos para áreas principais e disciplinas com mais questões.
- **Login.tsx**: Tela de login. Usa o AuthContext para autenticação. Qualquer email/senha é aceito (simulado).
- **Questions.tsx**: Lista e filtra questões cadastradas. Permite excluir questões. Filtros por texto, disciplina e assunto.
- **QuestionForm.tsx**: Formulário para criar ou editar questões, incluindo enunciado, disciplina, assuntos (tags) e 5 alternativas (com seleção da correta). Validações obrigatórias.
- **Exams.tsx**: Lista provas cadastradas, permite visualizar detalhes, editar e excluir provas.
- **ExamForm.tsx**: Formulário para criar ou editar provas, selecionando questões do banco. Permite filtrar questões, adicionar/remover questões da prova e visualizar detalhes de cada questão.

---

### services/

- **api.ts**: Simula uma API REST com dados mockados para questões e provas. Fornece funções para:
  - Listar, buscar, criar, editar e excluir questões
  - Listar, buscar, criar, editar e excluir provas
  - Simula delays de rede para testes de loading
  - Para produção, substitua pelas chamadas reais de API

---

### types/

- **index.ts**: Define interfaces TypeScript para padronizar os dados:
  - `User`: Usuário autenticado
  - `Alternative`: Alternativa de questão (id, descrição, se é correta)
  - `Question`: Questão (id, título, disciplina, assuntos, alternativas)
  - `Exam`: Prova (id, disciplina, título, quantidade de questões, questões)
  - `ExamRequest`: Estrutura para criar/editar provas (disciplina, título, ids das questões)

---

## Tecnologias Utilizadas

- **React**: Biblioteca principal para UI.
- **TypeScript**: Tipagem estática.
- **Vite**: Bundler e servidor de desenvolvimento.
- **Tailwind CSS**: Estilização rápida e responsiva.
- **Lucide React**: Ícones SVG.
- **React Router DOM**: Gerenciamento de rotas.
- **ESLint**: Padronização de código.

---

## Observações

- O backend é simulado (mock) em `src/services/api.ts`. Para produção, substitua pelas chamadas reais de API.
- O sistema é responsivo e utiliza componentes reutilizáveis para facilitar manutenção e expansão.
- O login é apenas simulado, sem autenticação real.

---
#   G e n e r a t o r T e s t W e b  
 #   G e n e r a t o r T e s t  
 