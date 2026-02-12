import { api } from './api.js';
import { actualizarListaTareas, actualizarEstadisticas, actualizarFiltros } from './ui.js';

export class GestorTareas {
    constructor() {
        this.tareas = [];
        this.filtroActual = 'TODAS';
    }

    async cargarTareas() {
        this.tareas = await api.getTareas();
        this.actualizarUI();
    }

    async agregarTarea(descripcion, prioridad, fechaHora) {
        const nuevaTarea = await api.addTarea(descripcion, prioridad, fechaHora);
        this.tareas.push(nuevaTarea);
        this.actualizarUI();
        return nuevaTarea;
    }

    async completarTarea(id) {
        await api.completeTarea(id);
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = true;
        }
        this.actualizarUI();
    }

    async eliminarTarea(id) {
        await api.deleteTarea(id);
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.actualizarUI();
    }

    filtrarTareas(filtro) {
        this.filtroActual = filtro;
        this.actualizarUI();
    }

    obtenerTareasFiltradas() {
        switch (this.filtroActual) {
            case 'PENDIENTES':
                return this.tareas.filter(t => !t.completada);
            case 'COMPLETADAS':
                return this.tareas.filter(t => t.completada);
            default:
                return this.tareas;
        }
    }

    obtenerEstadisticas() {
        const total = this.tareas.length;
        const completadas = this.tareas.filter(t => t.completada).length;
        const pendientes = total - completadas;
        
        return { total, completadas, pendientes };
    }

    actualizarUI() {
        // Esta función se implementa en ui.js
        actualizarListaTareas(this.obtenerTareasFiltradas());
        actualizarEstadisticas(this.obtenerEstadisticas());
        actualizarFiltros(this.filtroActual);
    }
}