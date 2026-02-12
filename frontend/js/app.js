import { GestorTareas } from './tareas.js';
import { actualizarFecha } from './ui.js';

let gestorTareas;

window.agregarTarea = function () {
    const input = document.getElementById('nuevaTarea');
    const select = document.getElementById('prioridadTarea');
    const fechaInput = document.getElementById('fechaTarea');
    const horaInput = document.getElementById('horaTarea');

    const descripcion = input.value.trim();
    const prioridad = select.value;
    const fecha = fechaInput.value;
    const hora = horaInput.value;

    if (descripcion === '') {
        alert('Por favor, escribe una tarea');
        return;
    }

    gestorTareas.agregarTarea(descripcion, prioridad, `${fecha} ${hora}`);
    input.value = '';
    input.focus();
}

window.filtrarTareas = function (filtro) {
    gestorTareas.filtrarTareas(filtro);
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    gestorTareas = new GestorTareas();
    window.gestorTareas = gestorTareas; // Para acceso desde los onchange/onclick en el HTML
    actualizarFecha();
    gestorTareas.cargarTareas();

    // Inicializar fecha y hora
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset();
    const ahoraLocal = new Date(ahora.getTime() - (offset * 60 * 1000));
    document.getElementById('fechaTarea').value = ahoraLocal.toISOString().split('T');
    document.getElementById('horaTarea').value = ahoraLocal.toISOString().substring(11, 16);

    // Enter para agregar tarea
    document.getElementById('nuevaTarea').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            agregarTarea();
        }
    });
});

window.iniciarReconocimientoVoz = function () {
    const btnVoz = document.getElementById('btnVoz');
    const inputTarea = document.getElementById('nuevaTarea');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('Lo siento, tu navegador no soporta el reconocimiento de voz.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onstart = () => {
        btnVoz.classList.add('grabando');
        btnVoz.textContent = '…';
    };

    recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        inputTarea.value = texto;
        // Pequeño delay para que el usuario vea el texto antes de agregar
        setTimeout(() => {
            agregarTarea();
        }, 500);
    };

    recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        if (event.error === 'not-allowed') {
            alert('Permiso de micrófono denegado. Por favor, actívalo en tu navegador.');
        } else {
            alert('No se pudo reconocer tu voz. Inténtalo de nuevo.');
        }
    };

    recognition.onend = () => {
        btnVoz.classList.remove('grabando');
        btnVoz.textContent = '🎤';
    };

    recognition.start();
}