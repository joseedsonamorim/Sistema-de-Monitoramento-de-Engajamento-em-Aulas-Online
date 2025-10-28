"""
Script para inicializar o banco de dados com dados de exemplo
"""

from database import engine, SessionLocal
from models import Base, Aluno, Docente, Aula
from datetime import datetime

def init_db():
    # Criar todas as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem dados
        existing_alunos = db.query(Aluno).count()
        if existing_alunos > 0:
            print("Banco de dados já inicializado.")
            return
        
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
        
        for aluno in alunos_exemplo:
            print(f"✅ Aluno criado: {aluno.nome}")
        
        print("\n🎉 Banco de dados inicializado com sucesso!")
        print(f"📚 Aula ID: {aula.id}")
        print(f"👥 {len(alunos_exemplo)} alunos criados")
        print(f"👨‍🏫 1 docente criado")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()



