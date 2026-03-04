console.log("Taskly Auth Module Loaded");
import { api } from './api.js?v=1.2';

// Alertar si hay problemas de carga (común en file://)
window.onerror = function () {
    alert("Error al cargar los módulos de seguridad. Asegúrate de usar un servidor local (como Live Server) o que el backend esté activo.");
};

let currentMode = 'LOGIN';



window.showLogin = function () {
    currentMode = 'LOGIN';
    document.getElementById('toggleLogin').classList.add('active');
    document.getElementById('toggleLogin').classList.remove('text-slate-500');
    document.getElementById('toggleLogin').classList.add('text-gold');
    document.getElementById('toggleRegister').classList.remove('active');
    document.getElementById('toggleRegister').classList.remove('text-gold');
    document.getElementById('toggleRegister').classList.add('text-slate-500');
    document.getElementById('submitText').textContent = 'Iniciar Sesión';
    hideError();
}

window.showRegister = function () {
    currentMode = 'REGISTER';
    document.getElementById('toggleRegister').classList.add('active');
    document.getElementById('toggleRegister').classList.remove('text-slate-500');
    document.getElementById('toggleRegister').classList.add('text-gold');
    document.getElementById('toggleLogin').classList.remove('active');
    document.getElementById('toggleLogin').classList.remove('text-gold');
    document.getElementById('toggleLogin').classList.add('text-slate-500');
    document.getElementById('submitText').textContent = 'Crear Cuenta';
    hideError();
}

function showError(msg) {
    const errorEl = document.getElementById('authError');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('authError').style.display = 'none';
}

window.handleAuth = async function (event) {
    event.preventDefault();
    hideError();

    const btn = document.querySelector('.btn-primary');
    const originalText = document.getElementById('submitText').textContent;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Por favor ingresa email y contraseña');
        return;
    }

    try {
        // Set loading state
        btn.disabled = true;
        document.getElementById('submitText').textContent = 'Procesando...';

        if (currentMode === 'LOGIN') {
            const response = await api.login(email, password);
            localStorage.setItem('taskly_token', response.token);
            localStorage.setItem('taskly_user', JSON.stringify(response.user));
            window.location.href = 'index.html'; // Cambiado a index.html como página principal
        } else {
            await api.register(email, password);
            alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            showLogin();
        }
    } catch (error) {
        // Mejor manejo de errores
        let errorMessage = error.message || 'Error al procesar la solicitud';
        if (error.message.includes('401')) {
            errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('400')) {
            errorMessage = 'Datos inválidos. Verifica tu información.';
        } else if (error.message.includes('Network Error') || error.message.includes('Backend no responde')) {
            errorMessage = 'No se pudo conectar al servidor. Se está usando modo offline local.';
        } else if (error.message.includes('Credenciales inválidas')) {
            errorMessage = 'Credenciales inválidas (Modo Local)';
        }
        showError(errorMessage);
    } finally {
        btn.disabled = false;
        document.getElementById('submitText').textContent = originalText;
    }
}


// Redirigir si ya está logueado
if (localStorage.getItem('taskly_token')) {
    window.location.href = 'index.html'; // Actualizado para usar index.html como página principal
}