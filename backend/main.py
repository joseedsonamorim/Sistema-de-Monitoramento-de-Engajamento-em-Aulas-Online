from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
from database import engine, Base, SessionLocal
from models import Aluno, Aula, MetricaInteracao, MetricaAtencao, Docente, Quiz, RespostaQuiz, ResumoPersonalizado, LogInteracao

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Monitoramento de Engajamento em Aulas Online",
    description="Sistema de monitoramento de atenção e engajamento de alunos em aulas online",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class AlunoCreate(BaseModel):
    nome: str
    email: str

class AulaCreate(BaseModel):
    titulo: str
    descricao: str
    docente_id: int

class MetricaInteracaoCreate(BaseModel):
    aluno_id: int
    aula_id: int
    tempo_permanencia: int
    eventos_player: dict
    cliques_materiais: int
    conteudo_anotacoes: Optional[str] = None

class MetricaAtencaoCreate(BaseModel):
    aluno_id: int
    aula_id: int
    gaze_na_tela: bool
    fadiga_score: float
    desvio_olhar: int
    interrupcoes: int

class IntervencaoFeedback(BaseModel):
    tipo: str
    mensagem: str
    timestamp: datetime

class QuizCreate(BaseModel):
    aula_id: int
    titulo: str
    descricao: str
    perguntas: dict
    respostas_certas: dict

class RespostaQuizCreate(BaseModel):
    quiz_id: int
    aluno_id: int
    respostas: dict
    tempo_resposta: int

class ResumoPersonalizadoCreate(BaseModel):
    aluno_id: int
    aula_id: int
    titulo: str
    conteudo: str
    topicos_principais: List[str]
    pontos_destaque: List[str]
    recomendacoes: str

class LogInteracaoCreate(BaseModel):
    aluno_id: int
    aula_id: int
    tipo_interacao: str
    detalhes: dict

# Session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints de Alunos
@app.post("/api/alunos", response_model=dict)
def criar_aluno(aluno: AlunoCreate):
    db = SessionLocal()
    try:
        novo_aluno = Aluno(nome=aluno.nome, email=aluno.email)
        db.add(novo_aluno)
        db.commit()
        db.refresh(novo_aluno)
        return {"id": novo_aluno.id, "nome": novo_aluno.nome, "email": novo_aluno.email}
    finally:
        db.close()

@app.get("/api/alunos/{aluno_id}")
def obter_aluno(aluno_id: int):
    db = SessionLocal()
    try:
        aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
        if not aluno:
            raise HTTPException(status_code=404, detail="Aluno não encontrado")
        return aluno
    finally:
        db.close()

# Endpoints de Aulas
@app.post("/api/aulas")
def criar_aula(aula: AulaCreate):
    db = SessionLocal()
    try:
        nova_aula = Aula(
            titulo=aula.titulo,
            descricao=aula.descricao,
            docente_id=aula.docente_id
        )
        db.add(nova_aula)
        db.commit()
        db.refresh(nova_aula)
        return nova_aula
    finally:
        db.close()

@app.get("/api/aulas")
def listar_aulas():
    db = SessionLocal()
    try:
        aulas = db.query(Aula).all()
        return aulas
    finally:
        db.close()

# Endpoints de Métricas
@app.post("/api/metricas/interacao")
def registrar_metrica_interacao(metrica: MetricaInteracaoCreate):
    db = SessionLocal()
    try:
        nova_metrica = MetricaInteracao(
            aluno_id=metrica.aluno_id,
            aula_id=metrica.aula_id,
            tempo_permanencia=metrica.tempo_permanencia,
            eventos_player=metrica.eventos_player,
            cliques_materiais=metrica.cliques_materiais,
            conteudo_anotacoes=metrica.conteudo_anotacoes,
            timestamp=datetime.now()
        )
        db.add(nova_metrica)
        db.commit()
        db.refresh(nova_metrica)
        return nova_metrica
    finally:
        db.close()

@app.post("/api/metricas/atencao")
def registrar_metrica_atencao(metrica: MetricaAtencaoCreate):
    db = SessionLocal()
    try:
        nova_metrica = MetricaAtencao(
            aluno_id=metrica.aluno_id,
            aula_id=metrica.aula_id,
            gaze_na_tela=metrica.gaze_na_tela,
            fadiga_score=metrica.fadiga_score,
            desvio_olhar=metrica.desvio_olhar,
            interrupcoes=metrica.interrupcoes,
            timestamp=datetime.now()
        )
        db.add(nova_metrica)
        db.commit()
        db.refresh(nova_metrica)
        return nova_metrica
    finally:
        db.close()

