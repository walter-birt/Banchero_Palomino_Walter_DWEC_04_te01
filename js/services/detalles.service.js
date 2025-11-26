import { ServicioNasa } from './nasa.service.js';
import { ServicioAlmacenamiento } from './storage.service.js';
import { Asteroide } from '../models/asteroide.model.js';
import { ServicioGraficos } from './graficos.service.js';

let asteroideActual = null;

function renderizarDetalle(asteroide) {
  const contenedor = document.getElementById('neoInfo');
  const diamMin = asteroide.obtenerDiametroMinKm();
  const diamMax = asteroide.obtenerDiametroMaxKm();

  contenedor.innerHTML = `
    <div class="card"><strong>Nombre:</strong><div>${asteroide.nombre}</div></div>
    <div class="card"><strong>Tamaño (km):</strong><div>${diamMin ? diamMin.toFixed(3) : '-'} - ${diamMax ? diamMax.toFixed(3) : '-'}</div></div>
    <div class="card"><strong>Magnitud:</strong><div>${asteroide.magnitudAbsoluta}</div></div>
    <div class="card"><strong>Peligroso:</strong><div>${asteroide.esPeligroso ? 'Sí' : 'No'}</div></div>
    <div class="card"><strong>Aproximaciones:</strong><div>${asteroide.aproximaciones.length}</div></div>
    <div class="card"><strong>Órbita:</strong><div>${asteroide.orbita.orbit_class?.orbit_class_description || '-'}</div></div>
    <div class="card"><strong>Período (d):</strong><div>${asteroide.orbita.orbital_period || '-'}</div></div>
    <div class="card"><strong>Inclinación (°):</strong><div>${asteroide.orbita.inclination || '-'}</div></div>
  `;
}

function inicializarControlesGrafico(asteroide) {
  const botonDistancia = document.getElementById('btnDistancia');
  const botonVelocidad = document.getElementById('btnVelocidad');
  const botonesPeriodo = document.querySelectorAll('.period-buttons button');

  let tipo = 'distance';
  let periodo = 'all';

  function actualizarGrafico() {
    let series = asteroide.obtenerSeriesAproximaciones();
    if (periodo !== 'all') {
      const numero = parseInt(periodo,10);
      series = series.slice(-numero);
    }
    ServicioGraficos.crearGrafico('neoChart', series, tipo, {
      onPointClick: function(indice, item) {
        console.log('click punto', indice, item);
      }
    });
  }

  botonDistancia.onclick = function() { 
    tipo='distance'; 
    botonDistancia.classList.add('active'); 
    botonVelocidad.classList.remove('active'); 
    actualizarGrafico(); 
  };
  
  botonVelocidad.onclick = function() { 
    tipo='velocity'; 
    botonVelocidad.classList.add('active'); 
    botonDistancia.classList.remove('active'); 
    actualizarGrafico(); 
  };

  botonesPeriodo.forEach(function(boton) {
    boton.onclick = function() {
      botonesPeriodo.forEach(function(x) { x.classList.remove('active'); });
      boton.classList.add('active');
      periodo = boton.dataset.period;
      actualizarGrafico();
    };
  });

  // inicial
  actualizarGrafico();
}

function inicializarDetalle() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get('id');
  if (!id) {
    document.getElementById('neoTitle').textContent = 'NEO no especificado';
    return;
  }

  $.ajax({
    url: ServicioNasa.urlNeo(id),
    method: 'GET',
    dataType: 'json',
    success: function(datos) {
      asteroideActual = new Asteroide(datos);
      document.getElementById('neoTitle').textContent = asteroideActual.nombre;
      renderizarDetalle(asteroideActual);
      inicializarControlesGrafico(asteroideActual);
    },
    error: function(error) {
      console.error('Error detalle NEO:', error);
      document.getElementById('neoInfo').innerHTML = '<div>Error al cargar detalle</div>';
    }
  });
}

export const ServicioDetalles = {
  initDetalle: inicializarDetalle
};
