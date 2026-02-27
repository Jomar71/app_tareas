export function actualizarListaTareas(tareas) {
    const lista = document.getElementById('listaTareas');
    const sinTareas = document.getElementById('sinTareas');

    if (!tareas || tareas.length === 0) {
        lista.style.display = 'none';
        sinTareas.classList.remove('hidden');
        sinTareas.classList.add('flex');
        return;
    }

    lista.style.display = 'block';
    sinTareas.classList.add('hidden');
    sinTareas.classList.remove('flex');

    lista.innerHTML = tareas.map(tarea => {
        const fecha = tarea.fecha_programada ? new Date(tarea.fecha_programada) : null;
        const fechaFormateada = fecha ? fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
        const horaFormateada = fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

        // Priority Styles
        let priorityColor = 'border-slate-500/20 bg-slate-500/5';
        let accentLine = 'bg-slate-500';
        let priorityTextColor = 'text-slate-400';
        let priorityIcon = 'info';

        if (tarea.prioridad === 'ALTA') {
            priorityColor = 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10';
            accentLine = 'bg-red-500';
            priorityTextColor = 'text-red-400';
            priorityIcon = 'emergency';
        } else if (tarea.prioridad === 'MEDIA') {
            priorityColor = 'border-gold/20 bg-gold/5 hover:bg-gold/10';
            accentLine = 'bg-gold';
            priorityTextColor = 'text-gold';
            priorityIcon = 'event';
        } else if (tarea.prioridad === 'BAJA') {
            priorityColor = 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10';
            accentLine = 'bg-accent';
            priorityTextColor = 'text-accent';
            priorityIcon = 'slight_smile';
        }

        return `
            <div class="group flex items-center gap-4 p-5 rounded-lg border ${priorityColor} transition-all relative overflow-hidden mb-4 ${tarea.completada ? 'opacity-60 grayscale' : ''}">
                <div class="absolute left-0 top-0 bottom-0 w-1 ${accentLine}"></div>
                
                <button onclick="gestorTareas.completarTarea(${tarea.id})" class="h-6 w-6 rounded-full border-2 ${tarea.completada ? 'border-gold bg-gold text-bg-dark' : 'border-indigo-900/50 hover:border-gold'} flex items-center justify-center shrink-0 transition-all">
                    ${tarea.completada ? '<span class="material-symbols-outlined text-xs font-bold">check</span>' : ''}
                </button>
                
                <div class="flex-1 min-w-0" onclick="gestorTareas.completarTarea(${tarea.id})" class="cursor-pointer">
                    <p class="font-bold text-white text-base leading-tight ${tarea.completada ? 'line-through text-slate-500' : ''}">
                        ${tarea.descripcion}
                    </p>
                    <div class="flex items-center gap-3 mt-2">
                        ${fecha ? `
                            <span class="text-[11px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm">alarm</span> ${fechaFormateada} • ${horaFormateada}
                            </span>
                        ` : ''}
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 ${priorityTextColor} border border-white/5">${tarea.prioridad}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="text-slate-500 hover:text-red-400 transition-colors p-1" onclick="gestorTareas.eliminarTarea(${tarea.id})" title="Eliminar">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
                
                <span class="material-symbols-outlined ${priorityTextColor} opacity-20 absolute -right-2 -bottom-2 text-4xl">${priorityIcon}</span>
            </div>
        `;
    }).join('');
}

export function actualizarEstadisticas(estadisticas, isMock = false) {
    const contador = document.getElementById('contadorTareas');
    const headerStats = document.getElementById('headerStats');
    const porcentajeText = document.getElementById('porcentajeCompletado');
    const barraProgreso = document.getElementById('barraProgreso');

    const total = estadisticas.total || 0;
    const completadas = estadisticas.completadas || 0;
    const pendientes = estadisticas.pendientes || 0;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    if (headerStats) headerStats.innerHTML = `${pendientes} activos`;
    if (contador) contador.textContent = `Progreso: ${completadas}/${total} completadas`;
    if (porcentajeText) porcentajeText.textContent = `${porcentaje}%`;
    if (barraProgreso) barraProgreso.style.width = `${porcentaje}%`;

    // Actualizar frase motivacional basándose en progreso
    const frase = document.getElementById('fraseMotivacional');
    if (frase) {
        if (porcentaje === 100) frase.textContent = '"¡Excelente trabajo! Has conquistado todos tus objetivos hoy."';
        else if (porcentaje > 70) frase.textContent = '"Estás muy cerca. Solo unos hitos más para terminar el ciclo."';
        else if (porcentaje > 30) frase.textContent = '"Mantén el ritmo. Tu eficiencia es superior al promedio."';
        else if (total > 0) frase.textContent = '"Cada gran logro comienza con una pequeña tarea."';
    }

    // Actualizar Notificaciones
    const tareasData = window.gestorTareas ? window.gestorTareas.tareas : [];
    const altas = tareasData.filter(t => !t.completada && t.prioridad === 'ALTA').length;
    const medias = tareasData.filter(t => !t.completada && t.prioridad === 'MEDIA').length;

    const badge = document.getElementById('notifBadge');
    const textNotif = document.getElementById('notifText');
    if (badge && textNotif) {
        if (altas > 0) {
            badge.textContent = altas;
            badge.classList.remove('hidden');
            textNotif.textContent = `${altas} tarea(s) de alta prioridad requieren tu atención inmediata.`;
            textNotif.classList.add('text-red-400');
        } else if (medias > 0) {
            badge.textContent = medias;
            badge.classList.remove('hidden');
            textNotif.textContent = `Tienes ${medias} tarea(s) de prioridad media en curso.`;
            textNotif.classList.remove('text-red-400');
        } else {
            badge.classList.add('hidden');
            textNotif.textContent = "No tienes prioridades pendientes urgentes. ¡Buen trabajo!";
            textNotif.classList.remove('text-red-400');
        }
    }
}

