import json
import sqlite3
import os
from werkzeug.security import generate_password_hash

# Script simple para migrar tareas del JSON al primer usuario del sistema
def migrate():
    basedir = os.path.abspath(os.path.dirname(__file__))
    json_path = os.path.join(basedir, 'tareas.json')
    db_path = os.path.join(basedir, 'app.db')
    
    if not os.path.exists(json_path):
        print("No se encontró tareas.json, omitiendo migración.")
        return

    if not os.path.exists(db_path):
        print("Base de datos no encontrada. Ejecuta app.py primero.")
        return

    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
            tareas = data.get("tareas", [])

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Obtener el primer usuario o crear uno por defecto
        cursor.execute("SELECT id FROM users LIMIT 1")
        user = cursor.fetchone()
        
        if not user:
            print("No hay usuarios en la base de datos. Por favor, regístrate primero en la app.")
            return

        user_id = user[0]
        
        for t in tareas:
            # Evitar duplicados simples
            cursor.execute("SELECT id FROM tasks WHERE descripcion = ? AND user_id = ?", (t['descripcion'], user_id))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO tasks (descripcion, prioridad, fecha_programada, completada, user_id)
                    VALUES (?, ?, ?, ?, ?)
                """, (t['descripcion'], t['prioridad'], t['fecha_programada'], t['completada'], user_id))
        
        conn.commit()
        conn.close()
        print(f"Migración completada: {len(tareas)} tareas migradas al usuario ID {user_id}")
        
        # Opcional: Renombrar el archivo JSON para evitar re-migraciones
        os.rename(json_path, json_path + '.bak')

    except Exception as e:
        print(f"Error durante la migración: {e}")

if __name__ == "__main__":
    migrate()
