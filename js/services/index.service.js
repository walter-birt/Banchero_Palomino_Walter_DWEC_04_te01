import { ServicioNasa } from './nasa.service.js';
import { ServicioAlmacenamiento } from './storage.service.js';
import { Asteroide } from '../models/asteroide.model.js';

let asteroides = []; // lista base (instancias Asteroide)
let periodoActual = 'hoy';

function renderizarKPIs(lista) {
  const elemento = document.getElementById('resumenKPI');
  elemento.innerHTML = '';
  const total = lista.length;
  const peligrosos = lista.filter(function(a) { return a.esPeligroso; }).length;
  const favoritos = lista.filter(function(a) { return ServicioAlmacenamiento.esFavorito(a.id); }).length;
  elemento.innerHTML = `
    <div class="card">Total: <strong>${total}</strong></div>
    <div class="card">Peligrosos: <strong>${peligrosos}</strong></div>
    <div class="card">Favoritos: <strong>${favoritos}</strong></div>
  `;
}

function renderizarTabla(lista) {
  const cuerpoTabla = document.getElementById('rankingBody');
  cuerpoTabla.innerHTML = '';
  if (!lista.length) {
    cuerpoTabla.innerHTML = `<tr><td colspan="8">No hay asteroides para mostrar</td></tr>`;
    return;
  }

  lista.forEach(function(asteroide, indice) {
    const diametro = asteroide.obtenerDiametroMaxKm();
    const metricas = asteroide.obtenerMetricsAproximacion(0);
    const velocidad = metricas ? metricas.velocidad_km_h.toFixed(2) : '-';
    const distancia = metricas ? Number(metricas.distancia_km).toFixed(2) : '-';
    const esFavorito = ServicioAlmacenamiento.esFavorito(asteroide.id);
    const claseFavorito = esFavorito ? 'favorito' : '';
    const simboloFavorito = esFavorito ? '★' : '☆';
    
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${indice + 1}</td>
      <td><button class="boton-favorito ${claseFavorito}" data-id="${asteroide.id}">${simboloFavorito}</button></td>
      <td>${asteroide.nombre}</td>
      <td>${diametro ? diametro.toFixed(3) : '-'}</td>
      <td>${velocidad}</td>
      <td>${distancia}</td>
      <td>${asteroide.esPeligroso ? 'Sí' : 'No'}</td>
      <td><button class="boton-ver" data-id="${asteroide.id}">Ver</button></td>
    `;
    cuerpoTabla.appendChild(fila);
  });

  // eventos: favoritos 
  document.querySelectorAll('.boton-favorito').forEach(function(boton) {
    boton.onclick = function() {
      const id = boton.dataset.id;
      ServicioAlmacenamiento.toggleFavorito(id);
      // Refrescar solo los favoritos sin recargar datos de la API
      aplicarFiltrosYRenderizar();
    };
  });

  // eventos: ver detalle
  document.querySelectorAll('.boton-ver').forEach(function(boton) {
    boton.onclick = function() {
      const id = boton.dataset.id;
      window.location.href = `html/detalle.html?id=${encodeURIComponent(id)}`;
    };
  });
}

function aplicarFiltrosYRenderizar() {
  let filtrados = [...asteroides];
  const peligro = document.getElementById('filtroPeligro').value;

  if (peligro === 'true') {
    filtrados = filtrados.filter(function (a) {
      return a.esPeligroso;
    });
  }

  if (peligro === 'false') {
    filtrados = filtrados.filter(function (a) {
      return !a.esPeligroso;
    });
  }

  const favoritos = document.getElementById('filtroFavoritos').value;
  if (favoritos === 'only') {
    filtrados = filtrados.filter(function (a) {
      return ServicioAlmacenamiento.esFavorito(a.id);
    });
  }

  const ordenarPor = document.getElementById('ordenarPor').value;
  if (ordenarPor === 'size') {
    filtrados.sort(function(x,y) { 
      return (y.obtenerDiametroMaxKm() || 0) - (x.obtenerDiametroMaxKm() || 0); 
    });
  } else if (ordenarPor === 'distance') {
    filtrados.sort(function(x,y) {
      const distanciaX = x.obtenerMetricsAproximacion(0)?.distancia_km || 0;
      const distanciaY = y.obtenerMetricsAproximacion(0)?.distancia_km || 0;
      return distanciaX - distanciaY;
    });
  } else if (ordenarPor === 'velocity') {
    filtrados.sort(function(x,y) {
      const velocidadX = x.obtenerMetricsAproximacion(0)?.velocidad_km_h || 0;
      const velocidadY = y.obtenerMetricsAproximacion(0)?.velocidad_km_h || 0;
      return velocidadY - velocidadX;
    });
  }

  renderizarKPIs(filtrados);
  renderizarTabla(filtrados);
}

function obtenerFechaFormateada(fecha) {
  return fecha.toISOString().slice(0,10);
}

function cargarAsteroides(inicio, fin) {
  $.ajax({
    url: ServicioNasa.urlFeed(inicio, fin),
    method: 'GET',
    dataType: 'json',
    success: function(datos) {
      const datosCrudos = ServicioNasa.mapFeedToArray(datos);
      asteroides = datosCrudos.map(function(d) { 
        return new Asteroide(d); 
      });
      
      aplicarFiltrosYRenderizar();
    },
    error: function(error) {
      console.error('Error cargar asteroides:', error);
      document.getElementById('rankingBody').innerHTML = `<tr><td colspan="8">Error al cargar datos</td></tr>`;
    }
  });
}

function cargarHoy() {
  const hoy = new Date();
  const fecha = obtenerFechaFormateada(hoy);
  cargarAsteroides(fecha, fecha);
}

function cargarManana() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const fecha = obtenerFechaFormateada(manana);
  cargarAsteroides(fecha, fecha);
}

function cargarProximaSemana() {
  const hoy = new Date();
  const inicio = obtenerFechaFormateada(hoy);
  const fin = new Date(hoy.getTime() + 6 * 24 * 3600 * 1000);
  const fechaFin = obtenerFechaFormateada(fin);
  cargarAsteroides(inicio, fechaFin);
}

function actualizarBotonesPeriodo() {
  // Remover clase active de todos los botones
  document.querySelectorAll('.period-buttons button').forEach(function(boton) {
    boton.classList.remove('active');
  });
  
  // Agregar active al botón correspondiente
  let botonActivo;
  switch(periodoActual) {
    case 'hoy':
      botonActivo = document.getElementById('btnHoy');
      break;
    case 'manana':
      botonActivo = document.getElementById('btnManana');
      break;
    case 'proximaSemana':
      botonActivo = document.getElementById('btnProximaSemana');
      break;
  }
  
  if (botonActivo) {
    botonActivo.classList.add('active');
  }
}

function inicializarIndex() {
  // carga inicial: hoy
  periodoActual = 'hoy';
  cargarHoy();
  actualizarBotonesPeriodo();

  // eventos UI - periodos
  document.getElementById('btnHoy').addEventListener('click', function() {
    periodoActual = 'hoy';
    cargarHoy();
    actualizarBotonesPeriodo();
  });

  document.getElementById('btnManana').addEventListener('click', function() {
    periodoActual = 'manana';
    cargarManana();
    actualizarBotonesPeriodo();
  });

  document.getElementById('btnProximaSemana').addEventListener('click', function() {
    periodoActual = 'proximaSemana';
    cargarProximaSemana();
    actualizarBotonesPeriodo();
  });

  // eventos UI - filtros
  document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltrosYRenderizar);
}

export const ServicioIndex = {
  initIndex: inicializarIndex
};