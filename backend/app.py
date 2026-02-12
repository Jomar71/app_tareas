from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, bcrypt, User, Task
from auth import auth_bp, token_required
import os

app = Flask(__name__)
CORS(app)

# Configuración de base de datos SQLITE
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt.init_app(app)
from models import limiter
limiter.init_app(app)


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Taskly Backend is running'}), 200

# Registrar rutas de autenticación
app.register_blueprint(auth_bp, url_prefix='/auth')

# Crear tablas si no existen
with app.app_context():
    db.create_all()

@app.route('/tareas/hoy', methods=['GET'])
@token_required
def get_tareas_hoy(current_user):
    # En un sistema real filtraríamos por fecha si fuera necesario, 
    # por ahora devolvemos todas las del usuario actual
    tareas = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([t.to_dict() for t in tareas])

@app.route('/tareas/agregar', methods=['POST'])
@token_required
def agregar_tarea(current_user):
    data = request.get_json()
    nueva_tarea = Task(
        descripcion=data['descripcion'],
        prioridad=data.get('prioridad', 'MEDIA'),
        fecha_programada=data.get('fecha_programada'),
        user_id=current_user.id
    )
    db.session.add(nueva_tarea)
    db.session.commit()
    return jsonify(nueva_tarea.to_dict()), 201

@app.route('/tareas/completar/<int:id>', methods=['PUT'])
@token_required
def completar_tarea(current_user, id):
    tarea = Task.query.filter_by(id=id, user_id=current_user.id).first()
    if not tarea:
        return jsonify({'message': 'Tarea no encontrada'}), 404
    
    tarea.completada = True
    tarea.fecha_completada = os.popen('date /t').read().strip() # Simplemente para tener algo
    db.session.commit()
    return jsonify({'message': 'Tarea completada'})

@app.route('/tareas/eliminar/<int:id>', methods=['DELETE'])
@token_required
def eliminar_tarea(current_user, id):
    tarea = Task.query.filter_by(id=id, user_id=current_user.id).first()
    if not tarea:
        return jsonify({'message': 'Tarea no encontrada'}), 404
    
    db.session.delete(tarea)
    db.session.commit()
    return jsonify({'message': 'Tarea eliminada'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)