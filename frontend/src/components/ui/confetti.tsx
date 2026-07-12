import { useEffect, useRef } from "react"

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = [
      "#34d399",
      "#60a5fa",
      "#fbbf24",
      "#a78bfa",
      "#f87171",
    ]
    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }))

    let frame = 0
    const animate = () => {
      frame++
      if (frame > 180) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.rotation += p.rotSpeed
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
    />
  )
}

export { Confetti }
