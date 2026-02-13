export function actualizarListaTareas(tareas) {
    const lista = document.getElementById('listaTareas');
    const sinTareas = document.getElementById('sinTareas');

    if (tareas.length === 0) {
        lista.style.display = 'none';
        sinTareas.style.display = 'flex';
        sinTareas.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✨</div>
                <p>Todo está al día. ¡Buen trabajo!</p>
                <small>Agrega una tarea para comenzar.</small>
            </div>
        `;
        return;
    }

    lista.style.display = 'flex';
    sinTareas.style.display = 'none';

    lista.innerHTML = tareas.map(tarea => {
        const fecha = tarea.fecha_programada ? new Date(tarea.fecha_programada) : null;
        const fechaFormateada = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
        const horaFormateada = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

        return `
            <div class="tarea-item ${tarea.completada ? 'tarea-completada' : ''} ${tarea.prioridad.toLowerCase()}">
                <input type="checkbox" 
                       class="tarea-checkbox" 
                       ${tarea.completada ? 'checked' : ''}
                       onchange="gestorTareas.completarTarea(${tarea.id})">
                
                <div class="tarea-content">
                    <span class="tarea-texto">${tarea.descripcion}</span>
                    <div class="tarea-meta">
                        ${fecha ? `<span class="tarea-fecha">📅 ${fechaFormateada} • 🕒 ${horaFormateada}</span>` : ''}
                        <span class="tarea-prioridad prioridad-${tarea.prioridad.toLowerCase()}">${tarea.prioridad}</span>
                    </div>
                </div>
                
                <button class="btn-eliminar" onclick="gestorTareas.eliminarTarea(${tarea.id})" title="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                </button>
            </div>
        `;
    }).join('');
}

export function actualizarEstadisticas(estadisticas, isMock = false) {
    const contador = document.getElementById('contadorTareas');
    const headerStats = document.getElementById('headerStats');

    const statsHTML = `
        ${isMock ? '<div class="stat-pill" style="background:#2e7d32; color:white; border:none;">🟢 Local</div>' : ''}
        <div class="stat-pill total">
            <span>${estadisticas.total}</span> Total
        </div>
        <div class="stat-pill pendientes">
            <span>${estadisticas.pendientes}</span> Pendientes
        </div>
    `;

    if (headerStats) headerStats.innerHTML = statsHTML;
    if (contador) contador.textContent = `Progreso: ${estadisticas.completadas}/${estadisticas.total} completadas`;
}

export function actualizarFiltros(filtroActual) {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toUpperCase() === filtroActual) {
            btn.classList.add('active');
        }
    });
}

export function actualizarFecha() {
    const fechaElement = document.getElementById('fechaActual');
    const ahora = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const hoyStr = ahora.toLocaleDateString('es-ES', opciones);
    fechaElement.textContent = hoyStr.charAt(0).toUpperCase() + hoyStr.slice(1);
}