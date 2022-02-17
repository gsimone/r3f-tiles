import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as React from "react";
import { GLSL3, Material, Vector2 } from "three";
import isValidRef from "./utils/isValidRef";

import useMaterialDebug from "./utils/useMaterialDebug";

const glsl = x => `${x}`

const MyMaterial = shaderMaterial(
  {
    u_time: 0,
    uMap: null,
    depth: 0,
    uTileUv: new Vector2(0, 0),
		uDebugUv: 0,
  },
  glsl`
	in int depth;

	flat out int vDepth;
	out vec2 vUv;

	out vec3 vNormal;

	void main() {

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		vDepth = depth;
		vUv = uv;
		vNormal = normal;

	}
	`,
  glsl`
	precision highp float;
	precision highp int;
	precision highp sampler2DArray;

	uniform sampler2DArray uMap;
	uniform float uDebugUv;
	
	flat in int vDepth;
	in vec2 vUv;

	out vec4 outColor;
	in vec3 vNormal;

	vec2 rotate(vec2 v, float a) {
		float s = sin(a);
		float c = cos(a);
		mat2 m = mat2(c, s, -s, c);
		return m * v;
	}

	void main() {

		vec2 uv = vec2(vUv.x, 1. - vUv.y);

		uv -= .5;
		uv = rotate(uv, 3.14 / 2. * 0.);
		uv += .5;

		vec4 color = texture( uMap, vec3(  uv, vDepth ) );

		vec4 final = color;

		if (uDebugUv > 0.5) {
			final = vec4(uv, 0., 1.);
		} else	if (uDebugUv > 0.) {
			final = vec4(vNormal, 1.);
		}
		
		outColor = vec4( final.rgb, 1. );
	}
	`,
  (x) => {
    x.glslVersion = GLSL3;
  }
);

extend({ MyMaterial });

function MaterialWrapper(props) {
  useMaterialDebug(MyMaterial);

	const controls = useControls({
		uDebugUv: {
			value: 0,
			min: 0,
			max: 1,
			step: 0.5,
		}
	})

  const materialRef = React.useRef<typeof Material>(null!);

  useFrame(({ clock }) => {
    if (isValidRef(materialRef)) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return <myMaterial {...props} {...controls} ref={materialRef} transparent />;
}

export default MaterialWrapper;
