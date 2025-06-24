# Sistema de Gerenciamento de Provas e Questões

## Visão Geral

Este projeto é uma plataforma web para gerenciamento de questões e provas, permitindo:

- Cadastro, edição, remoção e listagem de questões.
- Cadastro, edição, remoção e listagem de provas (exames).
- Filtros por disciplina, assunto e busca textual.
- Autenticação de usuários.

O sistema é composto por:

- **Frontend React** (TypeScript)
- **Backend Node.js (Express)** conectado a um banco de dados SQL Server

---

## Estrutura de Pastas

```
project/
│
├── src/
│   ├── components/         # Componentes reutilizáveis (Button, Modal, Layout, etc)
│   ├── contexts/           # Contextos React (ex: AuthContext)
│   ├── pages/              # Páginas principais (Dashboard, Login, Questions, Exams, ExamForm, etc)
│   ├── services/           # Serviços de API (api.ts)
│   ├── types.ts            # Tipos TypeScript compartilhados
│   └── App.tsx             # Componente principal de rotas
│
├── server.cjs              # Backend Express + SQL Server
├── package.json            # Dependências do projeto
└── ...                     # Outros arquivos de configuração
```

---

## Backend (`server.cjs`)

- **Express** para rotas HTTP.
- **SQL Server** para persistência.
- **CORS** e **JSON** habilitados.

### Principais Rotas

- `/api/questoes` - CRUD de questões
- `/api/provas` - CRUD de provas
- `/api/provas/:id/export` - Exporta prova para PDF
- `/api/dashboard` - Métricas gerais

---

## Frontend

### Principais arquivos

- **src/App.tsx**  
  Define as rotas da aplicação, protegendo as páginas principais com autenticação.

- **src/services/api.ts**  
  Serviço centralizado para chamadas à API.

#### Exemplo de uso do serviço de API:

```typescript
// Buscar todas as provas
const provas = await api.getExams();

// Exportar uma prova para PDF
await api.exportExamToPDF(idProva);
```

---

## Exemplo de Serviço de API (`src/services/api.ts`)

```typescript
import { Question, Exam } from "../types";

const API_URL = "http://localhost:5000/api";

export const api = {
  // Buscar prova por ID
  async getExam(id: number): Promise<Exam> {
    const res = await fetch(`${API_URL}/provas/${id}`);
    if (!res.ok) throw new Error("Prova não encontrada");
    return res.json();
  },

  // Filtrar questões
  async getQuestions(
    disciplina?: string,
    assunto?: string
  ): Promise<Question[]> {
    const params = new URLSearchParams();
    if (disciplina) params.append("disciplina", disciplina);
    if (assunto) params.append("assunto", assunto);
    const res = await fetch(`${API_URL}/questoes?${params.toString()}`);
    if (!res.ok) throw new Error("Erro ao buscar questões");
    return res.json();
  },

  // Buscar questão por ID
  async getQuestion(id: number): Promise<Question> {
    const res = await fetch(`${API_URL}/questoes/${id}`);
    if (!res.ok) throw new Error("Questão não encontrada");
    return res.json();
  },

  // Inserir questão
  async createQuestion(data: {
    Titulo: string;
    Disciplina: string;
    Assuntos: string[];
    alternatives?: { description: string; isCorrect: boolean }[];
  }): Promise<Question> {
    const res = await fetch(`${API_URL}/questoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar questão");
    return res.json();
  },

  // Atualizar questão
  async updateQuestion(
    id: number,
    data: {
      Titulo: string;
      Disciplina: string;
      Assuntos: string[];
      alternatives?: { description: string; isCorrect: boolean }[];
    }
  ): Promise<Question> {
    const res = await fetch(`${API_URL}/questoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar questão");
    return res.json();
  },

  // Remover questão
  async deleteQuestion(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/questoes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir questão");
  },

  // Inserir prova
  async createExam(data: {
    Disciplina: string;
    Titulo: string;
    IdsQuestoes: number[];
  }): Promise<Exam> {
    const res = await fetch(`${API_URL}/provas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar prova");
    return res.json();
  },

  // Atualizar prova
  async updateExam(
    id: number,
    data: { Disciplina: string; Titulo: string; IdsQuestoes: number[] }
  ): Promise<Exam> {
    const res = await fetch(`${API_URL}/provas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar prova");
    return res.json();
  },

  // Remover prova
  async deleteExam(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/provas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao excluir prova");
  },

  // Listar provas
  async getExams(): Promise<Exam[]> {
    const res = await fetch(`${API_URL}/provas`);
    if (!res.ok) throw new Error("Erro ao buscar provas");
    return res.json();
  },
};
```

---

## Como Rodar o Projeto

1. **Instale as dependências:**

   ```
   npm install
   ```

2. **Configure o banco de dados SQL Server**  
   (Ajuste a string de conexão no backend conforme necessário.)

3. **Rode o backend:**

   ```
   node server.cjs
   ```

4. **Rode o frontend:**

   ```
   npm start
   ```

5. **Acesse:**  
   [http://localhost:3000](http://localhost:3000)

---

## Observações

- O projeto é modular e fácil de expandir.
- Para adicionar novos campos, basta ajustar os tipos, formulários e rotas.
- Para dúvidas, consulte os comentários no código e esta documentação.
