import { GestorTareas } from './tareas.js?v=1.3';
import { actualizarFecha, fechaCalendario, generarCalendario } from './ui.js?v=1.3';

let gestorTareas;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function () {
    gestorTareas = new GestorTareas();
    window.gestorTareas = gestorTareas; // Hacer disponible globalmente para eventos onclick

    try {
        await gestorTareas.cargarTareas();
        console.log('Taskly: Tareas cargadas exitosamente');
    } catch (error) {
        console.error('Taskly: Error al cargar tareas:', error);
        if (error.message.includes('Sesión expirada')) {
            return; // El API ya mandó a redirigir
        }
        alert('Hubo un error al cargar las tareas. ' + error.message);
    }

    inicializarTema();
});

// Función para cambiar entre icono y texto del logo
window.toggleLogoBrand = function (event) {
    const logoIcon = document.getElementById('appLogoIcon');
    const logoImage = document.getElementById('appLogoImage');
    const logoText = document.getElementById('appLogoText');
    const logoSubtext = document.getElementById('appLogoSubtext');

    // Si se presiona shift+clic, abrir diálogo para subir imagen
    if (event.shiftKey) {
        event.preventDefault();
        document.getElementById('logoFileInput').click();
        return;
    }

    // Alternar entre icono y texto del logo
    if (logoIcon && logoIcon.style.display !== 'none') {
        logoIcon.style.display = 'none';
        logoImage.classList.remove('hidden');
        logoText.classList.add('hidden');
    } else if (logoImage) {
        logoIcon.style.display = 'block';
        logoImage.classList.add('hidden');
        logoText.classList.remove('hidden');
    }
}

// Función para subir logo personalizado
window.subirLogoPersonalizado = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const logoIcon = document.getElementById('appLogoIcon');
        const logoImage = document.getElementById('appLogoImage');

        // Ocultar icono y mostrar imagen
        if (logoIcon) logoIcon.style.display = 'none';
        logoImage.src = e.target.result;
        logoImage.classList.remove('hidden');
    }
    reader.readAsDataURL(file);
}

// Función para inicializar el tema guardado
window.inicializarTema = function () {
    const storedTheme = localStorage.getItem('taskly_theme');
    if (storedTheme) {
        // Eliminar todas las clases de tema
        document.documentElement.classList.remove('light-theme', 'theme-blue-pastel', 'theme-green-pastel');

        // Aplicar el tema guardado
        switch (storedTheme) {
            case 'light':
                document.documentElement.classList.add('light-theme');
                break;
            case 'blue-pastel':
                document.documentElement.classList.add('theme-blue-pastel');
                break;
            case 'green-pastel':
                document.documentElement.classList.add('theme-green-pastel');
                break;
        }

        // Actualizar icono del selector de tema
        const icon = document.getElementById('temaIcon');
        if (icon) {
            switch (storedTheme) {
                case 'light':
                    icon.textContent = 'dark_mode';
                    break;
                case 'blue-pastel':
                    icon.textContent = 'palette';
                    break;
                case 'green-pastel':
                    icon.textContent = 'forest';
                    break;
                default:
                    icon.textContent = 'light_mode';
            }
        }
    }
}

// Función para establecer un tema específico
window.setTheme = function (theme) {
    // Eliminar todas las clases de tema
    document.documentElement.classList.remove('light-theme', 'theme-blue-pastel', 'theme-green-pastel');

    let iconText = 'light_mode';

    switch (theme) {
        case 'light':
            document.documentElement.classList.add('light-theme');
            iconText = 'dark_mode';
            localStorage.setItem('taskly_theme', 'light');
            break;
        case 'theme-blue-pastel':
            document.documentElement.classList.add('theme-blue-pastel');
            iconText = 'palette';
            localStorage.setItem('taskly_theme', 'blue-pastel');
            break;
        case 'theme-green-pastel':
            document.documentElement.classList.add('theme-green-pastel');
            iconText = 'forest';
            localStorage.setItem('taskly_theme', 'green-pastel');
            break;
        default:
            localStorage.setItem('taskly_theme', 'dark');
            break;
    }

    const icon = document.getElementById('temaIcon');
    if (icon) icon.textContent = iconText;

    // Cerrar el menú de selección de tema
    document.getElementById('themeSelector').classList.add('hidden');
}

// Función para alternar el menú de selección de tema
window.toggleThemeMenu = function () {
    const selector = document.getElementById('themeSelector');
    selector.classList.toggle('hidden');
}

