#!/bin/bash

# Script para iniciar ambos os servidores

echo "🚀 Iniciando Sistema de Monitoramento de Engajamento..."

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



