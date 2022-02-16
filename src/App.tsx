import * as React from "react";
import { Canvas } from "@react-three/fiber";

import { Toaster } from "react-hot-toast";

import { OrbitControls } from "./utils";

import ShaderMaterial from "./ShaderMaterial";
import { ClampToEdgeWrapping, DataTexture2DArray, NearestFilter } from "three";
import { useTexture2DArray } from "./utils/useTexture2DArray";
import { makeMap } from "./utils/makeMap";
import useStore from "./store";

import { map } from "./store/map";

const transformUv = (x: Float32Array, size: number[], tileCoords: number[]) => {
  for (let i = 0; i < x.length; i += 2) {
    const u = x[i] / size[0] + (1 / size[0]) * tileCoords[0];
    const v = x[i + 1] / size[1] + (1 / size[1]) * tileCoords[1];

    x.set([u, v], i);
  }
};

const tiles: Record<string, number> = {
  FLOOR: 12,
  WALL: 7,
};

function TileMap({
  type = tiles.FLOOR,
  texture,
  plane,
  ...props
}: {
  type: number;
  plane: "px" | "nx" | "py" | "ny" | "pz" | "nz";
  texture: DataTexture2DArray;
}) {
  const [ref, setRef] = React.useState(null!);

  const geometry = React.useMemo(() => {
    return makeMap(map);
  }, []);

  return (
    <>
      <mesh geometry={geometry} {...props}>
        <ShaderMaterial uMap={texture} depth={tiles[type]} toneMapped={false} />
      </mesh>
    </>
  );
}

function MyScene({paintingTile}) {
  const texture = useTexture2DArray("./2darray.png");
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;

  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;


  return (
    <>
      <TileMap
        onPointerDown={(e) => {
          if (e.buttons === 1) {

            const face = e.intersections[0].face
            const mesh = e.intersections[0].object
  
            const attribute = mesh.geometry.getAttribute('depth')
  
            attribute.set([paintingTile], face.a)
            attribute.set([paintingTile], face.b)
            attribute.set([paintingTile], face.c)
  
            attribute.needsUpdate = true
          }
        }}
        texture={texture}
      />
    </>
  );
}

function App() {
  const [selected, setSelected] = React.useState(39)

  
  return (
    <>
      <div id="canvas">
        <Canvas
          camera={{ position: [40, 30, 40], fov: 10, near: 0.1, far: 1000 }}
        >
          <React.Suspense fallback={null}>
            <color attach="background" args={["#17141F"]} />
            <MyScene paintingTile={selected} />
          </React.Suspense>
          <axesHelper />
        </Canvas>

        <div>
          <Toaster />
          <div className="tilemap">
            <img src="./map.png" />

            {Array.from({ length: 17 * 8 }).map((_, i) => {
              const columns = 17;

              const x = i % columns;
              const y = Math.floor(i / columns);

              const row = y;
              const col = x;

              return (
                <div
                  onClick={() => {
                    console.log("col: %i; row: %i; i: %i", col, row, i + 1);
                    setSelected(i+1)
                  }}
                  className={selected === i+1 && "selected"}
                  style={{
                    width: 16,
                    height: 16,
                    left: 16 * x,
                    top: 16 * y,
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
