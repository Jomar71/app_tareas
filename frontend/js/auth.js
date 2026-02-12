import { api } from './api.js';

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

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
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
    }
}

// Redirigir si ya está logueado
if (localStorage.getItem('taskly_token')) {
    window.location.href = 'index.html';
}
