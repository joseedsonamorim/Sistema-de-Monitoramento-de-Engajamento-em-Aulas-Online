#  Quick Start Guide

## Instalação Rápida

### 1⃣ Preparar o Ambiente

```bash
# Dar permissão de execução aos scripts
chmod +x setup.sh run.sh

# Executar setup
./setup.sh
```

### 2⃣ Iniciar o Sistema

**Opção A: Script Automático (Recomendado)**
```bash
./run.sh
```

**Opção B: Manual**
```bash
# Terminal 1 - Backend
cd backend
python3 main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

### 3⃣ Acessar a Aplicação

- **Alunos**: http://localhost:3000
- **Docentes**: http://localhost:3000/dashboard

##  Requisitos

- Python 3.8+
- Node.js 14+
- npm ou yarn

##  Primeiro Uso

### Para Testar como Aluno:

1. Acesse http://localhost:3000
2. Permita acesso à câmera quando solicitado
3. Assista ao vídeo e interaja com os materiais
4. Sistema monitora automaticamente sua atenção

### Para Testar como Docente:

1. Acesse http://localhost:3000/dashboard
2. Veja métricas em tempo real de todos os alunos
3. Identifique alunos em risco de evasão
4. Monitore scores de atenção e fadiga

##  Solução de Problemas

### Backend não inicia
```bash
pip3 install --upgrade -r requirements.txt
```

### Frontend não carrega
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

### Câmera não funciona
- Verifique permissões do navegador
- Use HTTPS ou localhost
- No Chrome: chrome://settings/content/camera

### MediaPipe não carrega
- O sistema usa fallback automático
- Funciona em modo simulado sem câmera

##  Fluxo de Dados

```
Aluno → Webcam → MediaPipe (Local) → Métricas → API → Banco
                                                     ↓
                                              Dashboard do Docente
```

##  Exemplos de Uso

### Criar Aluno (via API)
```bash
curl -X POST http://localhost:8000/api/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome": "João Silva", "email": "joao@example.com"}'
```

### Criar Aula (via API)
```bash
curl -X POST http://localhost:8000/api/aulas \
  -H "Content-Type: application/json" \
  -d '{"titulo": "JavaScript Avançado", "descricao": "Aula sobre closures", "docente_id": 1}'
```

### Ver Análise da Turma
```bash
curl http://localhost:8000/api/analise/1
```

##  Personalização

### Alterar Porta do Backend
Edite `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Altere a porta
```

### Alterar Porta do Frontend
Edite `frontend/package.json`:
```json
{
  "scripts": {
    "start": "PORT=3001 react-scripts start"  // Adicione PORT
  }
}
```

##  Privacidade

-  Processamento 100% local (navegador)
-  Apenas scores enviados ao servidor
-  Nenhum vídeo armazenado
-  Dados criptografados em trânsito (com HTTPS)

##  Próximos Passos

1. Leia o README.md completo
2. Explore a documentação da API
3. Customize os thresholds de intervenção
4. Adicione seus próprios materiais

##  Suporte

Em caso de problemas:
1. Verifique os logs no console
2. Confirme que todas as dependências estão instaladas
3. Verifique permissões da câmera
4. Tente limpar cache do navegador



