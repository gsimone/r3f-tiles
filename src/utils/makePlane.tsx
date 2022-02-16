import {
  ClampToEdgeWrapping,
  DataTexture2DArray,
  Euler,
  Int32BufferAttribute,
  NearestFilter,
  PlaneGeometry,
  Quaternion,
} from "three";

export const makePlane = (plane, tile) => {
  const g = new PlaneGeometry();

  const uv = g.getAttribute("uv");
  const depthAttribute = new Int32BufferAttribute(
    Uint8Array.from({ length: 4 }, () => tile),
    1
  );
  g.setAttribute("depth", depthAttribute);

  const q = new Quaternion().identity();

  const PI = Math.PI;
  const hPI = PI / 2;

  if (plane === "py") {
    q.setFromEuler(new Euler(-hPI, 0, 0));
    g.applyQuaternion(q);
    g.translate(0, 1, 0);
  }
  
  if (plane === "ny") {
    q.setFromEuler(new Euler(-hPI, 0, 0));
    g.applyQuaternion(q);
    g.translate(0, 0, 0);
  }

  if (plane === "nz") {
    q.setFromEuler(new Euler(0, -PI, 0));
    g.applyQuaternion(q);
    g.translate(0, 0.5, -0.5);
  }

  if (plane === "pz") {
    g.translate(0, 0.5, 0.5);
  }

  if (plane === "px") {
    q.setFromEuler(new Euler(0, hPI, 0));
    g.applyQuaternion(q);
    g.translate(0.5, 0.5, 0);
  }

  if (plane === "nx") {
    q.setFromEuler(new Euler(0, -hPI, 0));
    g.applyQuaternion(q);
    g.translate(-0.5, 0.5, 0);
  }

  return g;
};
