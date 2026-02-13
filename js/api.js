// Detectar el entorno de la API
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.protocol === 'file:';

// URL de producción
const API_URL = isLocal ? 'http://localhost:5000' : 'https://tu-backend-api.onrender.com';

// Sistema de persistencia local
const getLocalData = (key, defaultVal = []) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Estado de conexión
let useMock = !isLocal && API_URL.includes('tu-backend-api');

const mockApi = {
    login: async (email, password) => {
        const users = getLocalData('mock_users');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Credenciales inválidas (Modo Local)');
        const token = 'mock-token-' + Date.now();
        const userData = { id: user.id, email: user.email };
        return { token, user: userData }; // Formato idéntico al backend real
    },
    register: async (email, password) => {
        const users = getLocalData('mock_users');
        if (users.some(u => u.email === email)) throw new Error('Este correo ya está registrado localmente');
        const newUser = { email, password, id: Date.now() };
        users.push(newUser);
        setLocalData('mock_users', users);
        return { message: 'Usuario registrado localmente', user: { email: newUser.email } };
    },
    getTareas: async () => {
        const userStr = localStorage.getItem('taskly_user');
        if (!userStr || userStr === "undefined") return [];
        try {
            const user = JSON.parse(userStr);
            const allTareas = getLocalData('mock_tareas');
            return allTareas.filter(t => t.user_email === user.email);
        } catch (e) { return []; }
    },
    addTarea: async (descripcion, prioridad, fechaHora) => {
        const userStr = localStorage.getItem('taskly_user');
        if (!userStr || userStr === "undefined") throw new Error('Sesión inválida. Por favor re-inicia sesión.');
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
    if (useMock) {
        return handleMockRequest(endpoint, options);
    }

    const token = localStorage.getItem('taskly_token');
    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token && token !== "undefined") defaultHeaders['Authorization'] = `Bearer ${token}`;
    options.headers = { ...defaultHeaders, ...options.headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
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
        if (!isLocal && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.warn("Backend no responde. Pasando a Modo Offline Local.");
            useMock = true;
            return handleMockRequest(endpoint, options);
        }
        throw error;
    }
}

function handleMockRequest(endpoint, options) {
    const body = options.body ? JSON.parse(options.body) : {};
    if (endpoint.includes('/login')) return mockApi.login(body.email, body.password);
    if (endpoint.includes('/register')) return mockApi.register(body.email, body.password);
    if (endpoint.includes('/hoy')) return mockApi.getTareas();
    if (endpoint.includes('/agregar')) return mockApi.addTarea(body.descripcion, body.prioridad, body.fecha_programada);
    if (endpoint.includes('/completar')) return mockApi.completeTarea(parseInt(endpoint.split('/').pop()));
    if (endpoint.includes('/eliminar')) return mockApi.deleteTarea(parseInt(endpoint.split('/').pop()));
}

export const api = {
    isMock: () => useMock,
    login: (email, password) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
    getTareas: () => fetchAPI('/tareas/hoy'),
    addTarea: (d, p, f) => fetchAPI('/tareas/agregar', { method: 'POST', body: JSON.stringify({ descripcion: d, prioridad: p, fecha_programada: f }) }),
    completeTarea: (id) => fetchAPI(`/tareas/completar/${id}`, { method: 'PUT' }),
    deleteTarea: (id) => fetchAPI(`/tareas/eliminar/${id}`, { method: 'DELETE' }),
};