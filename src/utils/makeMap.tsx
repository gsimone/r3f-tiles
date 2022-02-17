import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { makePlane } from "./makePlane";
import { BufferGeometry, Quaternion } from "three";

export function getIndexFrom2D(coords: number[], size: number[]) {
  return coords[0] + size[0] * coords[1];
}

export function get2DFromIndex(index: number, columns: number) {
  const x = index % columns;
  const y = Math.floor(index / columns);

  return [x, y];
}

function getTile(map: number[], coords: number[], [map_w, map_h]: number[]) {
  const [col, row] = coords;

  if (col >= map_w || col < 0) return 0;
  if (row >= map_h || row < 0) return 0;

  const index = getIndexFrom2D(coords, [map_w, map_h]);

  return map[index];
}

export const makeMap = (map: number[]) => {
  const map_w = Math.sqrt(map.length);
  const map_h = Math.sqrt(map.length);
  const mapSize = [map_w, map_h];

  const toMerge = [];
  const t0 = performance.now();
  for (let i = 0; i < map.length; i++) {
    const row = Math.floor(i / map_w);
    const col = i % map_h;

    const type = map[i];

    const north = getTile(map, [col, row + 1], mapSize);
    const south = getTile(map, [col, row - 1], mapSize);

    const east = getTile(map, [col + 1, row], mapSize);
    const west = getTile(map, [col - 1, row], mapSize);

    const px = type && !east;
    const nx = type && !west;

    const py = type;
    const ny = !type;

    const pz = type && !north;
    const nz = type && !south;

    let topTile = 0;

    const rand = (...arr: number[]) => {
      const l = arr.length;

      return arr[Math.floor(Math.random() * l)];
    };

    /**
     * Pick randomly for floor tiles
     */
    let bottomTile = rand(53, 54, 22, 23, 39, 39, 39);
    let wallTile = rand(36, 36, 37);

    let bottomTileRotation = new Quaternion().identity();

    const tile = [
      px && makePlane("px", wallTile),
      nx && makePlane("nx", wallTile),

      // TOP
      py && makePlane("py", topTile),
      ny && makePlane("ny", bottomTile).applyQuaternion(bottomTileRotation),

      pz && makePlane("pz", wallTile),
      nz && makePlane("nz", wallTile),
    ]
      .filter((x) => x)
      .map((g: BufferGeometry) => {
        g.translate(col, 0, row);
        return g;
      });

    toMerge.push(...tile);
  }

  const merged = BufferGeometryUtils.mergeBufferGeometries(toMerge);
  merged.translate(-map_w / 2 + 0.5, 0, -map_h / 2 + 0.5);

  console.log("[map] generated in %i ms", performance.now() - t0);

  return merged;
};
