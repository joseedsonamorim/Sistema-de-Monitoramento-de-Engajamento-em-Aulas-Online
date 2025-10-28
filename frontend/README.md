# Frontend - Sistema de Monitoramento de Engajamento

## Instalação

```bash
npm install
```

## Executar em Desenvolvimento

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Build para Produção

```bash
npm run build
```

## Estrutura

- `components/` - Componentes React
  - `StudentView.js` - Interface do aluno com player de vídeo e monitoramento
  - `TeacherDashboard.js` - Dashboard do docente
  - `VideoPlayer.js` - Player de vídeo com rastreamento de eventos
  - `InterventionPopups.js` - Sistema de intervenções adaptativas

- `utils/` - Utilitários
  - `FaceDetection.js` - Sistema de detecção facial e análise de atenção

## Funcionalidades

### Visão Computacional
- Gaze Tracking (rastreamento de olhar)
- Detecção de fadiga via Eye Aspect Ratio (EAR)
- Detecção de bocejos
- Contagem de piscadas
- Processamento 100% local (privacidade)

### Intervenção Adaptativa
- Alertas de desvio de atenção
- Alertas de fadiga
- Sugestões de interação
- Quizzes pop-up

### Métricas em Tempo Real
- Score de atenção
- Score de fadiga
- Contador de piscadas
- Contador de bocejos
- Status da câmera



