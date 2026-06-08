'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '@/providers/ThemeProvider'

type Palette = {
  globe: number
  node: number
  link: number
  ring: number
  particle: number
  lightA: number
  lightB: number
}

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    globe: 0x7c5cff,
    node: 0x00d4ff,
    link: 0x7c5cff,
    ring: 0x00d4ff,
    particle: 0x9aa6ff,
    lightA: 0x7c5cff,
    lightB: 0x00d4ff,
  },
  light: {
    globe: 0x7c5cff,
    node: 0x00b8d4,
    link: 0x8b5cf6,
    ring: 0xc084fc,
    particle: 0x8b5cf6,
    lightA: 0xc084fc,
    lightB: 0x7c5cff,
  },
}

function generateNetwork(count: number, radius: number) {
  const nodes = new Float32Array(count * 3)
  const pts: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const v = new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius)
    pts.push(v)
    nodes[i * 3] = v.x
    nodes[i * 3 + 1] = v.y
    nodes[i * 3 + 2] = v.z
  }

  const linePts: number[] = []
  const maxDist = radius * 0.58
  for (let i = 0; i < pts.length; i++) {
    const neighbors = pts
      .map((p, j) => ({ j, d: pts[i].distanceTo(p) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
    for (const { j, d } of neighbors) {
      if (d < maxDist && j > i) {
        linePts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
      }
    }
  }

  return { nodes, lines: new Float32Array(linePts) }
}

function generateParticles(count: number, inner: number, outer: number) {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(inner + Math.random() * (outer - inner))
    arr[i * 3] = v.x
    arr[i * 3 + 1] = v.y
    arr[i * 3 + 2] = v.z
  }
  return arr
}

function Network({ palette, mouseRef }: { palette: Palette; mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  const group = useRef<THREE.Group>(null)
  const radius = 1.65
  const baseRot = useRef({ x: 0, y: 0 })

  const { nodes, lines } = useMemo(() => generateNetwork(72, radius), [])

  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(nodes, 3))
    return g
  }, [nodes])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(lines, 3))
    return g
  }, [lines])

  useFrame((_, delta) => {
    if (!group.current) return
    baseRot.current.y += delta * 0.04
    const targetY = baseRot.current.y + mouseRef.current.x * 0.35
    const targetX = mouseRef.current.y * 0.18
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.04)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04)
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[radius * 0.96, 5]} />
        <meshPhongMaterial color={palette.globe} transparent opacity={0.07} shininess={80} depthWrite={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[radius, 3]} />
        <meshBasicMaterial color={palette.globe} wireframe transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={palette.link} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={nodeGeo}>
        <pointsMaterial color={palette.node} size={0.05} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

function OrbitalRings({ palette }: { palette: Palette }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.14
    if (ring2.current) ring2.current.rotation.z -= delta * 0.09
  })

  return (
    <group>
      <mesh ref={ring1} rotation={[Math.PI / 2.2, 0.25, 0]}>
        <torusGeometry args={[2.2, 0.0035, 10, 120]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2.5, -0.4, 0.35]}>
        <torusGeometry args={[2.5, 0.0028, 10, 120]} />
        <meshBasicMaterial color={palette.globe} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Particles({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => generateParticles(240, 2.0, 3.4), [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.015
      ref.current.rotation.x += delta * 0.006
    }
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={palette.particle} size={0.016} sizeAttenuation transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

function Scene({ palette, mouseRef }: { palette: Palette; mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={1} color={palette.lightA} />
      <pointLight position={[-4, -2, -3]} intensity={0.7} color={palette.lightB} />
      <Float speed={0.9} rotationIntensity={0.18} floatIntensity={0.35}>
        <Network palette={palette} mouseRef={mouseRef} />
        <OrbitalRings palette={palette} />
      </Float>
      <Particles palette={palette} />
    </>
  )
}

type Props = { className?: string }

export default function NeuralGlobe({ className = '' }: Props) {
  const { theme } = useTheme()
  const palette = PALETTES[theme]
  const mouse = useRef(new THREE.Vector2(0, 0))
  const [ready, setReady] = useState(false)

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }, [])

  return (
    <div
      className={`relative h-full w-full ${className}`}
      onPointerMove={onPointerMove}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.8s ease' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        onCreated={() => setReady(true)}
      >
        <Scene palette={palette} mouseRef={mouse} />
      </Canvas>
    </div>
  )
}
