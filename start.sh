#!/bin/bash

# Sistema de Monitoramento de Engajamento - Inicializador Simplificado
# Script único para rodar todo o projeto

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Sistema de Monitoramento de Engajamento                  ║"
echo "║         em Aulas Online - Inicializador Completo             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para imprimir informação
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para imprimir aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para imprimir erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "requirements.txt" ]; then
    error "Arquivo requirements.txt não encontrado!"
    error "Execute este script na raiz do projeto."
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    error "Python3 não encontrado!"
    exit 1
fi
success "Python3 encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "Node.js/npm não encontrado!"
    error "Instale em: https://nodejs.org"
    exit 1
fi
success "npm encontrado"

# Menu
echo ""
echo "═══════════════════════════════════════════════════════════"
info "OPÇÕES DE CONFIGURAÇÃO"
echo "═══════════════════════════════════════════════════════════"
echo "1. Instalar dependências e executar (primeira vez)"
echo "2. Apenas executar (pula instalação)"
echo "3. Sair"
echo ""
read -p "Escolha uma opção (1-3): " choice

case $choice in
    1)
        info "Instalando dependências..."
        
        # Instalar Python
        info "Instalando dependências Python..."
        python3 -m pip install -r requirements.txt --user
        if [ $? -eq 0 ]; then
            success "Dependências Python instaladas"
        else
            error "Falha ao instalar dependências Python"
            exit 1
        fi
        
        # Instalar Node
        info "Instalando dependências Node.js..."
        cd frontend
        npm install
        if [ $? -eq 0 ]; then
            success "Dependências Node.js instaladas"
        else
            error "Falha ao instalar dependências Node.js"
            exit 1
        fi
        cd ..
        
        # Inicializar banco (se não existir)
        if [ ! -f "backend/monitoramento.db" ]; then
            info "Inicializando banco de dados..."
            python3 -c "
from backend.database import engine, SessionLocal
from backend.models import Base, Aluno, Docente, Aula
import sys

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    if db.query(Aluno).count() == 0:
        docente = Docente(nome='Prof. Dr. Carlos Silva', email='carlos.silva@universidade.edu.br')
        db.add(docente)
        db.commit()
        db.refresh(docente)
        
        alunos = [
            Aluno(nome='Ana Santos', email='ana.santos@email.com'),
            Aluno(nome='Bruno Oliveira', email='bruno.oliveira@email.com'),
            Aluno(nome='Carla Pereira', email='carla.pereira@email.com'),
            Aluno(nome='Daniel Souza', email='daniel.souza@email.com'),
            Aluno(nome='Elena Costa', email='elena.costa@email.com'),
        ]
        for aluno in alunos:
            db.add(aluno)
        db.commit()
        
        aula = Aula(titulo='Introdução à Programação Web', descricao='Conceitos fundamentais', docente_id=docente.id)
        db.add(aula)
        db.commit()
        
        print('✅ Banco inicializado com sucesso')
    else:
        print('ℹ️  Banco já inicializado')
finally:
    db.close()
"
        fi
        ;;
    2)
        info "Pulando instalação de dependências..."
        ;;
    3)
        info "Saindo..."
        exit 0
        ;;
    *)
        error "Opção inválida!"
        exit 1
        ;;
esac

# Iniciar serviços
info "Iniciando serviços..."

# Iniciar backend em background
info "Iniciando backend..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 3

# Verificar se backend iniciou
if ps -p $BACKEND_PID > /dev/null; then
    success "Backend iniciado (PID: $BACKEND_PID)"
else
    error "Falha ao iniciar backend"
    exit 1
fi

# Iniciar frontend
info "Iniciando frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Aguardar frontend iniciar
sleep 3

echo ""
success "🎉 SISTEMA INICIADO COM SUCESSO!"
echo ""
info "📍 Acesse:"
info "   • Alunos: http://localhost:3000"
info "   • Docentes: http://localhost:3000/dashboard"
info "   • API Backend: http://localhost:8000"
info "   • Docs API: http://localhost:8000/docs"
echo ""
warning "Pressione Ctrl+C para encerrar"
echo ""

# Função de limpeza
cleanup() {
    echo ""
    warning "Encerrando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    sleep 1
    kill -9 $BACKEND_PID 2>/dev/null
    kill -9 $FRONTEND_PID 2>/dev/null
    success "Serviços encerrados. Até logo!"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Aguardar indefinidamente
wait


