import type { DottedMapGeoCluster, DottedMapMarker } from './types'

/**
 * Phase 1 of clustering: group markers into lat/lng grid cells.
 *
 * Ported verbatim from `@wescld/dotted-map` (MIT) so that a marker lands in the
 * same cell at the same zoom as the upstream React implementation.
 */
export function clusterByGeo(
  markers: DottedMapMarker[],
  cellDeg: number,
  activeIds: Set<string>,
): DottedMapGeoCluster[] {
  const grid = new Map<string, DottedMapGeoCluster>()

  for (const m of markers) {
    const col = Math.floor(m.longitude / cellDeg)
    const row = Math.floor(m.latitude / cellDeg)
    const key = `${col},${row}`

    let cell = grid.get(key)
    if (!cell) {
      cell = {
        avgLng: 0,
        avgLat: 0,
        count: 0,
        markers: [],
        hasActive: false,
        activeCount: 0,
      }
      grid.set(key, cell)
    }
    cell.avgLng += m.longitude
    cell.avgLat += m.latitude
    cell.count++
    cell.markers.push(m)
    if (activeIds.has(m.id)) {
      cell.hasActive = true
      cell.activeCount++
    }
  }

  const results: DottedMapGeoCluster[] = []
  for (const cell of grid.values()) {
    cell.avgLng /= cell.count
    cell.avgLat /= cell.count
    results.push(cell)
  }

  return results
}
