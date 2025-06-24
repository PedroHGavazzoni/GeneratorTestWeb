import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import { api } from "../services/api";
import { Alternative } from "../types";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";

const QuestionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    Titulo: "",
    Disciplina: "",
    Assuntos: [] as string[],
    alternatives: [
      { id: "1", description: "", isCorrect: false },
      { id: "2", description: "", isCorrect: false },
      { id: "3", description: "", isCorrect: false },
      { id: "4", description: "", isCorrect: false },
      { id: "5", description: "", isCorrect: false },
    ] as Alternative[],
  });

  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      loadQuestion(parseInt(id));
    }
  }, [id, isEditing]);

  const loadQuestion = async (questionId: number) => {
    try {
      setLoading(true);
      const question = await api.getQuestion(questionId);
      setFormData({
        Titulo: question.Titulo,
        Disciplina: question.Disciplina,
        Assuntos: question.Assuntos,
        alternatives: [
          { id: "1", description: "", isCorrect: false },
          { id: "2", description: "", isCorrect: false },
          { id: "3", description: "", isCorrect: false },
          { id: "4", description: "", isCorrect: false },
          { id: "5", description: "", isCorrect: false },
        ],
      });
    } catch (err) {
      setError("Erro ao carregar questão");
      console.error("Question loading error:", err);
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

  const handleAlternativeChange = (
    index: number,
    field: keyof Alternative,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) =>
        i === index ? { ...alt, [field]: value } : alt
      ),
    }));
  };

  const handleCorrectAlternativeChange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => ({
        ...alt,
        isCorrect: i === index,
      })),
    }));
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.Assuntos.includes(newSubject.trim())) {
      setFormData((prev) => ({
        ...prev,
        Assuntos: [...prev.Assuntos, newSubject.trim()],
      }));
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      Assuntos: prev.Assuntos.filter((subject) => subject !== subjectToRemove),
    }));
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
    if (formData.Assuntos.length === 0) {
      setError("Pelo menos um assunto é obrigatório");
      return false;
    }
    if (formData.alternatives.some((alt) => !alt.description.trim())) {
      setError("Todas as alternativas devem ser preenchidas");
      return false;
    }
    if (!formData.alternatives.some((alt) => alt.isCorrect)) {
      setError("Uma alternativa deve ser marcada como correta");
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
      if (isEditing && id) {
        await api.updateQuestion(parseInt(id), formData);
      } else {
        await api.createQuestion({
          Titulo: formData.Titulo,
          Disciplina: formData.Disciplina,
          Assuntos: formData.Assuntos,
        });
      }
      navigate("/questions");
    } catch (err) {
      setError("Erro ao salvar questão");
      console.error("Question save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;

    if (!window.confirm("Tem certeza que deseja excluir esta questão?")) {
      return;
    }

    try {
      await api.deleteQuestion(parseInt(id));
      navigate("/questions");
    } catch {
      setError("Erro ao excluir questão");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/questions")}
          icon={ArrowLeft}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Editar Questão" : "Nova Questão"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Modifique os dados da questão"
              : "Preencha os dados para criar uma nova questão"}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Questão *
              </label>
              <textarea
                value={formData.Titulo}
                onChange={(e) => handleInputChange("Titulo", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o enunciado da questão..."
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
                placeholder="Ex: Matemática, História..."
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assuntos *
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSubject())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite um assunto e pressione Enter"
              />
              <Button
                type="button"
                onClick={addSubject}
                icon={Plus}
                variant="outline"
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.Assuntos.map((subject, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alternativas
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Preencha as 5 alternativas e marque a correta
          </p>

          <div className="space-y-4">
            {formData.alternatives.map((alternative, index) => (
              <div
                key={alternative.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correctAlternative"
                    checked={alternative.isCorrect}
                    onChange={() => handleCorrectAlternativeChange(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </label>
                </div>
                <input
                  type="text"
                  value={alternative.description}
                  onChange={(e) =>
                    handleAlternativeChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                icon={Trash2}
              >
                Excluir Questão
              </Button>
            )}
          </div>
          <Button type="submit" loading={saving} icon={Save} size="lg">
            {isEditing ? "Atualizar Questão" : "Salvar Questão"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
