# 📊 Resumo do Projeto: Sistema de Monitoramento de Engajamento em Aulas Online

## ✅ Projeto Completo Implementado

### 📦 Estrutura de Arquivos

```
Monitoramento de Engajamento em Aulas Online/
│
├── 📁 backend/
│   ├── __init__.py              # Inicialização do pacote
│   ├── main.py                  # API FastAPI principal
│   ├── database.py              # Configuração SQLAlchemy
│   ├── models.py                # Modelos do banco de dados
│   └── init_db.py               # Script de inicialização do DB
│
├── 📁 frontend/
│   ├── package.json             # Dependências Node.js
│   ├── README.md                # Documentação frontend
│   ├── 📁 public/
│   │   └── index.html           # HTML com MediaPipe CDN
│   └── 📁 src/
│       ├── App.js               # App principal React
│       ├── App.css              # Estilos globais
│       ├── index.js             # Entry point
│       ├── index.css            # Estilos base
│       ├── 📁 components/
│       │   ├── StudentView.js   # Interface do aluno
│       │   ├── StudentView.css
│       │   ├── TeacherDashboard.js  # Dashboard docente
│       │   ├── TeacherDashboard.css
│       │   ├── VideoPlayer.js   # Player de vídeo
│       │   ├── VideoPlayer.css
│       │   ├── InterventionPopups.js  # Sistema de intervenções
│       │   └── InterventionPopups.css
│       └── 📁 utils/
│           └── FaceDetection.js  # Sistema de CV
│
├── requirements.txt             # Dependências Python
├── README.md                    # Documentação principal
├── QUICKSTART.md               # Guia rápido
├── ARCHITECTURE.md             # Arquitetura detalhada
├── setup.sh                     # Script de setup
├── run.sh                      # Script de execução
└── .gitignore                   # Arquivos ignorados
```

## 🎯 Módulos Implementados

### 1. ✅ Módulo de Coleta de Métricas de Interação
**Arquivos**: `VideoPlayer.js`, `StudentView.js`

**Funcionalidades**:
- ✅ Rastreamento de tempo de permanência
- ✅ Monitoramento de eventos do player (play, pause, seek)
- ✅ Captura de cliques em materiais complementares
- ✅ Salvamento de anotações do aluno
- ✅ Envio periódico para API (a cada 5 segundos)

### 2. ✅ Módulo de Detecção de Foco e Fadiga
**Arquivos**: `FaceDetection.js`, `StudentView.js`

**Funcionalidades**:
- ✅ Gaze Tracking (estimativa de direção do olhar)
- ✅ Detecção de Fadiga via Eye Aspect Ratio (EAR)
- ✅ Detecção de bocejos via análise da boca
- ✅ Detecção de ausência (presença do rosto)
- ✅ Contagem de piscadas
- ✅ Processamento 100% local no navegador
- ✅ Fallback para modo simulado sem câmera

### 3. ✅ Módulo de Análise e Scoring
**Arquivos**: `main.py` (endpoint `/api/analise/{aula_id}`)

**Scores Implementados**:
- ✅ Score de Atenção (porcentagem de foco na tela)
- ✅ Score de Fadiga (combinando EAR e bocejos)
- ✅ Contador de Desvios de Olhar
- ✅ Contador de Interrupções
- ✅ Risco de Evasão (peso ponderado de todas as métricas)

### 4. ✅ Módulo de Intervenção Adaptativa
**Arquivos**: `InterventionPopups.js`, `StudentView.js`

**Intervenções**:
- ✅ Por baixa interação (quiz/resumo sugerido)
- ✅ Por desvio de atenção (notificação imediata)
- ✅ Por fadiga (sugestão de pausa)
- ✅ Sistema de cooldown para evitar spam

### 5. ✅ Painel do Docente
**Arquivos**: `TeacherDashboard.js`

**Funcionalidades**:
- ✅ Lista de alunos com risco de evasão
- ✅ Visualização de scores detalhados
- ✅ Métricas de atenção, fadiga, cliques e tempo
- ✅ Destaque de alunos em alto risco
- ✅ Atualização em tempo real (a cada 10 segundos)
- ✅ Seção de alertas para alunos críticos

## 🔧 Tecnologias Utilizadas

### Backend
- ✅ FastAPI (Framework web)
- ✅ SQLAlchemy (ORM)
- ✅ SQLite (Banco de dados)
- ✅ Uvicorn (Servidor ASGI)
- ✅ Pydantic (Validação)

### Frontend
- ✅ React 18
- ✅ React Router (Roteamento)
- ✅ Axios (HTTP client)
- ✅ MediaPipe via CDN (Visão computacional)

### Processamento
- ✅ Detecção facial (MediaPipe Face Mesh)
- ✅ Gaze tracking (estimativa de olhar)
- ✅ Eye Aspect Ratio para piscadas
- ✅ Análise de boca para bocejos

## 🚀 Como Executar

