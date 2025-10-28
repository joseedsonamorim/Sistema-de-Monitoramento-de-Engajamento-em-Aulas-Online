# 🏗️ Arquitetura do Sistema

## Visão Geral

O sistema de Monitoramento de Engajamento é uma aplicação full-stack com processamento de visão computacional no cliente.

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StudentView Component                                │  │
│  │  - VideoPlayer                                        │  │
│  │  - SidePanel (Metrics, Materials, Notes)             │  │
│  │  - InterventionPopups                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FaceDetection System (MediaPipe)                    │  │
│  │  - Gaze Tracking                                      │  │
│  │  - Fatigue Detection (EAR)                           │  │
│  │  - Blink/Yawn Counter                                │  │
│  │  - Face Presence Detection                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TeacherDashboard Component                          │  │
│  │  - Real-time Metrics                                │  │
│  │  - Risk Analysis                                     │  │
│  │  - Student Alerts                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↕
                    (REST API - HTTP)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                       │  │
│  │  - POST /api/metricas/interacao                     │  │
│  │  - POST /api/metricas/atencao                       │  │
│  │  - GET /api/analise/{aula_id}                       │  │
│  │  - GET /api/alunos                                  │  │
│  │  - GET /api/aulas                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer (SQLAlchemy)                        │  │
│  │  - Aluno                                             │  │
│  │  - Aula                                              │  │
│  │  - MetricaInteracao                                  │  │
│  │  - MetricaAtencao                                    │  │
│  │  - Docente                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SQLite Database                                      │  │
│  │  - monitoramento.db                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Frontend (React)

#### StudentView
- **Responsabilidade**: Interface principal do aluno
- **Componentes**:
  - VideoPlayer: Player de vídeo com rastreamento de eventos
  - SidePanel: Métricas em tempo real, materiais, anotações
  - InterventionPopups: Sistema de notificações adaptativas

#### FaceDetection System
- **Responsabilidade**: Análise de visão computacional
- **Processamento**: 100% local (navegador)
- **Métricas**:
  - Gaze tracking (direção do olhar)
  - Eye Aspect Ratio (EAR) para detectar piscadas
  - Yawn detection via boca
  - Face presence (ausência/presença)

#### TeacherDashboard
- **Responsabilidade**: Monitoramento da turma
- **Features**:
  - Visualização em tempo real
  - Análise de risco de evasão
  - Alertas de alunos críticos

### 2. Backend (FastAPI)

#### API Endpoints

**Métricas**:
- `POST /api/metricas/interacao` - Registra interações
- `POST /api/metricas/atencao` - Registra métricas de atenção
- `GET /api/analise/{aula_id}` - Retorna análise completa da turma

**Gestão**:
- `POST /api/alunos` - Criar aluno
- `GET /api/alunos/{id}` - Obter aluno
- `POST /api/aulas` - Criar aula
- `GET /api/aulas` - Listar aulas

### 3. Database (SQLite + SQLAlchemy)

#### Modelos

**Aluno**
- id, nome, email
- Relação 1:N com MetricaInteracao e MetricaAtencao

**Aula**
- id, titulo, descricao, docente_id
- Relação N:1 com Docente
- Relação 1:N com métricas

**MetricaInteracao**
- aluno_id, aula_id, tempo_permanencia
- eventos_player (JSON), cliques_materiais
- conteudo_anotacoes, timestamp

**MetricaAtencao**
- aluno_id, aula_id, gaze_na_tela
- fadiga_score, desvio_olhar, interrupcoes
- timestamp

**Docente**
- id, nome, email
- Relação 1:N com Aula

## Fluxo de Dados

### Coleta de Métricas

```
1. Aluno assiste vídeo
   ↓
2. FaceDetection processa webcam
   ↓
3. Métricas geradas (atenção, fadiga)
   ↓
4. Enviado para API a cada 5 segundos
   ↓
5. Armazenado no banco
```

### Intervenções

```
1. Sistema detecta anomalia
   (baixa atenção, fadiga, sem interação)
   ↓
2. Trigger dispara intervenção
   ↓
3. Popup exibido ao aluno
   ↓
4. Aluno pode fechar
   ↓
5. Log enviado ao backend
```

### Dashboard do Docente

```
1. Docente acessa dashboard
   ↓
2. Frontend busca análise via API
   ↓
3. Backend calcula scores por aluno
   ↓
4. Dashboard atualiza visualização
   ↓
5. Alunos em risco destacados
```

## Algoritmos

### Score de Atenção
```
score_atencao = (tempo_focado / tempo_total) * 100
```

### Score de Fadiga
```
fadiga_score = 
  (EAR < 0.2 ? 0.4 : EAR < 0.25 ? 0.2 : 0) +
  (yawn_ratio > 0.6 ? 0.3 : yawn_ratio > 0.4 ? 0.1 : 0) +
  (piscadas > 20 ? 0.3 : 0)
```

### Risco de Evasão
```
risco_evasao =
  (atencao < 50 ? 30 : 0) +
  (fadiga > 0.7 ? 25 : 0) +
  (cliques < 3 ? 25 : 0) +
  (tempo < 300 ? 20 : 0)
```

## Segurança e Privacidade

### Processamento Local
- Toda análise de vídeo ocorre no navegador
- Nenhum stream de vídeo é transmitido
- Apenas scores numéricos enviados ao servidor

### Dados Coletados
- Métricas de interação (cliques, tempo)
- Scores de atenção e fadiga
- Anotações do aluno
- Nenhum dado pessoal sensível

### Transporte
- HTTP para desenvolvimento
- HTTPS recomendado para produção
- CORS configurado para localhost

## Escalabilidade

### Limitações Atuais
- SQLite (arquivo local)
- Síncrono (sem cache)
- Sem autenticação

### Melhorias Futuras
- Migrar para PostgreSQL
- Implementar cache (Redis)
- Adicionar autenticação (JWT)
- WebSockets para tempo real
- Load balancer para múltiplas instâncias

## Dependências

### Backend
- FastAPI: Framework web
- SQLAlchemy: ORM
- Uvicorn: ASGI server

### Frontend
- React: Biblioteca UI
- React Router: Navegação
- Axios: HTTP client
- MediaPipe: Visão computacional (CDN)

## Deployment

### Desenvolvimento
- Backend: localhost:8000
- Frontend: localhost:3000
- Database: SQLite local

### Produção
- Backend: Gunicorn + Uvicorn
- Frontend: Build estático (Nginx)
- Database: PostgreSQL
- Reverse Proxy: Nginx

## Testes

### Estrutura
```
tests/
  ├── backend/
  │   ├── test_api.py
  │   ├── test_models.py
  │   └── test_analysis.py
  └── frontend/
      ├── StudentView.test.js
      └── Dashboard.test.js
```

### Cobertura
- Backend: Pytest
- Frontend: Jest + React Testing Library



