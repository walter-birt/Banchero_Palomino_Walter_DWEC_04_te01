const KEY_FAVORITOS = 'neo_favoritos';

function obtenerFavoritos() {
  const s = localStorage.getItem(KEY_FAVORITOS);
  return s ? JSON.parse(s) : [];
}

function guardarFavoritos(arr) {
  localStorage.setItem(KEY_FAVORITOS, JSON.stringify(arr));
}

function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

function toggleFavorito(id) {
  const fav = obtenerFavoritos();
  const idx = fav.indexOf(id);
  if (idx >= 0) {
    fav.splice(idx, 1);
  } else {
    fav.push(id);
  }
  guardarFavoritos(fav);
}

export const ServicioAlmacenamiento = {
  obtenerFavoritos,
  guardarFavoritos,
  esFavorito,
  toggleFavorito
};

