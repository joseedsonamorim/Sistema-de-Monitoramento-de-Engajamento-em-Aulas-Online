#  Sistema de Monitoramento de Engajamento em Aulas Online

Sistema completo para monitorar a atenção e o engajamento de alunos durante aulas online, utilizando análise de visão computacional em tempo real e métricas de interação.

##  Objetivos

Este sistema resolve o problema de alunos que assistem passivamente às gravações, coletando métricas de interação e de visão computacional para intervir ativamente e alertar docentes.

##  Funcionalidades

###  Módulo de Coleta de Métricas de Interação
- Rastreamento do tempo de permanência em vídeos
- Monitoramento de eventos do player (play, pause, seek, replay)
- Captura de cliques em materiais complementares
- Salvamento de anotações feitas pelo aluno

###  Módulo de Detecção de Foco e Fadiga (Visão Computacional)
- Análise em tempo real via webcam
- **Gaze Tracking**: Detecção de direção do olhar (tela, laterais, baixo)
- **Detecção de Fadiga**: Monitoramento de frequência de piscadas (Eye Aspect Ratio) e bocejos
- **Detecção de Ausência**: Verificação de presença do rosto no quadro
- Processamento local no navegador para privacidade

###  Módulo de Análise e Scoring
- **Score de Nível de Atenção**: Tempo focado vs desviado
- **Score de Fadiga**: Baseado em piscadas e bocejos
- **Contador de Desvio de Olhar**: Quantidade de desvios de foco
- **Contador de Interrupções**: Ausências detectadas
- **Risco de Evasão**: Combinação de todos os scores

###  Módulo de Intervenção Adaptativa
- **Intervenção por Baixa Interação**: Quizzes pop-up ou resumos
- **Intervenção por Desvio de Atenção**: Notificações imediatas
- **Intervenção por Fadiga**: Sugestões de pausa

###  Sistema de Quizzes e Avaliações
- **Criação de Quizzes**: Professores podem criar quizzes com múltipla escolha
- **Avaliação Automática**: Correção instantânea e cálculo de pontuação
- **Interface Interativa**: Modal responsivo para responder perguntas
- **Registro de Desempenho**: Histórico de respostas e pontuações

###  Resumos Personalizados
- **Geração Adaptativa**: Resumos baseados no perfil de engajamento do aluno
- **Tópicos Principais**: Destaque dos conceitos mais importantes
- **Recomendações Personalizadas**: Sugestões específicas para cada aluno
- **Conteúdo Estruturado**: Títulos, tópicos e pontos de destaque

###  Mineração de Dados Educacionais
- **Análise de Padrões**: Identificação de comportamentos recorrentes
- **Estatísticas em Tempo Real**: Médias de atenção, fadiga e interações
- **Logs Detalhados**: Registro completo de todas as interações
- **Dashboard Analítico**: Visualização de dados educacionais agregados

###  Painel do Docente
- Dashboard com lista de alunos
- Visualização de scores detalhados
- Destaque de alunos com baixa atenção crônica
- Atualização em tempo real
- Gerenciamento de quizzes e resumos
- Análise de dados educacionais

##  Tecnologias

### Backend
- **FastAPI**: Framework web moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados local para desenvolvimento

### Frontend
- **React**: Biblioteca JavaScript para interfaces
- **MediaPipe**: Detecção facial e rastreamento de olhar
- **Axios**: Cliente HTTP para API

### Computação Vision
- **MediaPipe Face Mesh**: Detecção e rastreamento facial
- Processamento 100% local (privacidade garantida)

##  Estrutura do Projeto

```
Monitoramento de Engajamento em Aulas Online/
├── backend/
│   ├── main.py              # API principal
│   ├── database.py          # Configuração do banco
│   ├── models.py            # Modelos SQLAlchemy
│   └── monitoramento.db     # Banco SQLite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentView.js
│   │   │   ├── TeacherDashboard.js
│   │   │   ├── VideoPlayer.js
│   │   │   └── InterventionPopups.js
│   │   ├── utils/
│   │   │   └── FaceDetection.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
├── requirements.txt
└── README.md
```

##  Instalação e Uso

### Instalação Automática (Recomendado)

1. Dar permissões de execução aos scripts:
```bash
chmod +x setup.sh run.sh
```

2. Executar configuração completa:
```bash
./setup.sh
```

### Instalação Manual

#### Backend

1. Criar ambiente virtual:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Inicializar banco de dados:
```bash
cd backend
python init_db.py
```

