import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { api } from "../services/api";
import { Question, ExamRequest } from "../types";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";

const ExamForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    Titulo: "",
    Disciplina: "",
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  // Filters
  const [questionFilters, setQuestionFilters] = useState({
    disciplina: "",
    assunto: "",
    search: "",
  });

  // Modal states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  useEffect(() => {
    loadQuestions();
    if (isEditing && id) {
      loadExam(parseInt(id));
    }
  }, [id, isEditing]);

  // Memoize filterQuestions to avoid unnecessary re-renders and satisfy exhaustive-deps
  // (Removed duplicate filterQuestions declaration)

  // ...rest of your imports

  const filterQuestions = useCallback(() => {
    let filtered = allQuestions;

    if (questionFilters.disciplina) {
      filtered = filtered.filter(
        (q) => q.Disciplina === questionFilters.disciplina
      );
    }

    if (questionFilters.assunto) {
      filtered = filtered.filter((q) =>
        q.Assuntos.includes(questionFilters.assunto)
      );
    }

    if (questionFilters.search) {
      filtered = filtered.filter(
        (q) =>
          q.Titulo.toLowerCase().includes(
            questionFilters.search.toLowerCase()
          ) ||
          q.Disciplina.toLowerCase().includes(
            questionFilters.search.toLowerCase()
          ) ||
          q.Assuntos.some((a) =>
            a.toLowerCase().includes(questionFilters.search.toLowerCase())
          )
      );
    }

    setFilteredQuestions(filtered);
  }, [allQuestions, questionFilters]);

  useEffect(() => {
    filterQuestions();
  }, [filterQuestions]);

  const loadQuestions = async () => {
    try {
      const questions = await api.getQuestions();
      setAllQuestions(questions);
    } catch (err) {
      setError("Erro ao carregar questões");
      console.error("Questions loading error:", err);
    }
  };

  const loadExam = async (examId: number) => {
    try {
      setLoading(true);
      const exam = await api.getExam(examId);
      setFormData({
        Titulo: exam.Titulo,
        Disciplina: exam.Disciplina,
      });
      setSelectedQuestions(exam.Questoes || []);
    } catch (err) {
      setError("Erro ao carregar prova");
      console.error("Exam loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionPreview = (question: Question) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const addQuestionToExam = (question: Question) => {
    if (!selectedQuestions.find((q) => q.IdQuestao === question.IdQuestao)) {
      setSelectedQuestions((prev) => [...prev, question]);
    }
  };

  const removeQuestionFromExam = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.filter((q) => q.IdQuestao !== questionId)
    );
  };

  const clearFilters = () => {
    setQuestionFilters({
      disciplina: "",
      assunto: "",
      search: "",
    });
  };

  const validateForm = () => {
    if (!formData.Titulo.trim()) {
      setError("Título é obrigatório");
      return false;
    }
    if (!formData.Disciplina.trim()) {
      setError("Disciplina é obrigatória");
      return false;
    }
    if (selectedQuestions.length === 0) {
      setError("Pelo menos uma questão deve ser selecionada");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const examRequest: ExamRequest = {
        Titulo: formData.Titulo,
        Disciplina: formData.Disciplina,
        IdsQuestoes: selectedQuestions.map((q) => q.IdQuestao),
      };

      if (isEditing && id) {
        await api.updateExam(parseInt(id), examRequest);
      } else {
        const { Disciplina, Titulo, IdsQuestoes } = examRequest;
        await api.createExam({ Disciplina, Titulo, IdsQuestoes });
      }
      navigate("/exams");
    } catch (err) {
      let msg = "Erro ao salvar prova";
      if (err instanceof Response) {
        try {
          const data = await err.json();
          if (data && data.error) msg = data.error;
        } catch {
          // Ignored
        }
      }
      setError(msg);
      console.error("Exam save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;

    if (!window.confirm("Tem certeza que deseja excluir esta prova?")) {
      return;
    }

    try {
      await api.deleteExam(parseInt(id));
      navigate("/exams");
    } catch {
      setError("Erro ao excluir prova");
    }
  };

  const disciplines = [...new Set(allQuestions.map((q) => q.Disciplina))];
  const subjects = [...new Set(allQuestions.flatMap((q) => q.Assuntos))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/exams")}
          icon={ArrowLeft}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Editar Prova" : "Nova Prova"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Modifique os dados da prova"
              : "Preencha os dados para criar uma nova prova"}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Prova
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Prova *
              </label>
              <input
                type="text"
                value={formData.Titulo}
                onChange={(e) => handleInputChange("Titulo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Prova de História do Brasil"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disciplina *
              </label>
              <input
                type="text"
                value={formData.Disciplina}
                onChange={(e) =>
                  handleInputChange("Disciplina", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: História, Matemática..."
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Bank */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Banco de Questões
            </h2>

            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar questões..."
                    value={questionFilters.search}
                    onChange={(e) =>
                      setQuestionFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplina
                  </label>
                  <select
                    value={questionFilters.disciplina}
                    onChange={(e) =>
                      setQuestionFilters((prev) => ({
                        ...prev,
                        disciplina: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas</option>
                    {disciplines.map((discipline) => (
                      <option key={discipline} value={discipline}>
                        {discipline}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <select
                    value={questionFilters.assunto}
                    onChange={(e) =>
                      setQuestionFilters((prev) => ({
                        ...prev,
                        assunto: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                icon={Filter}
                size="sm"
              >
                Limpar Filtros
              </Button>
            </div>

            {/* Questions List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma questão encontrada
                </p>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question.IdQuestao}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex-1">
                        {question.Titulo}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {question.Disciplina}
                        </span>
                        {question.Assuntos.slice(0, 2).map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {subject}
                          </span>
                        ))}
                        {question.Assuntos.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{question.Assuntos.length - 2} mais
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuestionPreview(question)}
                          icon={Eye}
                        >
                          Visualizar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addQuestionToExam(question)}
                          icon={Plus}
                          disabled={selectedQuestions.some(
                            (q) => q.IdQuestao === question.IdQuestao
                          )}
                        >
                          {selectedQuestions.some(
                            (q) => q.IdQuestao === question.IdQuestao
                          )
                            ? "Adicionada"
                            : "Adicionar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Questions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Questões Selecionadas ({selectedQuestions.length})
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {selectedQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma questão selecionada
                </p>
              ) : (
                selectedQuestions.map((question, index) => (
                  <div
                    key={question.IdQuestao}
                    className="border border-gray-200 rounded-lg p-4 bg-blue-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}.
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 flex-1">
                          {question.Titulo}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {question.Disciplina}
                        </span>
                        {question.Assuntos.slice(0, 2).map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          removeQuestionFromExam(question.IdQuestao)
                        }
                        icon={X}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                icon={Trash2}
              >
                Excluir Prova
              </Button>
            )}
          </div>
          <Button type="submit" loading={saving} icon={Save} size="lg">
            {isEditing ? "Atualizar Prova" : "Salvar Prova"}
          </Button>
        </div>
      </form>

      {/* Question Preview Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="Visualizar Questão"
        size="lg"
      >
        {selectedQuestion && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedQuestion.Titulo}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedQuestion.Disciplina}
                </span>
                {selectedQuestion.Assuntos.map((subject, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {selectedQuestion.alternatives && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Alternativas:
                </h4>
                <div className="space-y-2">
                  {selectedQuestion.alternatives.map((alternative, index) => (
                    <div
                      key={alternative.id}
                      className={`p-3 rounded-lg border ${
                        alternative.isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-600 mt-1">
                          {String.fromCharCode(65 + index)})
                        </span>
                        <p
                          className={`text-sm ${
                            alternative.isCorrect
                              ? "text-green-800 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {alternative.description}
                        </p>
                        {alternative.isCorrect && (
                          <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Correta
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamForm;
