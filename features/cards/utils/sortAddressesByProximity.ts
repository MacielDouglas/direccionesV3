type AddressWithCoords = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  [key: string]: unknown;
};

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Ordena addresses por proximidade encadeada (Nearest Neighbor).
 * Addresses sem coordenadas vão para o final, mantendo ordem original.
 *
 * Começa pelo centroide do grupo para o ponto inicial ser neutro.
 */
export function sortAddressesByProximity<T extends AddressWithCoords>(
  addresses: T[],
): T[] {
  const withCoords = addresses.filter(
    (a) => a.latitude != null && a.longitude != null,
  );
  const withoutCoords = addresses.filter(
    (a) => a.latitude == null || a.longitude == null,
  );

  if (withCoords.length === 0) return addresses;
  if (withCoords.length === 1) return [...withCoords, ...withoutCoords];

  // Calcula centroide do grupo como ponto de partida neutro
  const centroidLat =
    withCoords.reduce((sum, a) => sum + a.latitude!, 0) / withCoords.length;
  const centroidLon =
    withCoords.reduce((sum, a) => sum + a.longitude!, 0) / withCoords.length;

  const remaining = [...withCoords];
  const sorted: T[] = [];

  // Ponto atual começa no centroide
  let currentLat = centroidLat;
  let currentLon = centroidLon;

  while (remaining.length > 0) {
    // Encontra o address mais próximo do ponto atual
    let nearestIndex = 0;
    let nearestDist = Infinity;

    remaining.forEach((addr, i) => {
      const dist = haversineDistance(
        currentLat,
        currentLon,
        addr.latitude!,
        addr.longitude!,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });

    const nearest = remaining[nearestIndex];
    sorted.push(nearest);
    currentLat = nearest.latitude!;
    currentLon = nearest.longitude!;
    remaining.splice(nearestIndex, 1);
  }

  return [...sorted, ...withoutCoords];
}
