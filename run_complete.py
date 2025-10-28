#!/usr/bin/env python3
"""
Sistema de Monitoramento de Engajamento em Aulas Online
Script único para configurar e executar todo o projeto
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

class Colors:
    """Cores para terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    """Imprime cabeçalho colorido"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}═══ {message} ═══{Colors.ENDC}")

def print_success(message):
    """Imprime mensagem de sucesso"""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def print_warning(message):
    """Imprime mensagem de aviso"""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")

def print_error(message):
    """Imprime mensagem de erro"""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_info(message):
    """Imprime informação"""
    print(f"{Colors.OKBLUE}ℹ️  {message}{Colors.ENDC}")

def check_command(command):
    """Verifica se comando existe no sistema"""
    try:
        subprocess.run(
            ['which', command],
            check=True,
            capture_output=True
        )
        return True
    except subprocess.CalledProcessError:
        return False

def run_command(cmd, cwd=None, shell=False, capture_output=False):
    """Executa comando e retorna resultado"""
    try:
        if isinstance(cmd, str):
            cmd = cmd.split()
        
        result = subprocess.run(
            cmd,
            cwd=cwd,
            shell=shell,
            check=True,
            capture_output=capture_output,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        return None

def install_python_dependencies():
    """Instala dependências Python"""
    print_header("INSTALANDO DEPENDÊNCIAS DO BACKEND")
    
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print_error("Arquivo requirements.txt não encontrado!")
        return False
    
    # Usar caminho absoluto
    venv_path = Path.cwd() / ".venv"
    
    # Criar virtual environment se não existir
    if not venv_path.exists():
        print_info("Criando ambiente virtual Python...")
        try:
            result = subprocess.run(
                [sys.executable, "-m", "venv", str(venv_path)],
                capture_output=True,
                text=True,
                check=True
            )
            print_success("Ambiente virtual criado")
        except subprocess.CalledProcessError as e:
            print_error(f"Falha ao criar ambiente virtual: {e.stderr}")
            return False
        except Exception as e:
            print_error(f"Falha ao criar ambiente virtual: {e}")
            return False
    
    # Determinar o python do venv
    if sys.platform == "win32":
        venv_python = venv_path / "Scripts" / "python.exe"
        venv_pip = venv_path / "Scripts" / "pip.exe"
    else:
        venv_python = venv_path / "bin" / "python"
        venv_pip = venv_path / "bin" / "pip"
    
    # Verificar se pip existe
    if not venv_pip.exists():
        print_error(f"pip não encontrado em {venv_pip}")
        return False
    
    print_info("Instalando pacotes Python no ambiente virtual...")
    try:
        result = subprocess.run(
            [str(venv_pip), "install", "-r", str(requirements_file)],
            capture_output=True,
            text=True,
            check=True
        )
        print_success("Dependências Python instaladas com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Falha ao instalar dependências Python: {e.stderr}")
        return False
    except Exception as e:
        print_error(f"Falha ao instalar dependências Python: {e}")
        return False

def install_node_dependencies():
    """Instala dependências Node.js"""
    print_header("INSTALANDO DEPENDÊNCIAS DO FRONTEND")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print_error("Diretório frontend não encontrado!")
        return False
    
    print_info("Instalando pacotes Node.js...")
    result = run_command(
        ["npm", "install"],
        cwd="frontend",
        capture_output=True
    )
    
    if result:
        print_success("Dependências Node.js instaladas com sucesso!")
        return True
    else:
        print_error("Falha ao instalar dependências Node.js")
        return False

def initialize_database():
    """Inicializa o banco de dados"""
    print_header("INICIALIZANDO BANCO DE DADOS")
    
    db_file = Path("backend/monitoramento.db")
    if db_file.exists():
        print_warning("Banco de dados já existe. Pulando inicialização.")
        return True
    
    print_info("Criando banco de dados...")
    
    # Usar Python do venv se existir
    venv_path = Path.cwd() / ".venv"
    if venv_path.exists():
        if sys.platform == "win32":
            python_exec = venv_path / "Scripts" / "python.exe"
        else:
            python_exec = venv_path / "bin" / "python"
        # Verificar se existe
        if not python_exec.exists():
            python_exec = sys.executable
        python_exec = str(python_exec)
    else:
        python_exec = sys.executable
    
    # Criar script temporário para inicializar o banco
    init_script = """
import sys
sys.path.insert(0, 'backend')

from backend.database import engine, SessionLocal
from backend.models import Base, Aluno, Docente, Aula

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Verificar se já existem dados
    existing_alunos = db.query(Aluno).count()
    if existing_alunos > 0:
        print("Banco já inicializado.")
        sys.exit(0)
    
    # Criar docente de exemplo
    docente = Docente(
        nome="Prof. Dr. Carlos Silva",
        email="carlos.silva@universidade.edu.br"
    )
    db.add(docente)
    db.commit()
    db.refresh(docente)
    
    print(f"✅ Docente criado: {docente.nome} (ID: {docente.id})")
    
    # Criar alunos de exemplo
    alunos_exemplo = [
        Aluno(nome="Ana Santos", email="ana.santos@email.com"),
        Aluno(nome="Bruno Oliveira", email="bruno.oliveira@email.com"),
        Aluno(nome="Carla Pereira", email="carla.pereira@email.com"),
        Aluno(nome="Daniel Souza", email="daniel.souza@email.com"),
        Aluno(nome="Elena Costa", email="elena.costa@email.com"),
    ]
    
    for aluno in alunos_exemplo:
        db.add(aluno)
    
    db.commit()
    
    # Criar aula de exemplo
    aula = Aula(
        titulo="Introdução à Programação Web",
        descricao="Conceitos fundamentais de HTML, CSS e JavaScript",
        docente_id=docente.id
    )
    db.add(aula)
    db.commit()
    db.refresh(aula)
    
    print(f"✅ Aula criada: {aula.titulo} (ID: {aula.id})")
    print(f"✅ {len(alunos_exemplo)} alunos criados")
    print(f"✅ 1 docente criado")
    print("✅ Banco inicializado com sucesso!")
    
