export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function estimateDeliveryTime(
  distanceKm: number,
  prepTimeMinutes: number
): number {
  const speedKmPerMin = 30 / 60; // 30 km/h average
  const travelMinutes = distanceKm / speedKmPerMin;
  return Math.ceil(prepTimeMinutes + travelMinutes + 5); // 5 min buffer
}
