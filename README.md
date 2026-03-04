# Taskly - Asistente de Tareas

Un asistente de gestión de tareas con funcionalidades de autenticación, creación de tareas, y seguimiento de rendimiento.

## Características

- Registro e inicio de sesión de usuarios
- Gestión de tareas con diferentes niveles de prioridad
- Calendario para visualizar tareas
- Métricas de rendimiento diario
- Modo oscuro y claro
- Soporte para dictado por voz

## Instalación

### Backend (Python/Flask)

1. Asegúrate de tener Python 3.x instalado
2. Navega al directorio `backend`:
   ```bash
   cd backend
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicia el servidor:
   ```bash
   python app.py
   ```
   
El servidor se iniciará en `http://localhost:5000`.

### Frontend (HTML/CSS/JavaScript)

No se requiere instalación adicional. Simplemente abre `index.html` en tu navegador o sirve los archivos estáticos desde un servidor web.

## Configuración

### URL del Backend

En el archivo `js/api.js`, asegúrate de que la URL del backend esté correctamente configurada:

```javascript
const API_URL = isLocal ? 'http://localhost:5000' : 'https://tu-backend-en-produccion.com';
```

## Despliegue en Render

Para desplegar el backend en Render:

1. Crea una nueva aplicación web en Render
2. Conecta tu repositorio Git
3. Usa los siguientes ajustes:
   - Environment: Python
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && python app.py`

Luego actualiza la URL del backend en `js/api.js` con la URL proporcionada por Render.

## Solución de Problemas

- Si no puedes iniciar sesión o registrarte, verifica que el backend esté corriendo y accesible
- Si estás en modo local, asegúrate de que la URL del backend sea `http://localhost:5000`
- En caso de problemas de CORS, verifica que el backend tenga Flask-CORS instalado y habilitado