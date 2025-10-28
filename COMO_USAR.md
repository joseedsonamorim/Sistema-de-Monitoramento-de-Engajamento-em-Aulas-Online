# 🚀 Como Usar - Inicializador Único

Este projeto agora possui **dois scripts únicos** para rodar todo o sistema com um único comando!

## ✨ Opções Disponíveis

### Opção 1: Script Python (Recomendado)
```bash
python3 run_complete.py
```

**Vantagens:**
- ✅ Interface colorida e amigável
- ✅ Verificação automática de dependências
- ✅ Menu interativo
- ✅ Melhor controle de processos
- ✅ Mensagens claras e informativas

### Opção 2: Script Bash
```bash
./start.sh
```

**Vantagens:**
- ✅ Mais rápido
- ✅ Compatível com qualquer shell Unix
- ✅ Mais leve

## 📋 O Que os Scripts Fazem

Ambos os scripts fazem a mesma coisa:

1. **Verificação de Dependências**
   - Verifica se Python3 está instalado
   - Verifica se npm está instalado

2. **Instalação (opcional)**
   - Cria ambiente virtual Python (`.venv/`) automaticamente
   - Instala pacotes Python (`requirements.txt`) no ambiente virtual
   - Instala pacotes Node.js (frontend)

3. **Inicialização do Banco**
   - Cria o banco SQLite
   - Adiciona dados de exemplo (alunos, docente, aula)

4. **Inicialização dos Serviços**
   - Backend na porta 8000
   - Frontend na porta 3000

## 🎯 Como Usar

### Primeira Vez (Instalação + Execução)

Execute o script e escolha a **opção 1**:

```bash
python3 run_complete.py
# ou
./start.sh
```

Então digite `1` quando perguntado.

### Execuções Seguintes (Apenas Executar)

Execute o script e escolha a **opção 2**:

```bash
python3 run_complete.py
# ou
./start.sh
```

Então digite `2` quando perguntado.

## 🌐 Acessar o Sistema

Após executar o script, você terá acesso a:

- 📱 **Alunos**: http://localhost:3000
- 👨‍🏫 **Docentes**: http://localhost:3000/dashboard
- 🔧 **API Backend**: http://localhost:8000
- 📚 **Documentação da API**: http://localhost:8000/docs

## 🛑 Como Parar

Pressione `Ctrl+C` para encerrar todos os serviços automaticamente.

## ⚠️ Requisitos

Antes de executar, certifique-se de ter instalado:

1. **Python 3** (disponível em: https://python.org)
2. **Node.js e npm** (disponível em: https://nodejs.org)

Verifique a instalação:
```bash
python3 --version
npm --version
```

## 📁 Estrutura

Após a primeira execução, a seguinte estrutura será criada:

```
Monitoramento de Engajamento em Aulas Online/
├── .venv/               ← Ambiente virtual Python (criado automaticamente)
├── backend/
│   ├── monitoramento.db  ← Banco de dados criado automaticamente
│   └── ...
├── frontend/
│   ├── node_modules/     ← Dependências instaladas
│   └── ...
└── ...
```

**Nota:** O diretório `.venv/` é criado automaticamente para isolar as dependências Python do sistema.

## 🔧 Resolução de Problemas

### Erro de compatibilidade Python 3.13
Se você estiver usando Python 3.13 e encontrar erros com SQLAlchemy:
- O script agora usa versões atualizadas das dependências
- Se ainda houver problemas, tente usar Python 3.11 ou 3.12

### Limpar e reinstalar
Se encontrar problemas persistentes:
```bash
# Remover ambiente virtual antigo
rm -rf .venv

# Remover banco de dados antigo  
rm -f backend/monitoramento.db

# Executar o script novamente
python3 run_complete.py
```

### Erro: "Python3 não encontrado"
```bash
# Instale Python
# macOS:
brew install python3

# Linux:
sudo apt-get install python3
```

### Erro: "npm não encontrado"
```bash
# Instale Node.js
# macOS:
brew install node

# Linux:
sudo apt-get install nodejs npm
```

### Erro: "Porta já em uso"
Se as portas 3000 ou 8000 estiverem em uso:
1. Feche aplicações que estejam usando essas portas
2. Ou modifique as portas nos arquivos de configuração

### Erro ao instalar dependências Python
```bash
# Se o script criar um .venv, use o Python do venv
# O script faz isso automaticamente, mas se precisar fazer manualmente:
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Erro ao instalar dependências Node
```bash
cd frontend
npm install
```

## 💡 Dicas

1. **Primeira Execução**: Sempre escolha a opção 1 para instalar tudo
2. **Atualizações**: Se adicionar novas dependências, escolha opção 1 novamente
3. **Reiniciar**: Use opção 2 para reiniciar rapidamente sem reinstalar
4. **Status**: Os scripts mostram o status de cada etapa com ícones coloridos

## 🎓 Dados de Exemplo

O banco é inicializado com:
- 1 docente: Prof. Dr. Carlos Silva
- 5 alunos: Ana Santos, Bruno Oliveira, Carla Pereira, Daniel Souza, Elena Costa
- 1 aula: Introdução à Programação Web

## 📞 Ajuda

Se tiver problemas:
1. Verifique se todas as dependências estão instaladas
2. Verifique se as portas 3000 e 8000 estão livres
3. Tente executar manualmente cada parte para identificar o problema
4. Verifique os logs de erro no terminal

---

**Desenvolvido com ❤️ para educação online**

