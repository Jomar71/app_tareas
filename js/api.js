// Detectar el entorno de la API
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.protocol === 'file:';

const API_URL = isLocal ? 'http://localhost:5000' : 'https://tu-backend-api.onrender.com';


async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('taskly_token');

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    options.headers = { ...defaultHeaders, ...options.headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    options.signal = controller.signal;

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        clearTimeout(timeoutId);

        if (response.status === 401 && !endpoint.includes('/auth/')) {
            localStorage.removeItem('taskly_token');
            localStorage.removeItem('taskly_user');
            window.location.href = 'auth.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`La conexión con el servidor (${API_URL}) tardó demasiado. ¿Está el backend encendido?`);
        }
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            const context = isLocal ? 'Asegúrate de que el backend esté corriendo en http://localhost:5000' : `El servidor remoto en ${API_URL} no responde o está mal configurado.`;
            console.error(`Error de conexión con ${API_URL}: El backend no responde.`);
            throw new Error(`No se pudo conectar con el servidor (${isLocal ? 'Local' : 'Remoto'}). Intenta abrir la app usando Live Server o localhost. ${context}`);
        }
        throw error;
    }
}

export const api = {
    // Auth
    login: (email, password) => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    register: (email, password) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),

    // Tareas
    getTareas: () => fetchAPI('/tareas/hoy'),
    addTarea: (descripcion, prioridad, fechaHora) => fetchAPI('/tareas/agregar', {
        method: 'POST',
        body: JSON.stringify({ descripcion, prioridad, fecha_programada: fechaHora }),
    }),
    completeTarea: (id) => fetchAPI(`/tareas/completar/${id}`, { method: 'PUT' }),
    deleteTarea: (id) => fetchAPI(`/tareas/eliminar/${id}`, { method: 'DELETE' }),
};