import * as React from 'react'
import { OrbitControls as ImplOrbitControls } from '@react-three/drei'

import useStore from '../store'

export function OrbitControls() {
  const enabled = useStore((state) => !state.transforming)

  return (
    <ImplOrbitControls
      enabled={enabled}
      ref={(ref) =>
        useStore.setState({
          orbitControls: ref
        })
      }
    />
  )
}

export default OrbitControls
