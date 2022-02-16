import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'

const Billboard = React.forwardRef(function Billboard(
  { follow = true, lockX = false, lockY = false, lockZ = false, ...props }: BillboardProps,
  ref
) {
  const localRef = React.useRef()
  useFrame(({ camera }) => {
    if (!follow) return
    if (localRef.current) {
      const prev = {
        x: localRef.current.rotation.x,
        y: localRef.current.rotation.y,
        z: localRef.current.rotation.z
      }
      localRef.current.lookAt(camera.position)
      // readjust any axis that is locked
      if (lockX) localRef.current.rotation.x = prev.x
      if (lockY) localRef.current.rotation.y = prev.y
      if (lockZ) localRef.current.rotation.z = prev.z
    }
  })
  return <group ref={mergeRefs([localRef, ref])} {...props} />
})

export default Billboard
