import { GestorTareas } from './tareas.js?v=1.3';
import { actualizarFecha, fechaCalendario, generarCalendario } from './ui.js?v=1.3';

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
        if (error.message.includes('Sesión expirada')) {
            return; // El API ya mandó a redirigir
        }
        alert('Hubo un error al guardar la tarea. ' + error.message);
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

window.toggleTema = function () {
    const html = document.documentElement;
    const isLight = html.classList.contains('light-theme');
    const icon = document.getElementById('temaIcon');

    if (isLight) {
        html.classList.remove('light-theme');
        if (icon) icon.textContent = 'light_mode';
        localStorage.setItem('taskly_theme', 'dark');
    } else {
        html.classList.add('light-theme');
        if (icon) icon.textContent = 'dark_mode';
        localStorage.setItem('taskly_theme', 'light');
    }
}

window.vistaActualCalendario = 'mes';

window.cambiarVista = function (vista) {
    window.vistaActualCalendario = vista;
    document.querySelectorAll('.vista-btn').forEach(btn => {
        btn.classList.remove('bg-surface', 'text-gold', 'border', 'border-gold/20', 'shadow-lg', 'active-vista');
        btn.classList.add('text-slate-500');
    });
    const btn = document.getElementById('btn-vista-' + vista);
    if (btn) {
        btn.classList.add('bg-surface', 'text-gold', 'border', 'border-gold/20', 'shadow-lg', 'active-vista');
        btn.classList.remove('text-slate-500');
    }
    if (gestorTareas) {
        generarCalendario(gestorTareas.tareas);
    }
}

window.cambiarMes = function (direccion) {
    fechaCalendario.setMonth(fechaCalendario.getMonth() + direccion);
    generarCalendario(gestorTareas.tareas);
}

window.toggleLogoBrand = function (event) {
    if (event && event.shiftKey) {
        document.getElementById('logoFileInput').click();
        return;
    }

    const icon = document.getElementById('appLogoIcon');
    const img = document.getElementById('appLogoImage');
    const text = document.getElementById('appLogoText');
    const isIconVisible = !icon.classList.contains('hidden');

    if (isIconVisible) {
        icon.classList.add('hidden');
        img.classList.remove('hidden');
        text.style.display = 'block';
    } else if (!img.classList.contains('hidden') && text.style.display !== 'none') {
        text.style.display = 'none';
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    } else {
        text.style.display = 'block';
        img.classList.add('hidden');
        icon.classList.remove('hidden');
    }
}

function procesarImagenBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const MAX_SIZE = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.subirLogoPersonalizado = function (event) {
    const file = event.target.files[0];
    if (file) {
        procesarImagenBase64(file, function (base64Image) {
            try {
                const user = JSON.parse(localStorage.getItem('taskly_user'));
                const prefix = user ? user.email + '_' : '';
                localStorage.setItem(prefix + 'taskly_custom_logo', base64Image);

                const img = document.getElementById('appLogoImage');
                img.src = base64Image;

                document.getElementById('appLogoIcon').classList.add('hidden');
                img.classList.remove('hidden');
                document.getElementById('appLogoText').style.display = 'block';
            } catch (e) {
                alert('No hay suficiente espacio para guardar la imagen. Prueba a borrar datos de navegación.');
            }
        });
    }
}

window.subirFotoPerfil = function (event) {
    const file = event.target.files[0];
    if (file) {
        procesarImagenBase64(file, function (base64Image) {
            try {
                const user = JSON.parse(localStorage.getItem('taskly_user'));
                const prefix = user ? user.email + '_' : '';
                localStorage.setItem(prefix + 'taskly_profile_pic', base64Image);

                document.getElementById('userProfileImg').src = base64Image;
                document.getElementById('userProfileImg').classList.remove('hidden');
                if (document.getElementById('userInitials')) {
                    document.getElementById('userInitials').classList.add('hidden');
                }
            } catch (e) {
                alert('No hay suficiente espacio para guardar la foto. Prueba a borrar datos de navegación.');
            }
        });
    }
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

    const savedTheme = localStorage.getItem('taskly_theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        const icon = document.getElementById('temaIcon');
        if (icon) icon.textContent = 'dark_mode';
    }

    const user = JSON.parse(localStorage.getItem('taskly_user'));
    const userPrefix = user ? user.email + '_' : '';

    if (user) {
        if (document.getElementById('userEmail')) document.getElementById('userEmail').textContent = user.email;
        if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').textContent = user.nombre || 'Elite User';
        if (document.getElementById('userInitials')) {
            const initials = (user.nombre || 'EU').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            document.getElementById('userInitials').textContent = initials;
        }
    }

    const profilePic = localStorage.getItem(userPrefix + 'taskly_profile_pic');
    if (profilePic && document.getElementById('userProfileImg')) {
        document.getElementById('userProfileImg').src = profilePic;
        document.getElementById('userProfileImg').classList.remove('hidden');
        if (document.getElementById('userInitials')) {
            document.getElementById('userInitials').classList.add('hidden');
        }
    }

    const customLogo = localStorage.getItem(userPrefix + 'taskly_custom_logo');
    if (customLogo) {
        document.getElementById('appLogoImage').src = customLogo;
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