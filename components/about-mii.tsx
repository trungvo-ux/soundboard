"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Center, OrbitControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"

function WireMii({ expanded, onReady }: { expanded: boolean; onReady: () => void }) {
  const { scene } = useGLTF("/models/trung-mii.glb?v=9")
  const group = useRef<THREE.Group>(null)
  const wireScene = useMemo(() => {
    const copy = scene.clone(true)
    const meshes: THREE.Mesh[] = []
    copy.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object)
    })
    meshes.forEach((object) => {
      const visible = object.geometry.attributes.position.count >= 500
      if (!visible) {
        object.material = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
        return
      }
      // Fill the depth buffer first so lines on the back and inside the Mii
      // cannot show through its face or body.
      object.material = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
        side: THREE.FrontSide,
      })
      const lines = new THREE.Mesh(object.geometry, new THREE.MeshBasicMaterial({
        color: "#9ba5b1",
        wireframe: true,
        transparent: true,
        opacity: 0.64,
        depthWrite: false,
        side: THREE.FrontSide,
      }))
      lines.renderOrder = 1
      lines.position.copy(object.position)
      lines.quaternion.copy(object.quaternion)
      lines.scale.copy(object.scale)
      object.parent?.add(lines)
    })
    return copy
  }, [scene])
  useEffect(() => onReady(), [onReady])
  useFrame((_, delta) => {
    if (!group.current) return
    const size = THREE.MathUtils.damp(group.current.scale.x, expanded ? 1 : 0.62, 7, delta)
    group.current.scale.setScalar(size)
  })
  return <group ref={group} scale={0.62}><Center><primitive object={wireScene} /></Center></group>
}

function ColorMii({ active, onReady }: { active: boolean; onReady: () => void }) {
  const { scene } = useGLTF("/models/trung-mii.glb?v=9")
  const { model, torso, head, shirt } = useMemo(() => {
    const model = scene.clone(true)
    const meshes: THREE.Mesh[] = []
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object)
    })
    const shirt = meshes.find((mesh) => mesh.geometry.attributes.position.count === 3151)
    const pants = meshes.find((mesh) => mesh.geometry.attributes.position.count === 3039)
    const torso = new THREE.Group()
    const head = new THREE.Group()
    torso.position.y = 0.52
    head.position.y = 0.68
    model.add(torso)
    torso.add(head)
    model.updateMatrixWorld(true)
    if (shirt) {
      torso.attach(shirt)
      const geometry = shirt.geometry.clone()
      const positions = geometry.attributes.position
      const forward = new Float32Array(positions.count * 3)
      const backward = new Float32Array(positions.count * 3)
      geometry.morphTargetsRelative = true
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const weight = THREE.MathUtils.clamp((Math.abs(x) - 0.12) / 0.16, 0, 1)
          * THREE.MathUtils.clamp((0.4 - y) / 0.48, 0, 1)
        const side = Math.sign(x)
        forward[i * 3] = weight * 0.04
        forward[i * 3 + 1] = side * weight * 0.02
        forward[i * 3 + 2] = side * weight * 0.065
        backward[i * 3] = -forward[i * 3]
        backward[i * 3 + 1] = -forward[i * 3 + 1]
        backward[i * 3 + 2] = -forward[i * 3 + 2]
      }
      geometry.morphAttributes.position = [
        new THREE.Float32BufferAttribute(forward, 3),
        new THREE.Float32BufferAttribute(backward, 3),
      ]
      shirt.geometry = geometry
      shirt.updateMorphTargets()
    }
    for (const mesh of meshes) {
      if (mesh !== shirt && mesh !== pants) head.attach(mesh)
    }
    return { model, torso, head, shirt }
  }, [scene])
  const parts = useRef({ torso, head, shirt })
  const idleStrength = useRef(0)
  useEffect(() => { parts.current = { torso, head, shirt } }, [torso, head, shirt])
  useEffect(() => onReady(), [onReady])
  useFrame(({ clock }, delta) => {
    const { torso, head, shirt } = parts.current
    idleStrength.current = THREE.MathUtils.damp(idleStrength.current, active ? 1 : 0, 3, delta)
    const t = clock.getElapsedTime()
    const strength = idleStrength.current
    torso.position.x = strength * Math.sin(t * 0.86) * 0.016
    torso.position.y = 0.52 + strength * Math.sin(t * 1.58 + 0.3) * 0.008
    torso.rotation.x = strength * Math.sin(t * 0.72 + 0.4) * 0.025
    torso.rotation.y = strength * (Math.sin(t * 0.88) * 0.13 + Math.sin(t * 0.39 + 1.4) * 0.025)
    torso.rotation.z = strength * Math.sin(t * 0.97 + 0.7) * 0.06
    torso.scale.y = 1 + strength * Math.sin(t * 1.58 + 0.6) * 0.009
    head.rotation.x = strength * Math.sin(t * 0.72 + 1.1) * 0.03
    head.rotation.y = strength * Math.sin(t * 0.88 + 0.55) * 0.09
    head.rotation.z = strength * Math.sin(t * 0.97 + 1.5) * 0.065
    if (shirt?.morphTargetInfluences) {
      const swing = strength * Math.sin(t * 1.08 + 0.3)
      shirt.morphTargetInfluences[0] = Math.max(0, swing)
      shirt.morphTargetInfluences[1] = Math.max(0, -swing)
    }
  })
  return <Center><primitive object={model} /></Center>
}

export function AboutMii() {
  const [wireReady, setWireReady] = useState(false)
  const [colorReady, setColorReady] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showWire, setShowWire] = useState(true)
  const markWireReady = useCallback(() => setWireReady(true), [])
  const markColorReady = useCallback(() => setColorReady(true), [])

  useEffect(() => {
    if (!wireReady) return
    const frame = window.requestAnimationFrame(() => setExpanded(true))
    return () => window.cancelAnimationFrame(frame)
  }, [wireReady])
  useEffect(() => {
    if (!expanded || !colorReady || revealed) return
    const timer = window.setTimeout(() => setRevealed(true), 900)
    return () => window.clearTimeout(timer)
  }, [expanded, colorReady, revealed])
  useEffect(() => {
    if (!revealed) return
    const timer = window.setTimeout(() => setShowWire(false), 550)
    return () => window.clearTimeout(timer)
  }, [revealed])

  return <div className="about-mii" role="img" aria-label="3D model of Trung's Mii character" style={{ position: "relative" }}>
    {showWire && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: revealed ? 0 : 1, transition: `opacity ${revealed ? 550 : 0}ms ease-in-out` }}>
      <Canvas camera={{ position: [0, 0, 3.6], fov: 35 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <WireMii expanded={expanded} onReady={markWireReady} />
        </Suspense>
      </Canvas>
    </div>}
    <div style={{ position: "absolute", inset: 0, opacity: revealed ? 1 : 0, transition: "opacity 550ms ease-in-out" }}>
      <Canvas camera={{ position: [0, 0, 3.6], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={2} />
        <directionalLight position={[-2, -3, 5]} intensity={2} />
        <Suspense fallback={null}>
          <ColorMii active={revealed} onReady={markColorReady} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  </div>
}
