# Documentação da API - Sistema de Provas e Questões

## Visão Geral

Esta API foi criada para servir como backend de um sistema de gerenciamento de questões e provas, permitindo cadastro, edição, remoção, listagem e filtragem de questões e provas. Ela foi desenvolvida em **Node.js** utilizando o framework **Express** e conecta-se a um banco de dados **SQL Server** para persistência dos dados.

---

## Como a API foi criada

- **Tecnologias:** Node.js, Express, mssql, cors, jsonwebtoken
- **Banco de Dados:** SQL Server
- **Autenticação:** JWT (JSON Web Token)
- **CORS:** Habilitado para permitir requisições do frontend
- **Porta padrão:** 5000

### Inicialização

No arquivo `server.cjs`:

- Conexão com o banco SQL Server usando o pacote `mssql`.
- Configuração do Express para aceitar JSON e CORS.
- Inicialização do servidor em `0.0.0.0:5000` para aceitar conexões externas.

---

## Endpoints Disponíveis

### Autenticação

- **POST `/api/login`**  
  Autentica um usuário.  
  **Body:** `{ "email": "usuario@exemplo.com", "senha": "123456" }`  
  **Resposta:** `{ user, token }`

### Questões

- **GET `/api/questoes`**  
  Lista todas as questões, com filtros opcionais por disciplina e assunto.  
  **Query params:** `?disciplina=Matemática&assunto=Álgebra`

- **GET `/api/questoes/:id`**  
  Busca uma questão pelo ID.

- **POST `/api/questoes`**  
  Cria uma nova questão.  
  **Body:**

  ```json
  {
    "Titulo": "Enunciado da questão",
    "Disciplina": "Matemática",
    "Assuntos": ["Álgebra", "Funções"],
    "alternatives": [
      { "description": "Alternativa A", "isCorrect": false },
      { "description": "Alternativa B", "isCorrect": true }
    ]
  }
  ```

- **PUT `/api/questoes/:id`**  
  Atualiza uma questão existente.

- **DELETE `/api/questoes/:id`**  
  Remove uma questão.

### Provas

- **GET `/api/provas`**  
  Lista todas as provas.

- **GET `/api/provas/:id`**  
  Busca uma prova pelo ID.

- **POST `/api/provas`**  
  Cria uma nova prova.  
  **Body:**

  ```json
  {
    "Disciplina": "Matemática",
    "Titulo": "Prova 1",
    "IdsQuestoes": [1, 2, 3]
  }
  ```

- **PUT `/api/provas/:id`**  
  Atualiza uma prova existente.

- **DELETE `/api/provas/:id`**  
  Remove uma prova.

---

## Como funciona a autenticação

- O usuário faz login enviando email e senha para `/api/login`.
- Se as credenciais estiverem corretas, a API retorna um token JWT.
- Esse token deve ser enviado no header `Authorization` (`Bearer <token>`) nas rotas protegidas.

---

## Exemplo de uso no frontend

```typescript
const API_URL = "http://IP_DA_MÁQUINA_LOCAL:5000/api";

// Buscar todas as provas
const provas = await api.getExams();

// Buscar questões filtrando por disciplina
const questoes = await api.getQuestions("Matemática");

// Criar uma nova questão
await api.createQuestion({
  Titulo: "Qual o resultado de 2+2?",
  Disciplina: "Matemática",
  Assuntos: ["Aritmética"],
  alternatives: [
    { description: "3", isCorrect: false },
    { description: "4", isCorrect: true },
  ],
});
```

---

## Observações

- O endereço base da API deve ser ajustado conforme o IP da máquina onde o backend está rodando.
- O backend deve estar rodando com `app.listen(5000, "0.0.0.0", ...)` para aceitar conexões externas.
- O frontend deve apontar para o IP correto no arquivo `src/services/api.ts`.
- As portas 5000 (backend) e 3000 (frontend) devem estar liberadas no firewall para acesso externo.

---

## Segurança

- Não exponha o backend para a internet sem autenticação e HTTPS.
- Em produção, armazene as senhas dos usuários de forma criptografada (hash).

---

## Estrutura de Pastas (Backend)

```
project/
│
├── server.cjs           # Backend Express + SQL Server
├── src/
│   ├── services/
│   │   └── api.ts       # Serviço de integração com a API no frontend
│   └── ...              # Demais arquivos do frontend
└── ...
```

---

## Dúvidas
