import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BookOpen, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Exam } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await api.getExams();
      setExams(data);
    } catch (err) {
      setError('Erro ao carregar provas. Verifique se o servidor está funcionando.');
      console.error('Exams loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta prova?')) {
      return;
    }

    try {
      await api.deleteExam(id);
      setExams(prev => prev.filter(e => e.IdProva !== id));
    } catch (err) {
      alert('Erro ao excluir prova');
    }
  };

  const handlePreview = async (exam: Exam) => {
    try {
      const fullExam = await api.getExam(exam.IdProva);
      setSelectedExam(fullExam);
      setShowPreviewModal(true);
    } catch (err) {
      alert('Erro ao carregar detalhes da prova');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Área de Provas</h1>
          <p className="text-gray-600">Gerencie suas provas cadastradas</p>
        </div>
        <Link to="/exams/new">
          <Button icon={Plus} size="lg">
            Nova Prova
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Nenhuma prova cadastrada</p>
          <Link to="/exams/new">
            <Button icon={Plus}>
              Criar primeira prova
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.IdProva}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exam.Titulo}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {exam.Disciplina}
                  </span>
                </div>
                <FileText className="h-6 w-6 text-gray-400" />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{exam.QuantidadeQuestoes}</span> questões
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(exam)}
                  icon={Eye}
                  className="flex-1"
                >
                  Visualizar
                </Button>
                <Link to={`/exams/${exam.IdProva}`} className="flex-1">
                  <Button size="sm" variant="primary" icon={Edit} className="w-full">
                    Editar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(exam.IdProva)}
                  icon={Trash2}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Visualizar Prova"
        size="lg"
      >
        {selectedExam && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedExam.Titulo}
              </h3>
              <p className="text-gray-600">
                Disciplina: <span className="font-medium">{selectedExam.Disciplina}</span>
              </p>
              <p className="text-gray-600">
                Total de questões: <span className="font-medium">{selectedExam.QuantidadeQuestoes}</span>
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <h4 className="font-medium text-gray-900 mb-3">Questões:</h4>
              <div className="space-y-3">
                {selectedExam.Questoes?.map((question, index) => (
                  <div key={question.IdQuestao} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-500 mt-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2">
                          {question.Titulo}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {question.Assuntos.map((subject, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        Total de {exams.length} prova{exams.length !== 1 ? 's' : ''} cadastrada{exams.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default Exams;