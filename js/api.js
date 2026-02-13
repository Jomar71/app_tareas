// Detectar el entorno de la API
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.protocol === 'file:';

// URL de producción (Solo activa si no es localhost)
const API_URL = isLocal ? 'http://localhost:5000' : 'https://tu-backend-api.onrender.com';

// Sistema de persistencia local (Fallback para GH Pages sin backend)
const getLocalData = (key, defaultVal = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockApi = {
    login: async (email, password) => {
        const users = getLocalData('mock_users');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Credenciales inválidas (Modo Demo)');
        localStorage.setItem('taskly_token', 'mock-token-' + Date.now());
        localStorage.setItem('taskly_user', JSON.stringify({ email }));
        return { message: 'Iniciando modo demo' };
    },
    register: async (email, password) => {
        const users = getLocalData('mock_users');
        if (users.some(u => u.email === email)) throw new Error('Usuario ya existe');
        users.push({ email, password, id: Date.now() });
        setLocalData('mock_users', users);
        return { message: 'Usuario registrado localmente' };
    },
    getTareas: async () => {
        const user = JSON.parse(localStorage.getItem('taskly_user'));
        const allTareas = getLocalData('mock_tareas');
        return allTareas.filter(t => t.user_email === user.email);
    },
    addTarea: async (descripcion, prioridad, fechaHora) => {
        const user = JSON.parse(localStorage.getItem('taskly_user'));
        const tareas = getLocalData('mock_tareas');
        const nueva = {
            id: Date.now(),
            descripcion,
            prioridad,
            fecha_programada: fechaHora,
            completada: false,
            user_email: user.email
        };
        tareas.push(nueva);
        setLocalData('mock_tareas', tareas);
        return nueva;
    },
    completeTarea: async (id) => {
        const tareas = getLocalData('mock_tareas');
        const task = tareas.find(t => t.id === id);
        if (task) task.completada = true;
        setLocalData('mock_tareas', tareas);
        return { message: 'Completada' };
    },
    deleteTarea: async (id) => {
        const tareas = getLocalData('mock_tareas').filter(t => t.id !== id);
        setLocalData('mock_tareas', tareas);
        return { message: 'Eliminada' };
    }
};

let useMock = false;

async function fetchAPI(endpoint, options = {}) {
    if (useMock && !endpoint.includes('/auth/')) {
        const method = endpoint.split('/')[2]; // Simplista
        // Redirigir a mockApi si ya estamos en ese modo
    }

    const token = localStorage.getItem('taskly_token');
    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;
    options.headers = { ...defaultHeaders, ...options.headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    options.signal = controller.signal;

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        clearTimeout(timeoutId);

        if (response.status === 401 && !endpoint.includes('/auth/')) {
            localStorage.removeItem('taskly_token');
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

        // Si falla la conexión y estamos en GH Pages, activamos el Mock automáticamente
        if (!isLocal && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.warn("Backend no disponible. Entrando en Modo Demo (Datos locales).");
            useMock = true;
            showDemoWarning();
            // Ejecutar la acción en el Mock
            return handleMockRequest(endpoint, options);
        }

        throw error;
    }
}

function showDemoWarning() {
    if (document.getElementById('demo-warning')) return;
    const banner = document.createElement('div');
    banner.id = 'demo-warning';
    banner.style = "background: #ffeb3b; color: #333; padding: 10px; font-weight: bold; text-align: center; font-size: 14px; position: sticky; top: 0; z-index: 1000;";
    banner.innerHTML = "⚠️ MODO DEMO ACTIVO: Las tareas se guardan solo en este navegador. <a href='https://github.com/Jomar71/app_tareas/blob/main/walkthrough.md' target='_blank'>Configurar Nube aquí</a>";
    document.body.prepend(banner);
}

function handleMockRequest(endpoint, options) {
    if (endpoint.includes('/login')) return mockApi.login(JSON.parse(options.body).email, JSON.parse(options.body).password);
    if (endpoint.includes('/register')) return mockApi.register(JSON.parse(options.body).email, JSON.parse(options.body).password);
    if (endpoint.includes('/hoy')) return mockApi.getTareas();
    if (endpoint.includes('/agregar')) return mockApi.addTarea(JSON.parse(options.body).descripcion, JSON.parse(options.body).prioridad, JSON.parse(options.body).fecha_programada);
    if (endpoint.includes('/completar')) return mockApi.completeTarea(parseInt(endpoint.split('/').pop()));
    if (endpoint.includes('/eliminar')) return mockApi.deleteTarea(parseInt(endpoint.split('/').pop()));
}

export const api = {
    login: (email, password) => useMock ? mockApi.login(email, password) : fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) => useMock ? mockApi.register(email, password) : fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    getTareas: () => useMock ? mockApi.getTareas() : fetchAPI('/tareas/hoy'),
    addTarea: (d, p, f) => useMock ? mockApi.addTarea(d, p, f) : fetchAPI('/tareas/agregar', { method: 'POST', body: JSON.stringify({ descripcion: d, prioridad: p, fecha_programada: f }) }),
    completeTarea: (id) => useMock ? mockApi.completeTarea(id) : fetchAPI(`/tareas/completar/${id}`, { method: 'PUT' }),
    deleteTarea: (id) => useMock ? mockApi.deleteTarea(id) : fetchAPI(`/tareas/eliminar/${id}`, { method: 'DELETE' }),
};