export function actualizarFiltros(filtroActual) {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('border-gold', 'text-gold');
        btn.classList.add('border-transparent', 'text-slate-500');

        const text = btn.textContent.toUpperCase();
        if (text === filtroActual || (filtroActual === 'TODAS' && text === 'TODAS') || (filtroActual === 'PENDIENTES' && text === 'PENDIENTES') || (filtroActual === 'COMPLETADAS' && text === 'COMPLETADAS')) {
            btn.classList.add('border-gold', 'text-gold');
            btn.classList.remove('border-transparent', 'text-slate-500');
        }
    });
}

export function actualizarFecha() {
    const fechaElement = document.getElementById('fechaActual');
    if (!fechaElement) return;
    const ahora = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const hoyStr = ahora.toLocaleDateString('es-ES', opciones);
    fechaElement.textContent = hoyStr.charAt(0).toUpperCase() + hoyStr.slice(1);
}

export let fechaCalendario = new Date();
window.fechaCalendario = fechaCalendario;

export function generarCalendario(tareas = []) {
    const grid = document.getElementById('calendarGrid');
    const mesElement = document.getElementById('mesActual');
    if (!grid || !mesElement) return;

    const hoy = new Date();
    const año = fechaCalendario.getFullYear();
    const mes = fechaCalendario.getMonth();

    const vista = window.vistaActualCalendario || 'mes';

    let tituloStr = '';
    if (vista === 'dia') {
        tituloStr = fechaCalendario.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (vista === 'semana') {
        const d = new Date(año, mes, fechaCalendario.getDate());
        const primerDiaSemana = new Date(d);
        primerDiaSemana.setDate(d.getDate() - d.getDay() + 1);
        const ultimoDiaSemana = new Date(d);
        ultimoDiaSemana.setDate(d.getDate() - d.getDay() + 7);
        tituloStr = `Semana del ${primerDiaSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${ultimoDiaSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
    } else {
        tituloStr = new Date(año, mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    mesElement.textContent = tituloStr.charAt(0).toUpperCase() + tituloStr.slice(1);

    grid.innerHTML = '';

    const headerGrid = document.getElementById('calendarHeaderDays');

    const tareasPorFecha = {};
    tareas.forEach(t => {
        if (t.fecha_programada && !t.completada) {
            const datePart = t.fecha_programada.split(' ')[0]; // format: YYYY-MM-DD
            if (!tareasPorFecha[datePart]) tareasPorFecha[datePart] = [];
            tareasPorFecha[datePart].push(t.prioridad);
        }
    });

    if (vista === 'dia') {
        if (headerGrid) headerGrid.style.display = 'none';
        grid.style.gridTemplateColumns = '1fr';

        const monthPad = (mes + 1).toString().padStart(2, '0');
        const dayPad = fechaCalendario.getDate().toString().padStart(2, '0');
        const tempKey = `${año}-${monthPad}-${dayPad}`;

        let tareasDia = tareas.filter(t => !t.completada && t.fecha_programada && t.fecha_programada.startsWith(tempKey));

        grid.innerHTML = `
            <div class="p-8 flex flex-col items-center justify-center min-h-[250px]">
                <h3 class="text-6xl font-extrabold text-gold mb-2">${fechaCalendario.getDate()}</h3>
                <h4 class="text-sm text-slate-400 mb-6 font-bold uppercase tracking-widest">${tareasDia.length} tareas programadas para este día</h4>
                <div class="w-full max-w-md">
                    ${tareasDia.map(t => {
            const priBorder = t.prioridad === 'ALTA' ? 'border-red-500 bg-red-500/10 text-red-500' : (t.prioridad === 'MEDIA' ? 'border-gold bg-gold/10 text-gold' : 'border-accent bg-indigo-500/10 text-accent');
            return `<div class="p-4 border-l-4 ${priBorder} mb-3 rounded shadow text-sm font-semibold">${t.descripcion}</div>`;
        }).join('')}
                    ${tareasDia.length === 0 ? '<p class="text-center text-slate-500 border border-indigo-900/40 p-4 rounded bg-slate-900/20">Día libre de tareas.</p>' : ''}
                </div>
            </div>
        `;
        return;
    }

    if (headerGrid) headerGrid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';

    if (vista === 'semana') {
        const d = new Date(año, mes, fechaCalendario.getDate());
        const primerDiaSemana = new Date(d);
        primerDiaSemana.setDate(d.getDate() - d.getDay() + 1);

        for (let i = 0; i < 7; i++) {
            const currentD = new Date(primerDiaSemana);
            currentD.setDate(primerDiaSemana.getDate() + i);

            const curAño = currentD.getFullYear();
            const curMes = currentD.getMonth();
            const curDia = currentD.getDate();

            const isToday = curAño === hoy.getFullYear() && curMes === hoy.getMonth() && curDia === hoy.getDate();
            const monthPad = (curMes + 1).toString().padStart(2, '0');
            const dayPad = curDia.toString().padStart(2, '0');
            const tempKey = `${curAño}-${monthPad}-${dayPad}`;

            let dotsHtml = '';
            if (tareasPorFecha[tempKey]) {
                const hasAlta = tareasPorFecha[tempKey].includes('ALTA');
                const hasMedia = tareasPorFecha[tempKey].includes('MEDIA');
                const hasBaja = tareasPorFecha[tempKey].includes('BAJA');
                dotsHtml = `<div class="absolute bottom-4 flex gap-2">`;
                if (hasAlta) dotsHtml += `<div class="w-2 h-2 rounded-full bg-red-500 shadow"></div>`;
                if (hasMedia) dotsHtml += `<div class="w-2 h-2 rounded-full bg-gold shadow"></div>`;
                if (hasBaja) dotsHtml += `<div class="w-2 h-2 rounded-full bg-accent shadow"></div>`;
                dotsHtml += `</div>`;
            }

            const isSelected = isToday ? 'border-2 border-gold text-gold bg-gold/5 font-extrabold' : 'border border-indigo-900/30 text-slate-300 font-semibold hover:bg-slate-900/40';

            grid.innerHTML += `
                <div class="h-48 flex flex-col items-center justify-center text-3xl cursor-pointer relative group transition-all bg-slate-900/20 ${isSelected}">
                    ${curDia}
                    ${dotsHtml}
                </div>
            `;
        }
        return;
    }

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasMes = ultimoDia.getDate();

    let diaSemanaInicio = primerDia.getDay() - 1;
    if (diaSemanaInicio === -1) diaSemanaInicio = 6;

    const esMesActual = hoy.getMonth() === mes && hoy.getFullYear() === año;
    const diaActual = hoy.getDate();

    const diasMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        grid.innerHTML += `<div class="aspect-square flex items-center justify-center text-slate-700 text-sm font-light bg-slate-900/20">${diasMesAnterior - i}</div>`;
    }

    for (let i = 1; i <= diasMes; i++) {
        const isToday = esMesActual && diaActual === i;
        const monthPad = (mes + 1).toString().padStart(2, '0');
        const dayPad = i.toString().padStart(2, '0');
        const tempKey = `${año}-${monthPad}-${dayPad}`;

        let dotsHtml = '';
        if (tareasPorFecha[tempKey]) {
            const hasAlta = tareasPorFecha[tempKey].includes('ALTA');
            const hasMedia = tareasPorFecha[tempKey].includes('MEDIA');
            const hasBaja = tareasPorFecha[tempKey].includes('BAJA');
            dotsHtml = `<div class="absolute bottom-1 md:bottom-2 flex gap-1">`;
            if (hasAlta) dotsHtml += `<div class="w-1 h-1 rounded-full bg-red-500"></div>`;
            if (hasMedia) dotsHtml += `<div class="w-1 h-1 rounded-full bg-gold"></div>`;
            if (hasBaja) dotsHtml += `<div class="w-1 h-1 rounded-full bg-accent"></div>`;
            dotsHtml += `</div>`;
        }

        const addedClasses = isToday ? 'border border-gold text-gold bg-gold/5 font-extrabold' : 'text-slate-300 font-semibold hover:bg-indigo-900/30';

        grid.innerHTML += `
            <div class="aspect-square flex flex-col items-center justify-center text-sm cursor-pointer relative group transition-all ${addedClasses}" onclick="window.fechaCalendario.setDate(${i}); window.cambiarVista('dia')">
                ${i}
                ${dotsHtml}
            </div>
        `;
    }
}