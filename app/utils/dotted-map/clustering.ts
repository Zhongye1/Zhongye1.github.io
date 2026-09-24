import type { DottedMapGeoCluster, DottedMapMarker } from './types'

/**
 * 取一个 marker 的权重，缺失或非法一律按 1 算。
 *
 * 挡住的不只是 `undefined`：`Infinity` 也能通过 `> 0` 这种朴素判断，
 * 一旦混进来，整个网格的 weight 会被污染成 `Infinity`／`NaN`，
 * 气泡上的数字和尺寸跟着一起坏，而且很难反推出是哪条数据引起的。
 */
function markerWeight(marker: DottedMapMarker): number {
  const weight = marker.weight
  return typeof weight === 'number' && Number.isFinite(weight) && weight > 0 ? weight : 1
}

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
        weight: 0,
        markers: [],
        hasActive: false,
        activeCount: 0,
      }
      grid.set(key, cell)
    }
    cell.avgLng += m.longitude
    cell.avgLat += m.latitude
    // count 是 marker 个数，只服务于下面的平均坐标；weight 才是气泡要显示的量。
    // 两者必须分开：访客地图里一个城市只有一个 marker，却带 54 的 weight，
    // 合并成一个字段会让 `avgLng /= count` 除错数，点直接跑到别处去。
    cell.count++
    cell.weight += markerWeight(m)
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
