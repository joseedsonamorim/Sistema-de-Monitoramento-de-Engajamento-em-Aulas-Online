import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TeacherDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

function TeacherDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aulaId] = useState(1);
  const [quizzes, setQuizzes] = useState([]);
  const [dataMining, setDataMining] = useState(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    titulo: '',
    descricao: '',
    perguntas: {}
  });

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analise/${aulaId}`);
      setAnalysis(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      setLoading(false);
    }
  }, [aulaId]);

  const loadQuizzes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quizzes/${aulaId}`);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    }
  }, [aulaId]);

  const loadDataMining = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mineracao-dados/${aulaId}`);
      setDataMining(response.data);
    } catch (error) {
      console.error('Erro ao carregar mineração de dados:', error);
    }
  }, [aulaId]);

  useEffect(() => {
    fetchAnalysis();
    loadQuizzes();
    loadDataMining();
    const interval = setInterval(fetchAnalysis, 3000); // Atualizar a cada 3 segundos para tempo real
    return () => clearInterval(interval);
  }, [fetchAnalysis, loadQuizzes, loadDataMining]);

  const getRiskColor = (risco) => {
    if (risco >= 70) return '#ef4444';
    if (risco >= 40) return '#f59e0b';
    return '#22c55e';
  };

  const getRiskLabel = (risco) => {
    if (risco >= 70) return 'Alto';
    if (risco >= 40) return 'Médio';
    return 'Baixo';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="glass-card loading">
          <p>Carregando análise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header glass-card">
        <h1>Painel do Docente</h1>
        <p>Monitoramento de Engajamento - Aula #{aulaId}</p>
        <button onClick={fetchAnalysis} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>Total de Alunos</h3>
          <p className="stat-value">{analysis?.alunos?.length || 0}</p>
        </div>
        <div className="stat-card glass-card">
          <h3>Em Risco</h3>
          <p className="stat-value">
            {analysis?.alunos?.filter(a => a.risco_evasao >= 40).length || 0}
          </p>
        </div>
        <div className="stat-card glass-card">
          <h3>Envolvidos</h3>
          <p className="stat-value">
            {analysis?.alunos?.filter(a => a.risco_evasao < 40).length || 0}
          </p>
        </div>
      </div>

      <div className="students-list glass-card">
        <h2>Análise por Aluno</h2>
        <table className="students-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Risco de Evasão</th>
              <th>Atenção</th>
              <th>Fadiga</th>
              <th>Interação</th>
              <th>Tempo (min)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {analysis?.alunos?.map((aluno, index) => (
              <tr key={index}>
                <td className="student-name">{aluno.aluno_nome}</td>
                <td>
                  <div className="risk-indicator">
                    <span
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(aluno.risco_evasao) }}
                    >
                      {getRiskLabel(aluno.risco_evasao)} ({aluno.risco_evasao}%)
                    </span>
                  </div>
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${aluno.score_atencao}%`,
                        backgroundColor: aluno.score_atencao > 70 ? '#22c55e' : 
                                       aluno.score_atencao > 40 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="score-value">{aluno.score_atencao.toFixed(1)}%</span>
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${aluno.score_fadiga * 100}%`,
                        backgroundColor: aluno.score_fadiga < 0.3 ? '#22c55e' : 
                                       aluno.score_fadiga < 0.6 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="score-value">{(aluno.score_fadiga * 100).toFixed(1)}%</span>
                </td>
                <td>
                  <span className="metric-value">
                    {aluno.total_cliques} cliques
                  </span>
                </td>
                <td>
                  <span className="metric-value">
                    {Math.floor(aluno.total_tempo / 60)}min
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="action-btn">📊</button>
                    <button className="action-btn">💬</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-mining-section glass-card">
        <h2>📊 Mineração de Dados Educacionais</h2>
        {dataMining && (
          <div className="data-mining-content">
            <div className="mining-stat">
              <span className="stat-label">Total de Alunos:</span>
              <span className="stat-value">{dataMining.total_alunos}</span>
            </div>
            <div className="mining-stat">
              <span className="stat-label">Média de Atenção:</span>
              <span className="stat-value">{(dataMining.media_atencao * 100).toFixed(1)}%</span>
            </div>
            <div className="mining-stat">
              <span className="stat-label">Média de Fadiga:</span>
              <span className="stat-value">{(dataMining.media_fadiga * 100).toFixed(1)}%</span>
            </div>
            <div className="mining-stat">
              <span className="stat-label">Total de Interações:</span>
              <span className="stat-value">{dataMining.total_interacoes}</span>
            </div>
            <div className="mining-stat">
              <span className="stat-label">Média de Cliques:</span>
              <span className="stat-value">{dataMining.media_cliques.toFixed(1)}</span>
            </div>
            <div className="patterns">
              <h3>Padrões de Interação:</h3>
              <ul>
                {Object.entries(dataMining.padroes_interacao).map(([tipo, count]) => (
                  <li key={tipo}>{tipo}: {count} ocorrências</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="quizzes-section glass-card">
        <h2>📝 Quizzes e Avaliações</h2>
        <button
          className="create-quiz-btn"
          onClick={() => setShowCreateQuiz(true)}
        >
          + Criar Novo Quiz
        </button>
        <div className="quizzes-list">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="quiz-item">
              <h3>{quiz.titulo}</h3>
              <p>{quiz.descricao}</p>
              <span className="quiz-date">
                Criado em: {new Date(quiz.criado_em).toLocaleDateString()}
              </span>
            </div>
          ))}
          {quizzes.length === 0 && (
            <p className="no-quizzes">Nenhum quiz criado ainda.</p>
          )}
        </div>
      </div>

      <div className="alert-section glass-card">
        <h2>🚨 Alerta - Alunos que Precisam de Atenção</h2>
        <div className="alert-students">
          {analysis?.alunos
            ?.filter(a => a.risco_evasao >= 70)
            .slice(0, 5)
            .map((aluno, index) => (
              <div key={index} className="alert-student">
                <strong>{aluno.aluno_nome}</strong>
                <span>Risco: {getRiskLabel(aluno.risco_evasao)}</span>
                <span>Desvios: {aluno.desvios_olhar}</span>
                <span>Fadiga: {(aluno.score_fadiga * 100).toFixed(0)}%</span>
              </div>
            ))}
          {analysis?.alunos?.filter(a => a.risco_evasao >= 70).length === 0 && (
            <p className="no-alerts">Nenhum aluno em alto risco no momento. Ótimo! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;



