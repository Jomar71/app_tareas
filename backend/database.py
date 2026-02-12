import json
import os
from datetime import datetime

class DatabaseTareas:
    def __init__(self, archivo='tareas.json'):
        self.archivo = archivo
        self._inicializar_archivo()
    
    def _inicializar_archivo(self):
        if not os.path.exists(self.archivo):
            with open(self.archivo, 'w') as f:
                json.dump({"tareas": []}, f)
    
    def _leer_tareas(self):
        with open(self.archivo, 'r') as f:
            return json.load(f)["tareas"]
    
    def _guardar_tareas(self, tareas):
        with open(self.archivo, 'w') as f:
            json.dump({"tareas": tareas}, f, indent=2)
    
    def obtener_todas(self):
        return self._leer_tareas()
    
    def obtener_por_fecha(self, fecha):
        tareas = self._leer_tareas()
        tareas_filtradas = []
        for t in tareas:
            fecha_programada_str = t.get('fecha_programada')
            if fecha_programada_str:
                fecha_programada_dt = datetime.fromisoformat(fecha_programada_str.replace(' ', 'T'))
                if fecha_programada_dt.date() == datetime.strptime(fecha, '%Y-%m-%d').date():
                    tareas_filtradas.append(t)
        return tareas_filtradas
    
    def agregar_tarea(self, descripcion, prioridad="MEDIA", fecha=None):
        if not fecha:
            fecha = datetime.now().isoformat()
        
        tareas = self._leer_tareas()
        nueva_tarea = {
            "id": (max([t['id'] for t in tareas]) + 1) if tareas else 1,
            "descripcion": descripcion,
            "prioridad": prioridad,
            "fecha_programada": fecha,
            "completada": False,
            "fecha_creacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        tareas.append(nueva_tarea)
        self._guardar_tareas(tareas)
        return nueva_tarea
    
    def completar_tarea(self, id_tarea):
        tareas = self._leer_tareas()
        for tarea in tareas:
            if tarea['id'] == id_tarea:
                tarea['completada'] = True
                tarea['fecha_completada'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                break
        
        self._guardar_tareas(tareas)
        return True
    
    def eliminar_tarea(self, id_tarea):
        tareas = self._leer_tareas()
        tareas = [t for t in tareas if t['id'] != id_tarea]
        self._guardar_tareas(tareas)
        return True