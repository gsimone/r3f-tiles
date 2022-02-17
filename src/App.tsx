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
import useStore from "./store";
import { Edges } from "@react-three/drei";
import { useControls } from "leva";

const tiles: Record<string, number> = {
  FLOOR: 12,
  WALL: 7,
};

/**
 * The user sending the ws message
 */
// const user = `${Math.floor(Math.random() * 4096)}`;
// const ws = new WebSocket(
//   `wss://${process.env.CODESANDBOX_HOST}`.replace("$PORT", "4000")
// );

const TileMap = React.forwardRef<
  Mesh,
  {
    type: number;
    texture: DataTexture2DArray;
    onPointerDown: (e: any) => void;
  }
>(({ type = tiles.FLOOR, texture, ...props }, forwardedRef) => {
  const map = useStore((s) => s.map);
  const geometry = React.useMemo(() => {
    return makeMap(map);
  }, [map]);

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

  // React.useEffect(() => {
  //   const handleMessage = (e: { data: string }) => {
  //     const { paintingTile, face, from } = JSON.parse(e.data);

  //     if (from !== user) {
  //       applyChange(paintingTile, face);
  //     }
  //   };

  //   ws.addEventListener("message", handleMessage);

  //   return () => {
  //     ws.removeEventListener("message", handleMessage);
  //   };
  // });

  return (
    <>
      <TileMap
        ref={mesh}
        onPointerDown={(e) => {
          if (e.buttons === 1) {
            const face = e.intersections[0].face;

            applyChange(paintingTile, face);

            // ws.send(
            //   JSON.stringify(
            //     {
            //       from: user,
            //       paintingTile,
            //       face,
            //     },
            //     null,
            //     "  "
            //   )
            // );
          }
        }}
        texture={texture}
      />
    </>
  );
};

const TILESET = [17, 8];

const VoxelEditor = () => {
  const mapSize = useStore((s) => s.map.length);
  const toggleTileAt = useStore((s) => s.toggleTileAt);
  const [hovered, setHovered] = React.useState(null);

  return (
    <group
      position-x={-Math.sqrt(mapSize) / 2}
      position-z={-Math.sqrt(mapSize) / 2}
      onPointerOut={() => setHovered(false)}
    >
      {[...Array(mapSize)].map((_, i) => (
        <mesh
          position-x={(i % Math.sqrt(mapSize)) + 0.5}
          position-y={0.5}
          position-z={Math.floor(i / Math.sqrt(mapSize)) + 0.5}
          scale={1.01}
          visible={hovered === i}
          onPointerEnter={(e) => {
            e.stopPropagation();
            setHovered(i);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            toggleTileAt(i);
          }}
  
        >
          <Edges
            color="white"
            material-depthTest={false}
            material-depthWrite={false}
            renderOrder={100}
          />

          <meshBasicMaterial visible={false} />
          <boxGeometry />
        </mesh>
      ))}
    </group>
  );
};

function App() {
  const [selected, setSelected] = React.useState(39);

  const { editorMode } = useControls({
    editorMode: {
      value: "voxel",
      options: ["voxel", "tiles"],
    },
  });

  return (
    <>
      <div id="canvas">
        <Canvas
          camera={{ position: [40, 30, 40], fov: 10, near: 0.1, far: 1000 }}
        >
          <React.Suspense fallback={null}>
            <color attach="background" args={["#17141F"]} />
            <MyScene paintingTile={selected} />
            {editorMode === "voxel" && <VoxelEditor />}
          </React.Suspense>
          <axesHelper />

          <OrbitControls />
        </Canvas>

        <div>
          <Toaster />
          <div className="tilemap">
            <img src="./map.png" />

            {Array.from({ length: TILESET[0] * TILESET[1] }).map((_, i) => {
              const columns = TILESET[0];

              const x = i % columns;
              const y = Math.floor(i / columns);

              return (
                <div
                  onClick={() => {
                    setSelected(i + 1);
                  }}
                  className={selected === i + 1 ? "selected" : ""}
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
