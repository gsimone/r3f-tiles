import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { makePlane } from "./makePlane";
import { BufferGeometry, Quaternion, Vector3 } from "three";

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

export const makeMap = (map: number[][], DEBUG_EXPLODE = 1) => {
  const toMerge = [];
  const map_w = Math.sqrt(map[0].length);
  const map_h = Math.sqrt(map[0].length);

  const numberOfLayers = map.length;

  const t0 = performance.now();
  for (let z = 0; z < map.length; z++) {
    const layer = map[z];

    const mapSize = [map_w, map_h];

    for (let i = 0; i < layer.length; i++) {
      const row = Math.floor(i / map_w);
      const col = i % map_h;

      const type = layer[i];

      const up =
        z + 1 < numberOfLayers
          ? map[z + 1][getIndexFrom2D([col, row], [map_w, map_h])]
          : 0;
      const down =
        z - 1 >= 0 ? map[z - 1][getIndexFrom2D([col, row], [map_w, map_h])] : 0;

      const north = getTile(layer, [col, row + 1], mapSize);
      const south = getTile(layer, [col, row - 1], mapSize);

      const east = getTile(layer, [col + 1, row], mapSize);
      const west = getTile(layer, [col - 1, row], mapSize);

      const px = type && !east;
      const nx = type && !west;

      const py = type && up === 0;
      const ny = type && down === 0;

      const pz = type && !north;
      const nz = type && !south;

      const rand = (...arr: number[]) => {
        const l = arr.length;

        return arr[Math.floor(Math.random() * l)];
      };

      /**
       * Pick randomly for floor tiles
       */
      let bottomTile = 39;
      let wallTile = 36;
      let topTile = 0;

      let bottomTileRotation = new Quaternion()
        .identity()
        .setFromAxisAngle(new Vector3(0, 1, 0), 0);

      const tile = [
        px && makePlane("px", wallTile),
        nx && makePlane("nx", wallTile),

        // TOP
        py && makePlane("py", z === 0 ? bottomTile : topTile),
        ny && makePlane("ny", bottomTile).applyQuaternion(bottomTileRotation),

        pz && makePlane("pz", wallTile),
        nz && makePlane("nz", wallTile),
      ]
        .filter((x) => x)
        .map((g: BufferGeometry) => {
          g.translate(
            col * DEBUG_EXPLODE,
            z * DEBUG_EXPLODE,
            row * DEBUG_EXPLODE
          );
          return g;
        });

      toMerge.push(...tile);
    }
  }
  console.log("[map] generated in %i ms", performance.now() - t0);

  const merged = BufferGeometryUtils.mergeBufferGeometries(toMerge);
  merged.translate(
    (-map_w / 2 + 0.5) * DEBUG_EXPLODE,
    (-numberOfLayers / 2 + 0.5) * DEBUG_EXPLODE,
    (-map_h / 2 + 0.5) * DEBUG_EXPLODE
  );

  return merged;
};
