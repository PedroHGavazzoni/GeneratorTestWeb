import { Question, Exam } from "../types";

// Troque pelo IP real da sua máquina na rede local
const API_URL = "http://192.168.1.8:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export const api = {
  // Buscar prova por ID
  async getExam(id: number): Promise<Exam> {
    const res = await fetch(`${API_URL}/provas/${id}`, {
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(`${API_URL}/questoes?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao buscar questões");
    return res.json();
  },

  // Buscar questão por ID
  async getQuestion(id: number): Promise<Question> {
    const res = await fetch(`${API_URL}/questoes/${id}`, {
      headers: getAuthHeaders(),
    });
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
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() || {}),
      },
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
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() || {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar questão");
    return res.json();
  },

  // Remover questão
  async deleteQuestion(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/questoes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() || {}),
      },
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
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() || {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar prova");
    return res.json();
  },

  // Remover prova
  async deleteExam(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/provas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao excluir prova");
  },

  // Listar provas
  async getExams(): Promise<Exam[]> {
    const res = await fetch(`${API_URL}/provas`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao buscar provas");
    return res.json();
  },
};

// Exemplo para fetch com token:
// const token = localStorage.getItem("token");
// const res = await fetch(`${API_URL}/provas`, {
//   headers: { Authorization: `Bearer ${token}` }
// });
