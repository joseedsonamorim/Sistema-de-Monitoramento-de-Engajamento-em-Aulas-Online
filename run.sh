#!/bin/bash

# Script para iniciar ambos os servidores

echo "🚀 Iniciando Sistema de Monitoramento de Engajamento..."

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "❌ Ambiente virtual não encontrado. Execute ./setup.sh primeiro."
    exit 1
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Iniciar backend em background
echo "▶️  Iniciando backend na porta 8000..."
cd backend
python3 main.py &
BACKEND_PID=$!

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar frontend
echo "▶️  Iniciando frontend na porta 3000..."
cd ../frontend
npm start

# Cleanup quando o script for interrompido
trap "kill $BACKEND_PID" EXIT



