import { GestorTareas } from './tareas.js?v=1.2';
import { actualizarFecha } from './ui.js?v=1.2';

let gestorTareas;

window.agregarTarea = async function () {
    try {
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

        await gestorTareas.agregarTarea(descripcion, prioridad, `${fecha} ${hora}`);
        input.value = '';
        input.focus();
        console.log('Taskly: Tarea agregada con éxito');
    } catch (error) {
        console.error('Taskly: Error al agregar tarea:', error);
        alert('Hubo un error al guardar la tarea. Revisa la consola.');
    }
}

window.filtrarTareas = function (filtro) {
    gestorTareas.filtrarTareas(filtro);
}

// Redirigir si no hay token
if (!localStorage.getItem('taskly_token')) {
    window.location.href = 'auth.html';
}

window.logout = function () {
    localStorage.removeItem('taskly_token');
    localStorage.removeItem('taskly_user');
    window.location.href = 'auth.html';
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {

    // Auto-corrección: Limpiar basura de versiones anteriores si existe
    if (localStorage.getItem('taskly_token') === 'undefined' || localStorage.getItem('taskly_user') === 'undefined') {
        localStorage.removeItem('taskly_token');
        localStorage.removeItem('taskly_user');
        window.location.reload();
        return;
    }
    const user = JSON.parse(localStorage.getItem('taskly_user'));
    if (user) {
        document.getElementById('userEmail').textContent = user.email;
    }

    gestorTareas = new GestorTareas();
    window.gestorTareas = gestorTareas; // Para acceso desde los onchange/onclick en el HTML
    actualizarFecha();
    gestorTareas.cargarTareas();

    // Inicializar fecha y hora
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset();
    const ahoraLocal = new Date(ahora.getTime() - (offset * 60 * 1000));
    const fechaInput = document.getElementById('fechaTarea');
    const horaInput = document.getElementById('horaTarea');
    const priorityInput = document.getElementById('prioridadTarea');

    fechaInput.value = ahoraLocal.toISOString().split('T')[0];
    horaInput.value = ahoraLocal.toISOString().substring(11, 16);

    // Asegurar que al hacer clic en cualquier parte del selector se abra el picker
    [fechaInput, horaInput].forEach(el => {
        el.addEventListener('click', () => {
            try {
                if (el.showPicker) el.showPicker();
                else el.focus();
            } catch (e) {
                el.focus();
            }
        });
    });

    // También abrir al hacer clic en el label
    document.querySelectorAll('.detail-item label').forEach(label => {
        label.addEventListener('click', (e) => {
            const id = label.getAttribute('for');
            const target = document.getElementById(id);
            if (target) {
                try {
                    if (target.showPicker) target.showPicker();
                    else target.focus();
                } catch (err) {
                    target.focus();
                }
            }
        });
    });

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