#!/bin/bash

echo "🚀 Configurando o Sistema de Monitoramento de Engajamento..."

# Backend Setup
echo "📦 Instalando dependências do backend..."
cd backend
python3 -m pip install -r ../requirements.txt --user

# Frontend Setup
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

echo "✅ Configuração concluída!"
echo ""
echo "Para iniciar o sistema:"
echo "  1. Backend: cd backend && python main.py"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "Acesse http://localhost:3000 para alunos"
echo "Acesse http://localhost:3000/dashboard para docentes"



