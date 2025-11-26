import { ServicioNasa } from './nasa.service.js';
import { ServicioAlmacenamiento } from './storage.service.js';
import { Asteroide } from '../models/asteroide.model.js';

function cargarFavoritos() {
    const idsFavoritos = ServicioAlmacenamiento.obtenerFavoritos();
    const totalFavoritos = document.getElementById('totalFavoritos');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const tablaFavoritos = document.getElementById('tablaFavoritos');

    if (!totalFavoritos) {
        return;
    }
    
    totalFavoritos.textContent = idsFavoritos.length;
    
    if (idsFavoritos.length === 0) {
        mensajeCargando.style.display = 'none';
        mensajeVacio.style.display = 'block';
        tablaFavoritos.style.display = 'none';
        return;
    }
    
    let asteroidesCargados = 0;
    let peligrososCount = 0;
    const asteroidesFavoritos = [];
    
    function actualizarContadores() {
        document.getElementById('cargadosFavoritos').textContent = asteroidesCargados;
        document.getElementById('peligrososFavoritos').textContent = peligrososCount;
    }
    
    function procesarAsteroideCargado(asteroide) {
        asteroidesCargados++;
        if (asteroide.esPeligroso) {
            peligrososCount++;
        }
        asteroidesFavoritos.push(asteroide);
        actualizarContadores();
        
        if (asteroidesCargados === idsFavoritos.length) {
            mensajeCargando.style.display = 'none';
            renderizarTablaFavoritos(asteroidesFavoritos);
        }
    }
    
    function manejarErrorCarga(id, error) {
        console.error('Error cargando asteroide favorito:', id, error);
        asteroidesCargados++;
        actualizarContadores();
        
        if (asteroidesCargados === idsFavoritos.length) {
            mensajeCargando.style.display = 'none';
            if (asteroidesFavoritos.length > 0) {
                renderizarTablaFavoritos(asteroidesFavoritos);
            } else {
                mensajeVacio.style.display = 'block';
            }
        }
    }
    
    idsFavoritos.forEach(function(id) {
        $.ajax({
            url: ServicioNasa.urlNeo(id),
            method: 'GET',
            dataType: 'json',
            success: function(datos) {
                const asteroide = new Asteroide(datos);
                procesarAsteroideCargado(asteroide);
            },
            error: function(error) {
                manejarErrorCarga(id, error);
            }
        });
    });
}

function renderizarTablaFavoritos(asteroides) {
    const cuerpoTabla = document.getElementById('cuerpoTablaFavoritos');
    const tablaFavoritos = document.getElementById('tablaFavoritos');
    
    cuerpoTabla.innerHTML = '';
    
    if (asteroides.length === 0) {
        tablaFavoritos.style.display = 'none';
        return;
    }
    
    tablaFavoritos.style.display = 'table';
    
    asteroides.forEach(function(asteroide, indice) {
        const diametro = asteroide.obtenerDiametroMaxKm();
        const metricas = asteroide.obtenerMetricsAproximacion(0);
        const velocidad = metricas ? metricas.velocidad_km_h.toFixed(2) : '-';
        const distancia = metricas ? Number(metricas.distancia_km).toFixed(2) : '-';
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td><button class="boton-favorito favorito" data-id="${asteroide.id}">★</button></td>
            <td>${asteroide.nombre}</td>
            <td>${diametro ? diametro.toFixed(3) : '-'}</td>
            <td>${velocidad}</td>
            <td>${distancia}</td>
            <td>${asteroide.esPeligroso ? 'Sí' : 'No'}</td>
            <td><button class="boton-ver" data-id="${asteroide.id}">Ver</button></td>
        `;
        cuerpoTabla.appendChild(fila);
    });
    
    document.querySelectorAll('.boton-favorito').forEach(function(boton) {
        boton.onclick = function() {
            const id = boton.dataset.id;
            ServicioAlmacenamiento.toggleFavorito(id);
            cargarFavoritos(); // Recargar la página
        };
    });
    
    document.querySelectorAll('.boton-ver').forEach(function(boton) {
        boton.onclick = function() {
            const id = boton.dataset.id;
            window.location.href = `detalle.html?id=${encodeURIComponent(id)}`;
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarFavoritos();
});

export const ServicioFavoritos = {
    initFavoritos: function() {
        document.addEventListener('DOMContentLoaded', function() {
            cargarFavoritos();
        });
    }
};