#### Frontend

1. Instalar dependências:
```bash
cd frontend
npm install
```

### Execução

#### Execução Automática (Recomendado)

```bash
./run.sh
```

#### Execução Manual

1. Backend (Terminal 1):
```bash
source venv/bin/activate
cd backend
python main.py
```

2. Frontend (Terminal 2):
```bash
cd frontend
npm start
```

### Acesso

- **Alunos**: http://localhost:3000
- **Docentes**: http://localhost:3000/dashboard
- **API Docs**: http://localhost:8000/docs

##  Como Usar

### Para Alunos

1. Acesse `http://localhost:3000`
2. Permita o uso da câmera quando solicitado
3. Comece a assistir ao vídeo
4. Interaja com os materiais complementares
5. Faça anotações durante a aula
6. O sistema monitora automaticamente sua atenção e fadiga

### Para Docentes

1. Acesse `http://localhost:3000/dashboard`
2. Visualize os alunos em tempo real
3. Identifique alunos em risco de evasão
4. Veja métricas detalhadas de atenção, fadiga e interação

##  Privacidade

O sistema foi projetado com privacidade em mente:
- **Processamento Local**: Toda análise de vídeo ocorre no navegador do aluno
- **Apenas Scores**: Apenas métricas processadas são enviadas ao backend, nunca o stream de vídeo
- **Transparência**: A câmera só é ativada com permissão explícita do aluno

##  Métricas Coletadas

### Métricas de Interação
- Tempo total de permanência
- Eventos do player (play, pause, seek)
- Número de cliques em materiais
- Conteúdo das anotações

### Métricas de Atenção
- Direção do olhar (gaze tracking)
- Score de fadiga (piscadas e bocejos)
- Desvios de olhar
- Interrupções (ausência do rosto)

### Métricas de Avaliação
- Pontuação em quizzes
- Tempo de resposta
- Taxa de acertos por pergunta
- Histórico de desempenho

### Scores Calculados
- **Score de Atenção**: Porcentagem de tempo focado na tela
- **Score de Fadiga**: Intensidade de sinais de cansaço
- **Risco de Evasão**: Combinação ponderada de todas as métricas
- **Pontuação de Quiz**: Porcentagem de acertos

### Dados de Mineração
- Padrões de interação por tipo
- Estatísticas agregadas da turma
- Médias de engajamento
- Análise temporal de comportamento

##  Interface

O sistema utiliza um design moderno inspirado no **Apple Liquid Glass**:
- Cards com efeito de vidro (glass morphism)
- Animações suaves
- Interface intuitiva e responsiva

##  Configuração

### Variáveis de Ambiente

- Backend: Porta 8000 (configurável em `main.py`)
- Frontend: Porta 3000 (configurável via React)

### Banco de Dados

O banco SQLite é criado automaticamente na primeira execução.

##  API Endpoints

### Alunos
- `POST /api/alunos` - Criar novo aluno
- `GET /api/alunos/{id}` - Obter aluno

### Aulas
- `POST /api/aulas` - Criar nova aula
- `GET /api/aulas` - Listar aulas

### Métricas
- `POST /api/metricas/interacao` - Registrar métricas de interação
- `POST /api/metricas/atencao` - Registrar métricas de atenção
- `GET /api/analise/{aula_id}` - Obter análise da turma

### Quizzes e Avaliações
- `POST /api/quizzes` - Criar novo quiz
- `GET /api/quizzes/{aula_id}` - Listar quizzes de uma aula
- `POST /api/respostas-quiz` - Registrar resposta de quiz

### Resumos Personalizados
- `POST /api/resumos-personalizados` - Criar resumo personalizado
- `GET /api/resumos-personalizados/{aluno_id}/{aula_id}` - Obter resumo de aluno

### Logs de Interação
- `POST /api/logs-interacao` - Registrar log de interação
- `GET /api/logs-interacao/{aluno_id}/{aula_id}` - Obter logs de aluno

### Mineração de Dados
- `GET /api/mineracao-dados/{aula_id}` - Análise de dados educacionais

##  Contribuição

Contribuições são bem-vindas! Sinta-se livre para:
1. Fazer fork do projeto
2. Criar uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

##  Licença

Este projeto está sob a licença MIT.

##  Autores

Desenvolvido para monitoramento inteligente de engajamento em educação online.

---

**Desenvolvido com  para melhorar a experiência educacional online**