except Exception as e:
    print(f"❌ Erro ao inicializar: {e}")
    sys.exit(1)
finally:
    db.close()
"""
    
    try:
        # Executar script com o Python apropriado
        result = subprocess.run(
            [python_exec, "-c", init_script],
            capture_output=True,
            text=True,
            check=True,
            cwd="."
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return True
        
    except subprocess.CalledProcessError as e:
        print_error(f"Erro ao inicializar banco: {e}")
        if hasattr(e, 'stderr') and e.stderr:
            print_error(f"Detalhes: {e.stderr}")
        return False

def start_backend():
    """Inicia o servidor backend"""
    print_header("INICIANDO BACKEND")
    
    # Usar Python do venv se existir
    venv_path = Path.cwd() / ".venv"
    if venv_path.exists():
        if sys.platform == "win32":
            python_exec = venv_path / "Scripts" / "python.exe"
        else:
            python_exec = venv_path / "bin" / "python"
        # Verificar se existe
        if not python_exec.exists():
            print_warning("Python do venv não encontrado, usando Python do sistema")
            python_exec = sys.executable
    else:
        python_exec = sys.executable
    
    os.chdir("backend")
    backend_process = subprocess.Popen(
        [str(python_exec), "main.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    os.chdir("..")
    
    # Aguardar backend iniciar
    time.sleep(3)
    
    return backend_process

def start_frontend():
    """Inicia o servidor frontend"""
    print_header("INICIANDO FRONTEND")
    
    frontend_process = subprocess.Popen(
        ["npm", "start"],
        cwd="frontend"
    )
    
    return frontend_process

def main():
    """Função principal"""
    print(f"{Colors.BOLD}{Colors.OKCYAN}")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║     Sistema de Monitoramento de Engajamento                  ║")
    print("║         em Aulas Online - Inicializador Completo             ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(Colors.ENDC)
    
    # Verificar comandos necessários
    print_header("VERIFICANDO DEPENDÊNCIAS")
    
    if not check_command("python3"):
        print_error("Python3 não encontrado!")
        sys.exit(1)
    print_success("Python3 encontrado")
    
    if not check_command("npm"):
        print_error("Node.js/npm não encontrado!")
        print_error("Por favor, instale Node.js: https://nodejs.org")
        sys.exit(1)
    print_success("npm encontrado")
    
    # Perguntar ao usuário o que deseja fazer
    print_header("OPÇÕES DE CONFIGURAÇÃO")
    print("1. Instalar dependências e executar (recomendado para primeira vez)")
    print("2. Apenas executar (pula instalação de dependências)")
    print("3. Sair")
    
    choice = input(f"\n{Colors.OKCYAN}Escolha uma opção (1-3): {Colors.ENDC}").strip()
    
    processes = []
    
    try:
        if choice == "1":
            # Instalar dependências
            if not install_python_dependencies():
                print_error("Falha na instalação das dependências Python")
                sys.exit(1)
            
            if not install_node_dependencies():
                print_error("Falha na instalação das dependências Node.js")
                sys.exit(1)
            
            # Inicializar banco de dados
            initialize_database()
            
        elif choice == "3":
            print_info("Saindo...")
            sys.exit(0)
        
        # Executar serviços
        print_header("INICIANDO SERVIÇOS")
        
        backend_process = start_backend()
        processes.append(backend_process)
        print_success("Backend iniciado em http://localhost:8000")
        
        frontend_process = start_frontend()
        processes.append(frontend_process)
        print_success("Frontend iniciado em http://localhost:3000")
        
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}")
        print("╔══════════════════════════════════════════════════════════════╗")
        print("║                  🎉 SISTEMA INICIADO COM SUCESSO! 🎉          ║")
        print("╚══════════════════════════════════════════════════════════════╝")
        print(Colors.ENDC)
        
        print(f"\n{Colors.OKCYAN}📍 Acesse:{Colors.ENDC}")
        print(f"{Colors.OKGREEN}   • Alunos: http://localhost:3000{Colors.ENDC}")
        print(f"{Colors.OKGREEN}   • Docentes: http://localhost:3000/dashboard{Colors.ENDC}")
        print(f"{Colors.OKGREEN}   • API Backend: http://localhost:8000{Colors.ENDC}")
        print(f"{Colors.OKCYAN}   • Docs API: http://localhost:8000/docs{Colors.ENDC}")
        
        print(f"\n{Colors.WARNING}⚠️  Pressione Ctrl+C para encerrar todos os serviços{Colors.ENDC}\n")
        
        # Aguardar até que o usuário pare
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}⚠️  Encerrando serviços...{Colors.ENDC}")
        
        for process in processes:
            try:
                process.terminate()
            except:
                pass
        
        time.sleep(1)
        
        for process in processes:
            try:
                process.kill()
            except:
                pass
        
        print_success("Todos os serviços encerrados. Até logo!")
        sys.exit(0)
    
    except Exception as e:
        print_error(f"Erro: {e}")
        
        # Limpar processos em caso de erro
        for process in processes:
            try:
                process.terminate()
                process.kill()
            except:
                pass
        
        sys.exit(1)

if __name__ == "__main__":
    main()

