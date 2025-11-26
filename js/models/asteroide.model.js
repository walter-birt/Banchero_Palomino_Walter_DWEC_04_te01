// js/models/asteroide.model.js
export class Asteroide {
  constructor(datosRaw) {
    this.id = datosRaw.id || datosRaw.neo_reference_id || '';
    this.nombre = datosRaw.name || 'Sin nombre';
    this.magnitudAbsoluta = datosRaw.absolute_magnitude_h;
    this.diametroEstimado = datosRaw.estimated_diameter || {};
    this.esPeligroso = !!datosRaw.is_potentially_hazardous_asteroid;
    this.aproximaciones = datosRaw.close_approach_data || [];
    this.orbita = datosRaw.orbital_data || {};
  }

  obtenerDiametroMaxKm() {
    const k = this.diametroEstimado.kilometers;
    if (!k) return null;
    return Number(k.estimated_diameter_max);
  }

  obtenerDiametroMinKm() {
    const k = this.diametroEstimado.kilometers;
    if (!k) return null;
    return Number(k.estimated_diameter_min);
  }

  // Devuelve métricas (velocidad km/h, distancia km, fecha) de la aproximación por índice (por defecto la primera)
  obtenerMetricsAproximacion(ind = 0) {
    if (!this.aproximaciones || !this.aproximaciones.length) return null;
    const a = this.aproximaciones[ind];
    return {
      fecha: a.close_approach_date,
      velocidad_km_h: parseFloat(a.relative_velocity.kilometers_per_hour),
      distancia_km: parseFloat(a.miss_distance.kilometers)
    };
  }

  // Devuelve array de objetos simplificados para el gráfico: {fecha, velocidad, distancia}
  obtenerSeriesAproximaciones() {
    return this.aproximaciones.map(function(a) {
      return {
        fecha: a.close_approach_date,
        velocidad_km_h: parseFloat(a.relative_velocity.kilometers_per_hour),
        distancia_km: parseFloat(a.miss_distance.kilometers)
      };
    });
  }
}

