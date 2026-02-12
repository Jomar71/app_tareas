// Para desarrollo local: http://localhost:5000
// Para producción: Reemplaza con la URL de tu backend (ej. Render o Fly.io)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://tu-backend-api.onrender.com'; // Cambia esto cuando tengas el backend desplegado


async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error de conexión con la API:', error);
        throw error;
    }
}

export const api = {
    getTareas: () => fetchAPI('/tareas/hoy'),
    addTarea: (descripcion, prioridad, fechaHora) => fetchAPI('/tareas/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, prioridad, fecha_programada: fechaHora }),
    }),
    completeTarea: (id) => fetchAPI(`/tareas/completar/${id}`, { method: 'PUT' }),
    deleteTarea: (id) => fetchAPI(`/tareas/eliminar/${id}`, { method: 'DELETE' }),
};