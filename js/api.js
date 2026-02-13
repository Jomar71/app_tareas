// Detectar el entorno de la API
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.protocol === 'file:';

// URL de producción (Solo activa si no es localhost)
const API_URL = isLocal ? 'http://localhost:5000' : 'https://tu-backend-api.onrender.com';

// Sistema de persistencia local (Fallback para funcionalidad 100% offline)
const getLocalData = (key, defaultVal = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Estado de conexión: Si la URL es de ejemplo, usamos Mock por defecto
let useMock = !isLocal && API_URL.includes('tu-backend-api');

const mockApi = {
    login: async (email, password) => {
        const users = getLocalData('mock_users');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Credenciales inválidas (Modo Local)');
        localStorage.setItem('taskly_token', 'mock-token-' + Date.now());
        localStorage.setItem('taskly_user', JSON.stringify({ email }));
        return { message: 'Iniciando sesión en modo local' };
    },
    register: async (email, password) => {
        const users = getLocalData('mock_users');
        if (users.some(u => u.email === email)) throw new Error('Este correo ya está registrado localmente');
        users.push({ email, password, id: Date.now() });
        setLocalData('mock_users', users);
        return { message: 'Usuario registrado localmente' };
    },
    getTareas: async () => {
        const userStr = localStorage.getItem('taskly_user');
        if (!userStr) return [];
        const user = JSON.parse(userStr);
        const allTareas = getLocalData('mock_tareas');
        return allTareas.filter(t => t.user_email === user.email);
    },
    addTarea: async (descripcion, prioridad, fechaHora) => {
        const userStr = localStorage.getItem('taskly_user');
        if (!userStr) throw new Error('Debes iniciar sesión');
        const user = JSON.parse(userStr);
        const tareas = getLocalData('mock_tareas');
        const nueva = {
            id: Date.now(),
            descripcion,
            prioridad,
            fecha_programada: fechaHora,
            completada: false,
            user_email: user.email,
            fecha_creacion: new Date().toISOString()
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

async function fetchAPI(endpoint, options = {}) {
    // Si estamos usando Modo Mock por configuración o falla previa
    if (useMock) {
        showStatusInfo();
        return handleMockRequest(endpoint, options);
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

        // Si falla la conexión remota, activamos el Mock automáticamente y reintentamos
        if (!isLocal && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.warn("Backend no responde. Pasando a Modo Offline Local.");
            useMock = true;
            showStatusInfo();
            return handleMockRequest(endpoint, options);
        }

        throw error;
    }
}

function showStatusInfo() {
    if (document.getElementById('cloud-status')) return;
    const banner = document.createElement('div');
    banner.id = 'cloud-status';
    banner.style = "background: #4caf50; color: white; padding: 6px; text-align: center; font-size: 12px; font-weight: 500;";
    banner.innerHTML = "💾 Modo Autónomo Activo: Tus tareas se guardan en este dispositivo.";
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
    login: (email, password) => (useMock) ? handleMockRequest('/login', { body: JSON.stringify({ email, password }) }) : fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) => (useMock) ? handleMockRequest('/register', { body: JSON.stringify({ email, password }) }) : fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    getTareas: () => fetchAPI('/tareas/hoy'),
    addTarea: (d, p, f) => fetchAPI('/tareas/agregar', { method: 'POST', body: JSON.stringify({ descripcion: d, prioridad: p, fecha_programada: f }) }),
    completeTarea: (id) => fetchAPI(`/tareas/completar/${id}`, { method: 'PUT' }),
    deleteTarea: (id) => fetchAPI(`/tareas/eliminar/${id}`, { method: 'DELETE' }),
};