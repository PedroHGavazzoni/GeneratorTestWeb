export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Alternative {
  id: string;
  description: string;
  isCorrect: boolean;
}

export interface Question {
  IdQuestao: number;
  Titulo: string;
  Disciplina: string;
  Assuntos: string[];
  alternatives?: Alternative[];
}

export interface Exam {
  IdProva: number;
  Disciplina: string;
  Titulo: string;
  QuantidadeQuestoes: number;
  Questoes?: Question[];
}

export interface ExamRequest {
  Disciplina: string;
  Titulo: string;
  IdsQuestoes: number[];
}