# 📚 Sistema de Monitoramento de Engajamento em Aulas Online

Sistema completo para monitorar a atenção e o engajamento de alunos durante aulas online, utilizando análise de visão computacional em tempo real e métricas de interação.

## 🎯 Objetivos

Este sistema resolve o problema de alunos que assistem passivamente às gravações, coletando métricas de interação e de visão computacional para intervir ativamente e alertar docentes.

## ✨ Funcionalidades

### 📊 Módulo de Coleta de Métricas de Interação
- Rastreamento do tempo de permanência em vídeos
- Monitoramento de eventos do player (play, pause, seek, replay)
- Captura de cliques em materiais complementares
- Salvamento de anotações feitas pelo aluno

### 👁️ Módulo de Detecção de Foco e Fadiga (Visão Computacional)
- Análise em tempo real via webcam
- **Gaze Tracking**: Detecção de direção do olhar (tela, laterais, baixo)
- **Detecção de Fadiga**: Monitoramento de frequência de piscadas (Eye Aspect Ratio) e bocejos
- **Detecção de Ausência**: Verificação de presença do rosto no quadro
- Processamento local no navegador para privacidade

### 📈 Módulo de Análise e Scoring
- **Score de Nível de Atenção**: Tempo focado vs desviado
- **Score de Fadiga**: Baseado em piscadas e bocejos
- **Contador de Desvio de Olhar**: Quantidade de desvios de foco
- **Contador de Interrupções**: Ausências detectadas
- **Risco de Evasão**: Combinação de todos os scores

### 🎯 Módulo de Intervenção Adaptativa
- **Intervenção por Baixa Interação**: Quizzes pop-up ou resumos
- **Intervenção por Desvio de Atenção**: Notificações imediatas
- **Intervenção por Fadiga**: Sugestões de pausa

### 👨‍🏫 Painel do Docente
- Dashboard com lista de alunos
- Visualização de scores detalhados
- Destaque de alunos com baixa atenção crônica
- Atualização em tempo real

## 🛠️ Tecnologias

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

## 📁 Estrutura do Projeto

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

## 🚀 Instalação e Uso

### Backend

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute o servidor:
```bash
cd backend
python main.py
```

O servidor estará disponível em `http://localhost:8000`

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Execute a aplicação:
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📖 Como Usar

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

## 🔒 Privacidade

O sistema foi projetado com privacidade em mente:
- **Processamento Local**: Toda análise de vídeo ocorre no navegador do aluno
- **Apenas Scores**: Apenas métricas processadas são enviadas ao backend, nunca o stream de vídeo
- **Transparência**: A câmera só é ativada com permissão explícita do aluno

## 📊 Métricas Coletadas

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

### Scores Calculados
- **Score de Atenção**: Porcentagem de tempo focado na tela
- **Score de Fadiga**: Intensidade de sinais de cansaço
- **Risco de Evasão**: Combinação ponderada de todas as métricas

## 🎨 Interface

O sistema utiliza um design moderno inspirado no **Apple Liquid Glass**:
- Cards com efeito de vidro (glass morphism)
- Animações suaves
- Interface intuitiva e responsiva

## 🔧 Configuração

### Variáveis de Ambiente

- Backend: Porta 8000 (configurável em `main.py`)
- Frontend: Porta 3000 (configurável via React)

### Banco de Dados

O banco SQLite é criado automaticamente na primeira execução.

## 📝 API Endpoints

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

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se livre para:
1. Fazer fork do projeto
2. Criar uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

Desenvolvido para monitoramento inteligente de engajamento em educação online.

---

**Desenvolvido com ❤️ para melhorar a experiência educacional online**