# Endpoint de análise de risco
@app.get("/api/analise/{aula_id}")
def obter_analise_turma(aula_id: int):
    db = SessionLocal()
    try:
        # Buscar métricas de atenção e interação
        metricas_atencao = db.query(MetricaAtencao).filter(
            MetricaAtencao.aula_id == aula_id
        ).all()
        
        metricas_interacao = db.query(MetricaInteracao).filter(
            MetricaInteracao.aula_id == aula_id
        ).all()
        
        # Calcular scores por aluno
        alunos_dados = {}
        
        for metrica in metricas_atencao + metricas_interacao:
            aluno_id = metrica.aluno_id
            if aluno_id not in alunos_dados:
                aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
                alunos_dados[aluno_id] = {
                    "aluno": aluno,
                    "metricas_atencao": [],
                    "metricas_interacao": []
                }
        
        for metrica in metricas_atencao:
            alunos_dados[metrica.aluno_id]["metricas_atencao"].append(metrica)
        
        for metrica in metricas_interacao:
            alunos_dados[metrica.aluno_id]["metricas_interacao"].append(metrica)
        
        # Calcular scores
        resultados = []
        for aluno_id, dados in alunos_dados.items():
            # Score de atenção
            atendio_on_screen = sum(1 for m in dados["metricas_atencao"] if m.gaze_na_tela)
            total_checks = len(dados["metricas_atencao"])
            score_atencao = (atendio_on_screen / total_checks * 100) if total_checks > 0 else 0
            
            # Score de fadiga
            media_fadiga = sum(m.fadiga_score for m in dados["metricas_atencao"]) / len(dados["metricas_atencao"]) if dados["metricas_atencao"] else 0
            
            # Score de interação
            total_tempo = sum(m.tempo_permanencia for m in dados["metricas_interacao"])
            total_cliques = sum(m.cliques_materiais for m in dados["metricas_interacao"])
            
            # Risco de evasão (combinação dos scores)
            risco_evasao = 0
            if score_atencao < 50:
                risco_evasao += 30
            if media_fadiga > 0.7:
                risco_evasao += 25
            if total_cliques < 3:
                risco_evasao += 25
            if total_tempo < 300:  # menos de 5 minutos
                risco_evasao += 20
            
            resultados.append({
                "aluno_id": aluno_id,
                "aluno_nome": dados["aluno"].nome,
                "score_atencao": round(score_atencao, 2),
                "score_fadiga": round(media_fadiga, 2),
                "desvios_olhar": sum(m.desvio_olhar for m in dados["metricas_atencao"]),
                "interrupcoes": sum(m.interrupcoes for m in dados["metricas_atencao"]),
                "total_tempo": total_tempo,
                "total_cliques": total_cliques,
                "risco_evasao": min(risco_evasao, 100)
            })
        
        # Ordenar por risco
        resultados.sort(key=lambda x: x["risco_evasao"], reverse=True)
        
        return {"aula_id": aula_id, "alunos": resultados}
    finally:
        db.close()

# Endpoints de Quiz
@app.post("/api/quizzes")
def criar_quiz(quiz: QuizCreate):
    db = SessionLocal()
    try:
        novo_quiz = Quiz(
            aula_id=quiz.aula_id,
            titulo=quiz.titulo,
            descricao=quiz.descricao,
            perguntas=quiz.perguntas,
            respostas_certas=quiz.respostas_certas
        )
        db.add(novo_quiz)
        db.commit()
        db.refresh(novo_quiz)
        return novo_quiz
    finally:
        db.close()

@app.get("/api/quizzes/{aula_id}")
def listar_quizzes_aula(aula_id: int):
    db = SessionLocal()
    try:
        quizzes = db.query(Quiz).filter(Quiz.aula_id == aula_id).all()
        return quizzes
    finally:
        db.close()

