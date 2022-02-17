import * as React from "react";
import { Canvas } from "@react-three/fiber";

import { Toaster } from "react-hot-toast";

import { OrbitControls } from "./utils";

import ShaderMaterial from "./ShaderMaterial";
import {
  BufferAttribute,
  ClampToEdgeWrapping,
  DataTexture2DArray,
  Mesh,
  NearestFilter,
} from "three";
import { useTexture2DArray } from "./utils/useTexture2DArray";
import { makeMap } from "./utils/makeMap";

import { map } from "./store/map";

const tiles: Record<string, number> = {
  FLOOR: 12,
  WALL: 7,
};

/**
 * The user sending the ws message
 */
const user = `${Math.floor(Math.random() * 4096)}`;
const ws = new WebSocket(
  `wss://${process.env.CODESANDBOX_HOST}`.replace("$PORT", "4000")
);

const TileMap = React.forwardRef<
  Mesh,
  {
    type: number;
    texture: DataTexture2DArray;
    onPointerDown: (e: any) => void;
  }
>(({ type = tiles.FLOOR, texture, ...props }, forwardedRef) => {
  const geometry = React.useMemo(() => {
    return makeMap(map);
  }, []);

  return (
    <>
      <mesh ref={forwardedRef} geometry={geometry} {...props}>
        <ShaderMaterial uMap={texture} depth={tiles[type]} toneMapped={false} />
      </mesh>
    </>
  );
});

type Face = {
  a: number;
  b: number;
  c: number;
};

const MyScene: React.FC<{ paintingTile: number }> = ({ paintingTile }) => {
  const texture = useTexture2DArray("./2darray.png", 16, 16, 137);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;

  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;

  const mesh = React.useRef<Mesh>(null!);

  const applyChange = React.useCallback((paintingTile: number, face: Face) => {
    const attribute = mesh.current.geometry.getAttribute(
      "depth"
    ) as BufferAttribute;
    attribute.set([paintingTile], face.a);
    attribute.set([paintingTile], face.b);
    attribute.set([paintingTile], face.c);

    attribute.needsUpdate = true;
  }, []);

  React.useEffect(() => {
    const handleMessage = (e: { data: string }) => {
      const { paintingTile, face, from } = JSON.parse(e.data);

      if (from !== user) {
        applyChange(paintingTile, face);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  });

  return (
    <>
      <TileMap
        ref={mesh}
        onPointerDown={(e) => {
          if (e.buttons === 1) {
            const face = e.intersections[0].face;

            applyChange(paintingTile, face);

            ws.send(
              JSON.stringify(
                {
                  from: user,
                  paintingTile,
                  face,
                },
                null,
                "  "
              )
            );
          }
        }}
        texture={texture}
      />
    </>
  );
};

function App() {
  const [selected, setSelected] = React.useState(39);

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

          <OrbitControls />
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
                    setSelected(i + 1);
                  }}
                  className={selected === i + 1 && "selected"}
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
