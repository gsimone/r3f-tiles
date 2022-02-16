import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as React from "react";
import { GLSL3, Material, Vector2 } from "three";
import isValidRef from "./utils/isValidRef";

import useMaterialDebug from "./utils/useMaterialDebug";

const MyMaterial = shaderMaterial(
  {
    u_time: 0,
    uMap: null,
		depth: 0,
    uTileUv: new Vector2(0, 0),
  },
  /* glsl */
  `
	in int depth;

	flat out int vDepth;
	out vec2 vUv;

	void main() {

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		vDepth = depth;
		vUv = uv;

	}
	`,
  /* glsl */
  `
	precision highp float;
	precision highp int;
	precision highp sampler2DArray;

	uniform sampler2DArray uMap;
	
	flat in int vDepth;
	in vec2 vUv;

	out vec4 outColor;

	void main() {

		vec4 color = texture( uMap, vec3( vUv.x, 1. - vUv.y, vDepth ) );

		// lighten a bit
		outColor = vec4( color.rgb, 1. );

	}
	`, (x) => {
		x.glslVersion = GLSL3
	}
);


extend({ MyMaterial });

function MaterialWrapper(props) {
  useMaterialDebug(MyMaterial);

  const materialRef = React.useRef<typeof Material>(null!);

  useFrame(({ clock }) => {
    if (isValidRef(materialRef)) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return <myMaterial {...props} ref={materialRef} transparent />;
}

export default MaterialWrapper;
