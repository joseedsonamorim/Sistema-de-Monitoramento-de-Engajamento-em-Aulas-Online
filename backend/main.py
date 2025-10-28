from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
from backend.database import engine, Base
from backend.models import Aluno, Aula, MetricaInteracao, MetricaAtencao, Docente
from backend.database import SessionLocal

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

@app.get("/")
def root():
    return {"message": "API de Monitoramento de Engajamento"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


