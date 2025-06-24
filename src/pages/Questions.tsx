import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Question } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedDiscipline, selectedSubject]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions();
      setQuestions(data);
    } catch (err) {
      setError('Erro ao carregar questões. Verifique se o servidor está funcionando.');
      console.error('Questions loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.Titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Assuntos.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDiscipline) {
      filtered = filtered.filter(q => q.Disciplina === selectedDiscipline);
    }

    if (selectedSubject) {
      filtered = filtered.filter(q => q.Assuntos.includes(selectedSubject));
    }

    setFilteredQuestions(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta questão?')) {
      return;
    }

    try {
      await api.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.IdQuestao !== id));
    } catch (err) {
      alert('Erro ao excluir questão');
    }
  };

  const disciplines = [...new Set(questions.map(q => q.Disciplina))];
  const subjects = [...new Set(questions.flatMap(q => q.Assuntos))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banco de Questões</h1>
          <p className="text-gray-600">Gerencie suas questões cadastradas</p>
        </div>
        <Link to="/questions/new">
          <Button icon={Plus} size="lg">
            Nova Questão
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar questões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {disciplines.map(discipline => (
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
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedDiscipline('');
                setSelectedSubject('');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {questions.length === 0 ? 'Nenhuma questão cadastrada' : 'Nenhuma questão encontrada com os filtros aplicados'}
            </p>
            {questions.length === 0 && (
              <Link to="/questions/new" className="mt-4 inline-block">
                <Button icon={Plus}>
                  Criar primeira questão
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assuntos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.IdQuestao} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {question.Titulo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.Disciplina}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {question.Assuntos.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/questions/${question.IdQuestao}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="h-4 w-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(question.IdQuestao)}
                        className="text-red-600 hover:text-red-900 transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        Mostrando {filteredQuestions.length} de {questions.length} questões
      </div>
    </div>
  );
};

export default Questions;