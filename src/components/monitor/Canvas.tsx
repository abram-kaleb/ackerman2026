// Box1.tsx
import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Model() {
  const { scene } = useGLTF('./engine.glb')
  // const { scene } = useGLTF('https://enginemonitoring.duckdns.org/assets/engine.glb')
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.roughness = 0.8
          mesh.material.metalness = 0.1
          mesh.material.envMapIntensity = 0.5
        }
      }
    })
  }, [scene])

  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0
    }
  })

  return <primitive ref={modelRef} object={scene} />
}

const Box1 = () => {
  return (
    <div className="relative w-full h-full min-w-0 min-h-0 overflow-hidden group rounded-2xl">
      <Canvas 
        dpr={[1, 1.5]} 
        shadows={{ type: THREE.PCFShadowMap }} 
        camera={{ fov: 5, position: [5, 2, 8] }} 
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <Suspense fallback={null}>
          <Stage 
            environment="apartment" 
            intensity={0.5} 
            shadows={{ type: 'contact', opacity: 0.2, blur: 2.5 }} 
            adjustCamera={false}
          >
            <Model />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}

export default Box1