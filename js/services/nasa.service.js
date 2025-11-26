const API_KEY = 'uucGSHYWdXpxzkGOW1Avj3LZIPvsedIjUuCChb28';
const BASE = 'https://api.nasa.gov/neo/rest/v1';

function urlFeed(startDate, endDate) {
  return `${BASE}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;
}

function urlNeo(id) {
  return `${BASE}/neo/${id}?api_key=${API_KEY}`;
}

function mapFeedToArray(data) {
  if (!data || !data.near_earth_objects) return [];
  return Object.values(data.near_earth_objects).flat();
}

export const ServicioNasa = {
  urlFeed,
  urlNeo,
  mapFeedToArray
};


