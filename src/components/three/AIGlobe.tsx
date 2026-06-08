'use client'

import { useMemo, useRef } from 'react'
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
    globe: 0x8b5cf6,
    node: 0xa855f7,
    link: 0x8b5cf6,
    ring: 0xc084fc,
    particle: 0x8b5cf6,
    lightA: 0xc084fc,
    lightB: 0x8b5cf6,
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
  const maxDist = radius * 0.6
  const perNode = 3
  for (let i = 0; i < pts.length; i++) {
    const neighbors = pts
      .map((p, j) => ({ j, d: pts[i].distanceTo(p) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, perNode)
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

function Network({ palette }: { palette: Palette }) {
  const group = useRef<THREE.Group>(null)
  const radius = 1.7

  const { nodes, lines } = useMemo(() => generateNetwork(84, radius), [])

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
    if (group.current) group.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={group}>
      {/* Inner translucent core for depth */}
      <mesh>
        <icosahedronGeometry args={[radius * 0.98, 6]} />
        <meshPhongMaterial
          color={palette.globe}
          transparent
          opacity={0.06}
          shininess={60}
          depthWrite={false}
        />
      </mesh>

      {/* Holographic wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[radius, 4]} />
        <meshBasicMaterial color={palette.globe} wireframe transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Network connections */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color={palette.link}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Glowing nodes */}
      <points geometry={nodeGeo}>
        <pointsMaterial
          color={palette.node}
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

function OrbitalRings({ palette }: { palette: Palette }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.18
    if (ring2.current) ring2.current.rotation.z -= delta * 0.12
    if (ring3.current) ring3.current.rotation.z += delta * 0.08
  })

  return (
    <group>
      <mesh ref={ring1} rotation={[Math.PI / 2.1, 0.3, 0]}>
        <torusGeometry args={[2.25, 0.004, 12, 140]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2.6, -0.5, 0.4]}>
        <torusGeometry args={[2.55, 0.003, 12, 140]} />
        <meshBasicMaterial color={palette.globe} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 1.8, 0.2, -0.3]}>
        <torusGeometry args={[2.85, 0.0025, 12, 140]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Particles({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => generateParticles(420, 2.0, 3.6), [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.02
      ref.current.rotation.x += delta * 0.008
    }
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color={palette.particle}
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function Scene({ palette }: { palette: Palette }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={1.1} color={palette.lightA} />
      <pointLight position={[-5, -2, -3]} intensity={0.8} color={palette.lightB} />

      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
        <Network palette={palette} />
        <OrbitalRings palette={palette} />
      </Float>
      <Particles palette={palette} />
    </>
  )
}

type AIGlobeProps = {
  className?: string
}

export default function AIGlobe({ className = '' }: AIGlobeProps) {
  const { theme } = useTheme()
  const palette = PALETTES[theme]

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene palette={palette} />
      </Canvas>
    </div>
  )
}