### Setup Inicial
```bash
# 1. Dar permissões
chmod +x setup.sh run.sh

# 2. Instalar dependências
./setup.sh

# 3. Inicializar banco de dados
cd backend
python init_db.py

# 4. Executar sistema
cd ..
./run.sh
```

### Acesso
- **Alunos**: http://localhost:3000
- **Docentes**: http://localhost:3000/dashboard
- **API Docs**: http://localhost:8000/docs

## 📊 Métricas Coletadas

### Métricas de Interação
```javascript
{
  tempo_permanencia: int,      // segundos
  eventos_player: {           // contadores
    play: int,
    pause: int,
    seek: int
  },
  cliques_materiais: int,
  conteudo_anotacoes: string
}
```

### Métricas de Atenção
```javascript
{
  gaze_na_tela: bool,
  fadiga_score: float,        // 0.0 a 1.0
  desvio_olhar: int,
  interrupcoes: int
}
```

### Scores Calculados
```python
{
  "aluno_nome": "Nome",
  "score_atencao": 75.5,       # porcentagem
  "score_fadiga": 0.3,         # 0.0 a 1.0
  "desvios_olhar": 5,
  "interrupcoes": 1,
  "total_tempo": 1200,         # segundos
  "total_cliques": 8,
  "risco_evasao": 35          # porcentagem
}
```

## 🎨 Interface

### Design
- ✅ Glass morphism (Apple Liquid Glass)
- ✅ Gradiente moderno
- ✅ Animações suaves
- ✅ Responsivo
- ✅ Dark theme friendly

### Componentes Visuais
- ✅ Cards com efeito de vidro
- ✅ Barras de progresso animadas
- ✅ Badges de risco coloridos
- ✅ Popups de intervenção
- ✅ Status indicators em tempo real

## 🔒 Privacidade

### Processamento Local
- ✅ Análise de vídeo no navegador do aluno
- ✅ Nenhum stream de vídeo transmitido
- ✅ Apenas scores enviados ao servidor
- ✅ Permissão explícita necessária

### Dados Armazenados
- ✅ Métricas agregadas
- ✅ Scores numéricos
- ✅ Anotações do aluno (opcional)
- ❌ Nenhum dado de vídeo

## 📈 Performance

### Otimizações
- ✅ Processamento assíncrono
- ✅ Envio de métricas em batch (5s)
- ✅ Atualização condicional do dashboard (10s)
- ✅ MediaPipe carregado via CDN
- ✅ Fallback para modo simulado

### Limitações
- ⚠️ SQLite (escala verticalmente)
- ⚠️ Sem cache (adapta adicionando Redis)
- ⚠️ Sem autenticação (adicionar JWT)

## 🧪 Modos de Operação

### Modo Normal
- Processamento completo com câmera
- MediaPipe rodando no navegador
- Métricas reais coletadas

### Modo Simulado
- Funciona sem câmera
- Dados simulados para desenvolvimento
- Útil para testes e demos

## 📝 Endpoints da API

### Métricas
- `POST /api/metricas/interacao` - Registrar interações
- `POST /api/metricas/atencao` - Registrar atenção
- `GET /api/analise/{aula_id}` - Análise completa

### Gestão
- `POST /api/alunos` - Criar aluno
- `GET /api/alunos/{id}` - Obter aluno
- `POST /api/aulas` - Criar aula
- `GET /api/aulas` - Listar aulas

## 🎓 Casos de Uso

### Para Alunos
1. Acessar a aula online
2. Permitir câmera quando solicitado
3. Assistir ao vídeo
4. Interagir com materiais
5. Fazer anotações
6. Receber intervenções quando necessário

### Para Docentes
1. Acessar o dashboard
2. Ver métricas em tempo real
3. Identificar alunos em risco
4. Visualizar detalhes por aluno
5. Tomar ações corretivas

## 🔄 Fluxo Completo

```
Aluno Acessa → Câmera Ativada → Detecção Facial → Análise
      ↓                                                  ↓
  Métricas                                               Intervenção
      ↓                                                      ↓
  Backend ←─────────── Envio de Dados ←───────────────────┘
      ↓
  Banco de Dados
      ↓
  Dashboard Docente ←── Visualização em Tempo Real ────────┘
```

## ✨ Diferenciais

1. **Privacidade**: Processamento 100% local
2. **Tempo Real**: Métricas a cada 5 segundos
3. **Adaptativo**: Intervenções inteligentes
4. **Visual**: Interface moderna e intuitiva
5. **Completo**: Todos os módulos solicitados implementados
6. **Extensível**: Arquitetura modular

## 📚 Documentação

- ✅ README.md - Documentação principal
- ✅ QUICKSTART.md - Guia rápido
- ✅ ARCHITECTURE.md - Arquitetura detalhada
- ✅ frontend/README.md - Docs do frontend

## 🎉 Status: COMPLETO

✅ Todos os módulos implementados
✅ Backend funcional com FastAPI
✅ Frontend React com visão computacional
✅ Sistema de intervenção
✅ Dashboard do docente
✅ Banco de dados estruturado
✅ Documentação completa

**O sistema está pronto para uso!**



