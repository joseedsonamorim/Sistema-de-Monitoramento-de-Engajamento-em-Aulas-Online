from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Aluno(Base):
    __tablename__ = "alunos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    
    metricas_interacao = relationship("MetricaInteracao", back_populates="aluno")
    metricas_atencao = relationship("MetricaAtencao", back_populates="aluno")

class Docente(Base):
    __tablename__ = "docentes"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    
    aulas = relationship("Aula", back_populates="docente")

class Aula(Base):
    __tablename__ = "aulas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255))
    descricao = Column(Text)
    docente_id = Column(Integer, ForeignKey("docentes.id"))

    docente = relationship("Docente", back_populates="aulas")
    metricas_interacao = relationship("MetricaInteracao", back_populates="aula")
    metricas_atencao = relationship("MetricaAtencao", back_populates="aula")
    quizzes = relationship("Quiz", back_populates="aula")

class MetricaInteracao(Base):
    __tablename__ = "metricas_interacao"
    
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    tempo_permanencia = Column(Integer)  # em segundos
    eventos_player = Column(JSON)  # {play: 1, pause: 2, seek: 1, etc}
    cliques_materiais = Column(Integer)
    conteudo_anotacoes = Column(Text)
    timestamp = Column(DateTime, default=datetime.now)
    
    aluno = relationship("Aluno", back_populates="metricas_interacao")
    aula = relationship("Aula", back_populates="metricas_interacao")

class MetricaAtencao(Base):
    __tablename__ = "metricas_atencao"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    gaze_na_tela = Column(Boolean)  # True se olhando para tela
    fadiga_score = Column(Float)  # 0.0 a 1.0
    desvio_olhar = Column(Integer)  # contador de desvios
    interrupcoes = Column(Integer)  # contador de ausências
    timestamp = Column(DateTime, default=datetime.now)

    aluno = relationship("Aluno", back_populates="metricas_atencao")
    aula = relationship("Aula", back_populates="metricas_atencao")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    titulo = Column(String(255))
    descricao = Column(Text)
    perguntas = Column(JSON)  # Lista de perguntas com opções
    respostas_certas = Column(JSON)  # Respostas corretas
    criado_em = Column(DateTime, default=datetime.now)

    aula = relationship("Aula", back_populates="quizzes")

class RespostaQuiz(Base):
    __tablename__ = "respostas_quiz"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    respostas = Column(JSON)  # Respostas do aluno
    pontuacao = Column(Float)  # Pontuação obtida
    tempo_resposta = Column(Integer)  # Tempo em segundos
    respondido_em = Column(DateTime, default=datetime.now)

    quiz = relationship("Quiz")
    aluno = relationship("Aluno")

class ResumoPersonalizado(Base):
    __tablename__ = "resumos_personalizados"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    titulo = Column(String(255))
    conteudo = Column(Text)  # Conteúdo do resumo
    topicos_principais = Column(JSON)  # Lista de tópicos
    pontos_destaque = Column(JSON)  # Pontos importantes
    recomendacoes = Column(Text)  # Recomendações personalizadas
    criado_em = Column(DateTime, default=datetime.now)

    aluno = relationship("Aluno")
    aula = relationship("Aula")

class LogInteracao(Base):
    __tablename__ = "logs_interacao"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    tipo_interacao = Column(String(50))  # 'click', 'play', 'pause', 'seek', 'note', 'quiz'
    detalhes = Column(JSON)  # Detalhes específicos da interação
    timestamp = Column(DateTime, default=datetime.now)

    aluno = relationship("Aluno")
    aula = relationship("Aula")


