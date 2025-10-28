import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherDashboard.css';

const API_BASE_URL = 'http://localhost:8000';

function TeacherDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aulaId] = useState(1);

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analise/${aulaId}`);
      setAnalysis(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      setLoading(false);
    }
  };

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



