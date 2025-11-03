import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaceDetectionSystem } from '../utils/FaceDetection';
import VideoPlayer from './VideoPlayer';
import InterventionPopups from './InterventionPopups';
import axios from 'axios';
import './StudentView.css';

const API_BASE_URL = 'http://localhost:8000';

function StudentView() {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectionData, setDetectionData] = useState({
    faceDetected: false,
    gazeOnScreen: false,
    fatigueScore: 0,
    blinkCount: 0,
    yawnCount: 0,
    attentionScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [interactionMetrics, setInteractionMetrics] = useState({
    tempoPermaneencia: 0,
    eventosPlayer: { play: 0, pause: 0, seek: 0 },
    cliquesMateriais: 0,
    notas: ''
  });

  const [interventions, setInterventions] = useState([]);
  const [studentId] = useState(1);
  const [aulaId] = useState(1);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [personalizedSummary, setPersonalizedSummary] = useState(null);

  const faceDetectionRef = useRef(null);
  const metricsIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const triggerIntervention = useCallback((type, message) => {
    // Evitar múltiplas intervenções do mesmo tipo em pouco tempo
    const recentInterventions = interventions.filter(
      i => i.tipo === type && Date.now() - i.timestamp < 30000
    );

    if (recentInterventions.length === 0) {
      const intervention = {
        id: Date.now(),
        tipo: type,
        mensagem: message,
        timestamp: Date.now()
      };

      setInterventions(prev => [...prev, intervention]);
    }
  }, [interventions]);

  const sendMetrics = useCallback(async () => {
    try {
      // Enviar métricas de atenção
      if (detectionData.faceDetected) {
        await axios.post(`${API_BASE_URL}/api/metricas/atencao`, {
          aluno_id: studentId,
          aula_id: aulaId,
          gaze_na_tela: detectionData.gazeOnScreen,
          fadiga_score: detectionData.fatigueScore,
          desvio_olhar: detectionData.gazeOnScreen ? 0 : 1,
          interrupcoes: detectionData.faceDetected ? 0 : 1
        });
      }

      // Enviar métricas de interação
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (currentTime > 0) {
        await axios.post(`${API_BASE_URL}/api/metricas/interacao`, {
          aluno_id: studentId,
          aula_id: aulaId,
          tempo_permanencia: currentTime,
          eventos_player: interactionMetrics.eventosPlayer,
          cliques_materiais: interactionMetrics.cliquesMateriais,
          conteudo_anotacoes: interactionMetrics.notas
        });
      }
    } catch (error) {
      console.error('Erro ao enviar métricas:', error);
    }
  }, [detectionData, interactionMetrics, studentId, aulaId]);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);

    // Iniciar envio periódico de métricas
    metricsIntervalRef.current = setInterval(() => {
      sendMetrics();
    }, 2000); // Enviar a cada 2 segundos para tempo real
  }, [sendMetrics]);

  const handleDetectionUpdate = useCallback((data) => {
    setDetectionData(data);

    // Verificar condições para intervenção
    if (!data.gazeOnScreen && data.faceDetected) {
      triggerIntervention('attention', 'Detectamos que sua atenção desviou. Mantenha o foco na tela.');
    }

    if (data.fatigueScore > 0.7) {
      triggerIntervention('fatigue', 'Você parece cansado. Recomendamos uma pausa de 2 minutos.');
    }

    // Verificar baixa interação
    const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const interactionScore = (interactionMetrics.cliquesMateriais + Object.values(interactionMetrics.eventosPlayer).reduce((a, b) => a + b, 0));

    if (currentTime > 120 && interactionScore < 2) {
      triggerIntervention('interaction', 'Você não está interagindo com o material. Que tal fazer algumas anotações?');
    }
  }, [interactionMetrics.cliquesMateriais, interactionMetrics.eventosPlayer, triggerIntervention]);

  useEffect(() => {
    async function initializeDetection() {
      setIsLoading(true);
      setCameraError(null);

      if (!faceDetectionRef.current) {
        try {
          faceDetectionRef.current = new FaceDetectionSystem(
            handleDetectionUpdate,
            handleCameraReady
          );

          await faceDetectionRef.current.start();
        } catch (err) {
          console.error('Erro ao iniciar detecção facial:', err);
          setCameraError(err.message);
          setIsCameraReady(false);
        } finally {
          setIsLoading(false);
        }
      }
    }

    initializeDetection();

    return () => {
      if (faceDetectionRef.current) {
        faceDetectionRef.current.stop();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [handleDetectionUpdate, handleCameraReady]);

  const handlePlayerEvent = (evento) => {
    setInteractionMetrics(prev => ({
      ...prev,
      eventosPlayer: {
        ...prev.eventosPlayer,
        [evento]: (prev.eventosPlayer[evento] || 0) + 1
      }
    }));
  };

  const handleMaterialClick = () => {
    setInteractionMetrics(prev => ({
      ...prev,
      cliquesMateriais: prev.cliquesMateriais + 1
    }));
  };

  const handleNoteChange = (text) => {
    setInteractionMetrics(prev => ({
      ...prev,
      notas: text
    }));
  };

  const dismissIntervention = (id) => {
    setInterventions(prev => prev.filter(i => i.id !== id));
  };

  // Funções para Quiz
  const loadQuizzes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quizzes/${aulaId}`);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    }
  }, [aulaId]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizAnswers({});
    setQuizStartTime(Date.now());
  };

  const answerQuizQuestion = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    if (!currentQuiz) return;

    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

    try {
      await axios.post(`${API_BASE_URL}/api/respostas-quiz`, {
        quiz_id: currentQuiz.id,
        aluno_id: studentId,
        respostas: quizAnswers,
        tempo_resposta: timeSpent
      });

      // Registrar log de interação
      await axios.post(`${API_BASE_URL}/api/logs-interacao`, {
        aluno_id: studentId,
        aula_id: aulaId,
        tipo_interacao: 'quiz',
        detalhes: { quiz_id: currentQuiz.id, pontuacao: 'calculada' }
      });

      setCurrentQuiz(null);
      setQuizAnswers({});
      setQuizStartTime(null);

      alert('Quiz enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar quiz:', error);
    }
  };

  // Função para carregar resumo personalizado
  const loadPersonalizedSummary = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resumos-personalizados/${studentId}/${aulaId}`);
      setPersonalizedSummary(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo personalizado:', error);
    }
  }, [studentId, aulaId]);

  // Carregar quizzes e resumo ao montar componente
  useEffect(() => {
    loadQuizzes();
    loadPersonalizedSummary();
  }, [loadQuizzes, loadPersonalizedSummary]);

  return (
    <div className="student-view">
      <div className="video-container">
        <video id="input_video" style={{ display: 'none' }} autoPlay muted></video>
        <VideoPlayer onEvent={handlePlayerEvent} />
      </div>

      <div className="side-panel glass-card">
        <div className="status-section">
          <h2>Monitoramento</h2>
          {isLoading ? (
            <div className="loading-message">
              <p>Inicializando sistema de monitoramento...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : cameraError ? (
            <div className="error-message">
              <p>❌ Erro na câmera: {cameraError}</p>
              <button onClick={() => window.location.reload()}>
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              <div className="status-item">
                <span className="status-label">Câmera:</span>
                <span className={`status-value ${isCameraReady ? 'active' : 'inactive'}`}>
                  {isCameraReady ? '✅ Ativa' : '⚠️ Aguardando permissão'}
                </span>
              </div>
              
              {isCameraReady && !detectionData.faceDetected && (
                <div className="warning-message">
                  ⚠️ Rosto não detectado. Por favor, posicione seu rosto na frente da câmera.
                </div>
              )}
              
              <div className="status-item">
                <span className="status-label">Atenção:</span>
                <span className={`status-value ${detectionData.attentionScore > 0.5 ? 'good' : 'warning'}`}>
                  {detectionData.attentionScore > 0.5 ? 'Boa' : 'Baixa'}
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-label">Fadiga:</span>
                <span className="status-value">
                  {(detectionData.fatigueScore * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-label">Piscadas:</span>
                <span className="status-value">{detectionData.blinkCount}</span>
              </div>
              
              {isCameraReady && detectionData.faceDetected && (
                <div className="detection-status">
                  <div className="status-item">
                    <span className="status-label">Posição:</span>
                    <span className={`status-value ${detectionData.gazeOnScreen ? 'good' : 'warning'}`}>
                      {detectionData.gazeOnScreen ? '✅ Centralizada' : '⚠️ Desviada'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Estado:</span>
                    <span className={`status-value ${detectionData.fatigueScore < 0.5 ? 'good' : 'warning'}`}>
                      {detectionData.fatigueScore < 0.5 ? '✅ Atento' : '⚠️ Cansado'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="materials-section">
          <h3>Materiais Complementares</h3>
          <button className="material-link" onClick={handleMaterialClick}>
            📄 Slides da Aula
          </button>
          <button className="material-link" onClick={handleMaterialClick}>
            📚 Leitura Recomendada
          </button>
          <button className="material-link" onClick={handleMaterialClick}>
            🎬 Vídeo Extra
          </button>

          {quizzes.length > 0 && (
            <div className="quizzes-section">
              <h4>Quizzes Disponíveis</h4>
              {quizzes.map(quiz => (
                <button
                  key={quiz.id}
                  className="material-link quiz-link"
                  onClick={() => startQuiz(quiz)}
                >
                  📝 {quiz.titulo}
                </button>
              ))}
            </div>
          )}

          {personalizedSummary && (
            <div className="summary-section">
              <h4>Resumo Personalizado</h4>
              <div className="summary-content">
                <h5>{personalizedSummary.titulo}</h5>
                <p>{personalizedSummary.conteudo}</p>
                <div className="topics">
                  <strong>Tópicos Principais:</strong>
                  <ul>
                    {personalizedSummary.topicos_principais.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <div className="recommendations">
                  <strong>Recomendações:</strong>
                  <p>{personalizedSummary.recomendacoes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="notes-section">
          <h3>Suas Anotações</h3>
          <textarea
            placeholder="Faça suas anotações aqui..."
            onChange={(e) => handleNoteChange(e.target.value)}
            value={interactionMetrics.notas}
            rows={4}
          />
        </div>
      </div>

      <InterventionPopups interventions={interventions} onDismiss={dismissIntervention} />

      {/* Modal do Quiz */}
      {currentQuiz && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal glass-card">
            <h3>{currentQuiz.titulo}</h3>
            <p>{currentQuiz.descricao}</p>

            <div className="quiz-questions">
              {Object.entries(currentQuiz.perguntas).map(([questionId, question]) => (
                <div key={questionId} className="quiz-question">
                  <h4>{question.texto}</h4>
                  <div className="quiz-options">
                    {question.opcoes.map((option, index) => (
                      <label key={index} className="quiz-option">
                        <input
                          type="radio"
                          name={`question-${questionId}`}
                          value={option}
                          onChange={(e) => answerQuizQuestion(questionId, e.target.value)}
                          checked={quizAnswers[questionId] === option}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button
                className="quiz-submit-btn"
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length !== Object.keys(currentQuiz.perguntas).length}
              >
                Enviar Quiz
              </button>
              <button
                className="quiz-cancel-btn"
                onClick={() => setCurrentQuiz(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentView;


