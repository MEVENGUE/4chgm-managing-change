'use client'

const LIGHTS = [
  { left: '18%', top: '22%', size: 180, delay: 0 },
  { left: '78%', top: '28%', size: 140, delay: 3 },
  { left: '62%', top: '72%', size: 160, delay: 6 },
  { left: '28%', top: '68%', size: 120, delay: 9 },
]

export default function RadialLights() {
  return (
    <>
      {LIGHTS.map((l, i) => (
        <div
          key={i}
          className="cinematic-radial-light"
          style={{
            left: l.left,
            top: l.top,
            width: l.size,
            height: l.size,
            background: i % 2 === 0
              ? 'radial-gradient(circle, var(--glow-primary), transparent 70%)'
              : 'radial-gradient(circle, var(--glow-secondary), transparent 70%)',
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}
    </>
  )
}