window.agregarTarea = async function () {
    try {
        const input = document.getElementById('nuevaTarea');
        const select = document.getElementById('prioridadTarea');
        const fechaInput = document.getElementById('fechaTarea');
        const horaInput = document.getElementById('horaTarea');

        const descripcion = input.value.trim();
        const prioridad = select.value;
        let fecha = fechaInput.value;
        let hora = horaInput.value;

        if (!fecha) {
            const hoy = new Date();
            fecha = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
        }
        if (!hora) hora = "00:00";

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
    const icon = document.getElementById('temaIcon');

    // Eliminar todas las clases de tema
    html.classList.remove('light-theme', 'theme-blue-pastel', 'theme-green-pastel');

    // Obtener el tema actual almacenado
    let currentTheme = localStorage.getItem('taskly_theme') || 'dark';

    // Definir el siguiente tema en el ciclo
    let nextThemes = {
        'dark': 'light',
        'light': 'blue-pastel',
        'blue-pastel': 'green-pastel',
        'green-pastel': 'dark'
    };

    let nextTheme = nextThemes[currentTheme];

    switch (nextTheme) {
        case 'light':
            html.classList.add('light-theme');
            if (icon) icon.textContent = 'dark_mode';
            localStorage.setItem('taskly_theme', 'light');
            break;
        case 'blue-pastel':
            html.classList.add('theme-blue-pastel');
            if (icon) icon.textContent = 'palette';
            localStorage.setItem('taskly_theme', 'blue-pastel');
            break;
        case 'green-pastel':
            html.classList.add('theme-green-pastel');
            if (icon) icon.textContent = 'forest';
            localStorage.setItem('taskly_theme', 'green-pastel');
            break;
        case 'dark':
        default:
            if (icon) icon.textContent = 'light_mode';
            localStorage.setItem('taskly_theme', 'dark');
            break;
    }
}

// Inicializar tema al cargar la página
window.addEventListener('DOMContentLoaded', function () {
    inicializarTema();
});

// Inicializar nombre de usuario en el header
window.addEventListener('DOMContentLoaded', function () {
    const userData = localStorage.getItem('taskly_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.email) {
                document.getElementById('userEmail').textContent = user.email;
                const initials = user.email.substring(0, 2).toUpperCase();
                document.getElementById('userInitials').textContent = initials;
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
});

window.vistaActualCalendario = 'mes';

window.cambiarVista = function (vista) {
    window.vistaActualCalendario = vista;
    document.querySelectorAll('.vista-btn').forEach(btn => {
        btn.classList.remove('bg-surface', 'text-gold', 'border', 'border-gold/20', 'shadow-lg', 'active-vista');
        btn.classList.add('text-slate-500');
    });

    // Actualizar la apariencia del botón activo
    const activeBtn = document.getElementById(`btn-vista-${vista}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-surface', 'text-gold', 'border', 'border-gold/20', 'shadow-lg', 'active-vista');
        activeBtn.classList.remove('text-slate-500');
    }

    // Generar calendario con la nueva vista
    if (window.gestorTareas) {
        generarCalendario(window.gestorTareas.tareas);
    }
}

// Funciones faltantes para la UI de index.html
window.cambiarMes = function (incremento) {
    if (window.fechaCalendario) {
        window.fechaCalendario.setMonth(window.fechaCalendario.getMonth() + incremento);
        if (window.gestorTareas) {
            generarCalendario(window.gestorTareas.tareas);
        }
    }
}

window.subirFotoPerfil = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const profileImg = document.getElementById('userProfileImg');
        const userInitials = document.getElementById('userInitials');

        if (profileImg) {
            profileImg.src = e.target.result;
            profileImg.classList.remove('hidden');
        }
        if (userInitials) {
            userInitials.classList.add('hidden');
        }
        localStorage.setItem('taskly_profile_img', e.target.result);
    }
    reader.readAsDataURL(file);
}

window.addEventListener('DOMContentLoaded', function () {
    const savedImg = localStorage.getItem('taskly_profile_img');
    if (savedImg) {
        const profileImg = document.getElementById('userProfileImg');
        const userInitials = document.getElementById('userInitials');
        if (profileImg && userInitials) {
            profileImg.src = savedImg;
            profileImg.classList.remove('hidden');
            userInitials.classList.add('hidden');
        }
    }
});

window.iniciarReconocimientoVoz = function () {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('El reconocimiento de voz no está soportado en este navegador.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    const btnVoz = document.getElementById('btnVoz');

    recognition.onstart = function () {
        if (btnVoz) btnVoz.classList.add('grabando', 'text-red-500');
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        const inputTarea = document.getElementById('nuevaTarea');
        if (inputTarea) {
            inputTarea.value = transcript.charAt(0).toUpperCase() + transcript.slice(1);
        }
    };

    recognition.onerror = function (event) {
        console.error('Error de reconocimiento de voz:', event.error);
        if (btnVoz) btnVoz.classList.remove('grabando', 'text-red-500');
    };

    recognition.onend = function () {
        if (btnVoz) btnVoz.classList.remove('grabando', 'text-red-500');
    };

    recognition.start();
}
