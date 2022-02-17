import * as React from "react";
import { OrbitControls as ImplOrbitControls } from "@react-three/drei";

import useStore from "../store";

export function OrbitControls() {

  return (
    <ImplOrbitControls
      enabled={true}
      ref={(ref) =>
        useStore.setState({
          orbitControls: ref,
        })
      }
    />
  );
}

export default OrbitControls;
