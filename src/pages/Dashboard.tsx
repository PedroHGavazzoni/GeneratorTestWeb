import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ClipboardList, Plus, TrendingUp, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import { Question, Exam } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    questionsByDiscipline: {} as Record<string, number>,
    examsByDiscipline: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [questions, exams] = await Promise.all([
        api.getQuestions(),
        api.getExams()
      ]);

      // Calculate statistics
      const questionsByDiscipline = questions.reduce((acc, question) => {
        acc[question.Disciplina] = (acc[question.Disciplina] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const examsByDiscipline = exams.reduce((acc, exam) => {
        acc[exam.Disciplina] = (acc[exam.Disciplina] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalQuestions: questions.length,
        totalExams: exams.length,
        questionsByDiscipline,
        examsByDiscipline
      });
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const topDisciplines = Object.entries(stats.questionsByDiscipline)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Questões e Provas
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie questões e crie provas de forma eficiente
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Banco de Questões</h3>
              <p className="text-blue-100 mb-4">
                Visualize e gerencie questões cadastradas
              </p>
              <Link to="/questions">
                <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-blue-50">
                  <FileText className="h-4 w-4 mr-2" />
                  Acessar
                </Button>
              </Link>
            </div>
            <FileText className="h-16 w-16 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Área de Provas</h3>
              <p className="text-green-100 mb-4">
                Crie e gerencie suas provas
              </p>
              <Link to="/exams">
                <Button variant="outline" className="bg-white text-green-600 border-white hover:bg-green-50">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Acessar
                </Button>
              </Link>
            </div>
            <ClipboardList className="h-16 w-16 text-green-200" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Questões</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Provas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Disciplinas</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.questionsByDiscipline).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Média Q/Prova</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalExams > 0 ? Math.round(stats.totalQuestions / stats.totalExams) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/questions/new">
            <Button icon={Plus} variant="primary">
              Nova Questão
            </Button>
          </Link>
          <Link to="/exams/new">
            <Button icon={Plus} variant="success">
              Nova Prova
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Disciplines */}
      {topDisciplines.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Disciplinas com Mais Questões
          </h3>
          <div className="space-y-3">
            {topDisciplines.map(([discipline, count]) => (
              <div key={discipline} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{discipline}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / stats.totalQuestions) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;