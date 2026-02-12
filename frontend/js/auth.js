console.log("Taskly Auth Module Loaded");
import { api } from './api.js';

// Alertar si hay problemas de carga (común en file://)
window.onerror = function () {
    alert("Error al cargar los módulos de seguridad. Asegúrate de usar un servidor local (como Live Server) o que el backend esté activo.");
};

let currentMode = 'LOGIN';



window.showLogin = function () {
    currentMode = 'LOGIN';
    document.getElementById('toggleLogin').classList.add('active');
    document.getElementById('toggleRegister').classList.remove('active');
    document.getElementById('submitText').textContent = 'Iniciar Sesión';
    hideError();
}

window.showRegister = function () {
    currentMode = 'REGISTER';
    document.getElementById('toggleRegister').classList.add('active');
    document.getElementById('toggleLogin').classList.remove('active');
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

    try {
        // Set loading state
        btn.disabled = true;
        document.getElementById('submitText').textContent = 'Procesando...';

        if (currentMode === 'LOGIN') {
            const response = await api.login(email, password);
            localStorage.setItem('taskly_token', response.token);
            localStorage.setItem('taskly_user', JSON.stringify(response.user));
            window.location.href = 'index.html';
        } else {
            await api.register(email, password);
            alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            showLogin();
        }
    } catch (error) {
        showError(error.message || 'Error al procesar la solicitud');
    } finally {
        btn.disabled = false;
        document.getElementById('submitText').textContent = originalText;
    }
}


// Redirigir si ya está logueado
if (localStorage.getItem('taskly_token')) {
    window.location.href = 'index.html';
}
