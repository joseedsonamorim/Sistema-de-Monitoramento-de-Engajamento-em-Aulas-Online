#!/bin/bash

echo "🚀 Configurando o Sistema de Monitoramento de Engajamento..."

# Criar ambiente virtual
echo "🐍 Criando ambiente virtual..."
python3 -m venv venv

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Backend Setup
echo "📦 Instalando dependências do backend..."
pip install -r requirements.txt

# Frontend Setup
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

# Inicializar banco de dados
echo "🗄️  Inicializando banco de dados..."
cd backend
python3 init_db.py
cd ..

echo "✅ Configuração concluída!"
echo ""
echo "Para iniciar o sistema:"
echo "  1. Backend: source venv/bin/activate && cd backend && python main.py"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "Acesse http://localhost:3000 para alunos"
echo "Acesse http://localhost:3000/dashboard para docentes"
echo ""
echo "Ou use o script run.sh para iniciar ambos automaticamente"



