from flask import Flask, jsonify, request
from flask_cors import CORS
from database import DatabaseTareas
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permitir acceso desde cualquier dispositivo
db = DatabaseTareas()

@app.route('/')
def home():
    return "API Asistente de Tareas funcionando!"

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    fecha = request.args.get('fecha', datetime.now().strftime("%Y-%m-%d"))
    tareas = db.obtener_por_fecha(fecha)
    return jsonify(tareas)

@app.route('/tareas/hoy', methods=['GET'])
def tareas_hoy():
    hoy = datetime.now().strftime("%Y-%m-%d")
    tareas = db.obtener_por_fecha(hoy)
    return jsonify(tareas)

@app.route('/tareas/agregar', methods=['POST'])
def agregar_tarea():
    data = request.json
    tarea = db.agregar_tarea(
        descripcion=data['descripcion'],
        prioridad=data.get('prioridad', 'MEDIA'),
        fecha=data.get('fecha_programada')
    )
    return jsonify(tarea)

@app.route('/tareas/completar/<int:id_tarea>', methods=['PUT'])
def completar_tarea(id_tarea):
    db.completar_tarea(id_tarea)
    return jsonify({"mensaje": "Tarea completada"})

@app.route('/tareas/eliminar/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea(id_tarea):
    db.eliminar_tarea(id_tarea)
    return jsonify({"mensaje": "Tarea eliminada"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)