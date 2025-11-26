import { ServicioIndex } from './services/index.service.js';
import { ServicioDetalles } from './services/detalles.service.js';
import { ServicioFavoritos } from './services/favoritos.service.js';

document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;
  if (path.endsWith('/index.html') || path.endsWith('/')) {
    ServicioIndex.initIndex();
  } else if (path.endsWith('/detalle.html') || path.endsWith('/html/detalle.html')) {
    ServicioDetalles.initDetalle();
  } else if (path.endsWith('/favoritos.html')) {
    ServicioFavoritos.initFavoritos();
  } else {
    if (document.getElementById('rankingBody')) {
      ServicioIndex.initIndex();
    }
    if (document.getElementById('neoChart')) {
      ServicioDetalles.initDetalle();
    }
    if (document.getElementById('tablaFavoritos')) {
      ServicioFavoritos.initFavoritos();
    }
  }
});


