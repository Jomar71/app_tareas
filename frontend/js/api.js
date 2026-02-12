// Para desarrollo local: http://localhost:5000
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://tu-backend-api.onrender.com';

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('taskly_token');

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    options.headers = { ...defaultHeaders, ...options.headers };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (response.status === 401 && !endpoint.includes('/auth/')) {
            // Token expirado o inválido, redirigir al login
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
        console.error('Error de conexión con la API:', error);
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