@app.post("/api/respostas-quiz")
def registrar_resposta_quiz(resposta: RespostaQuizCreate):
    db = SessionLocal()
    try:
        # Buscar respostas corretas
        quiz = db.query(Quiz).filter(Quiz.id == resposta.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz não encontrado")

        # Calcular pontuação
        pontuacao = 0
        total_perguntas = len(quiz.respostas_certas)

        for pergunta_id, resposta_aluno in resposta.respostas.items():
            if pergunta_id in quiz.respostas_certas and quiz.respostas_certas[pergunta_id] == resposta_aluno:
                pontuacao += 1

        pontuacao_final = (pontuacao / total_perguntas) * 100 if total_perguntas > 0 else 0

        nova_resposta = RespostaQuiz(
            quiz_id=resposta.quiz_id,
            aluno_id=resposta.aluno_id,
            respostas=resposta.respostas,
            pontuacao=pontuacao_final,
            tempo_resposta=resposta.tempo_resposta
        )
        db.add(nova_resposta)
        db.commit()
        db.refresh(nova_resposta)
        return nova_resposta
    finally:
        db.close()

# Endpoints de Resumos Personalizados
@app.post("/api/resumos-personalizados")
def criar_resumo_personalizado(resumo: ResumoPersonalizadoCreate):
    db = SessionLocal()
    try:
        novo_resumo = ResumoPersonalizado(
            aluno_id=resumo.aluno_id,
            aula_id=resumo.aula_id,
            titulo=resumo.titulo,
            conteudo=resumo.conteudo,
            topicos_principais=resumo.topicos_principais,
            pontos_destaque=resumo.pontos_destaque,
            recomendacoes=resumo.recomendacoes
        )
        db.add(novo_resumo)
        db.commit()
        db.refresh(novo_resumo)
        return novo_resumo
    finally:
        db.close()

@app.get("/api/resumos-personalizados/{aluno_id}/{aula_id}")
def obter_resumo_personalizado(aluno_id: int, aula_id: int):
    db = SessionLocal()
    try:
        resumo = db.query(ResumoPersonalizado).filter(
            ResumoPersonalizado.aluno_id == aluno_id,
            ResumoPersonalizado.aula_id == aula_id
        ).first()
        if not resumo:
            raise HTTPException(status_code=404, detail="Resumo não encontrado")
        return resumo
    finally:
        db.close()

# Endpoint de Logs de Interação
@app.post("/api/logs-interacao")
def registrar_log_interacao(log: LogInteracaoCreate):
    db = SessionLocal()
    try:
        novo_log = LogInteracao(
            aluno_id=log.aluno_id,
            aula_id=log.aula_id,
            tipo_interacao=log.tipo_interacao,
            detalhes=log.detalhes
        )
        db.add(novo_log)
        db.commit()
        db.refresh(novo_log)
        return novo_log
    finally:
        db.close()

@app.get("/api/logs-interacao/{aluno_id}/{aula_id}")
def obter_logs_interacao(aluno_id: int, aula_id: int):
    db = SessionLocal()
    try:
        logs = db.query(LogInteracao).filter(
            LogInteracao.aluno_id == aluno_id,
            LogInteracao.aula_id == aula_id
        ).order_by(LogInteracao.timestamp.desc()).all()
        return logs
    finally:
        db.close()

# Endpoint de Análise de Dados Educacionais
@app.get("/api/mineracao-dados/{aula_id}")
def analisar_dados_educacionais(aula_id: int):
    db = SessionLocal()
    try:
        # Buscar todos os logs de interação da aula
        logs = db.query(LogInteracao).filter(LogInteracao.aula_id == aula_id).all()

        # Análise de padrões de interação
        padroes_interacao = {}
        for log in logs:
            tipo = log.tipo_interacao
            if tipo not in padroes_interacao:
                padroes_interacao[tipo] = 0
            padroes_interacao[tipo] += 1

        # Buscar métricas de atenção e interação
        metricas_atencao = db.query(MetricaAtencao).filter(MetricaAtencao.aula_id == aula_id).all()
        metricas_interacao = db.query(MetricaInteracao).filter(MetricaInteracao.aula_id == aula_id).all()

        # Calcular estatísticas
        total_alunos = len(set(log.aluno_id for log in logs))

        estatisticas = {
            "total_alunos": total_alunos,
            "padroes_interacao": padroes_interacao,
            "media_atencao": sum(m.gaze_na_tela for m in metricas_atencao) / len(metricas_atencao) if metricas_atencao else 0,
            "media_fadiga": sum(m.fadiga_score for m in metricas_atencao) / len(metricas_atencao) if metricas_atencao else 0,
            "total_interacoes": len(logs),
            "media_cliques": sum(m.cliques_materiais for m in metricas_interacao) / len(metricas_interacao) if metricas_interacao else 0
        }

        return estatisticas
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "API de Monitoramento de Engajamento"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


