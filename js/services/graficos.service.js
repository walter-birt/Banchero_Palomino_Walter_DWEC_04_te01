function crearGrafico(idCanvas, series, tipo, opciones) {
  const canvas = document.getElementById(idCanvas);
  if (!canvas) {
    return null;
  }
  const ctx = canvas.getContext('2d');

  const etiquetas = series.map(function (s) { 
    return s.fecha; 
  });
  const valoresDatos = series.map(function (s) {
    return tipo === 'velocity' ? s.velocidad_km_h : s.distancia_km;
  });

  // destruir si existe instancia válida
  if (window.neoChart instanceof Chart) {
    window.neoChart.destroy();
  }

  window.neoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [{
        label: tipo === 'velocity' ? 'Velocidad (km/h)' : 'Distancia (km)',
        data: valoresDatos,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.08)',
        tension: 0.25,
        pointRadius: 3,
        borderWidth: 2 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      onClick: function (evt, elements) {
        if (!elements.length) {
          return;
        }
        const indice = elements[0].index;
        if (opciones.onPointClick) {
          opciones.onPointClick(indice, series[indice]);
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha',
            color: '#e0e0e0'
          },
          ticks: {
            color: '#c8d9e6'
          },
          grid: {
            color: '#222'
          }
        },
        y: {
          title: {
            display: true,
            text: tipo === 'velocity' ? 'km/h' : 'km',
            color: '#e0e0e0'
          },
          ticks: {
            color: '#c8d9e6'
          },
          grid: {
            color: '#222'
          }
        }
      },
      plugins: {
        legend: { 
          labels: { 
            color: '#c8d9e6' 
          } }
      }
    }
  });

  return window.neoChart;
}

export const ServicioGraficos = {
  crearGrafico: crearGrafico
};

