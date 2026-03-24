import { useEffect, useRef } from 'react'
import { ACTION_COLORS, CANVAS_COLORS } from '../../../core/constants/actionColors'

interface MapTree {
  id: number; tree_code: string; display_name?: string
  coord_x?: number; coord_y?: number; action: string; status: string
}

export default function MapCanvas({ trees, onSelect, selected }: {
  trees: MapTree[]; onSelect?: (t: MapTree) => void; selected?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pts = trees.filter(t => t.coord_x != null && t.coord_y != null)
  const xs = pts.map(t => t.coord_x!); const ys = pts.map(t => t.coord_y!)
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 10)
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 10)

  const toCanvas = (x: number, y: number, W: number, H: number) => {
    const pad = 40
    return [
      pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2),
      H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 2)
    ] as [number, number]
  }

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = CANVAS_COLORS.gridStroke; ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const gx = 40 + (i/10)*(W-80); ctx.beginPath(); ctx.moveTo(gx,40); ctx.lineTo(gx,H-40); ctx.stroke()
      const gy = 40 + (i/10)*(H-80); ctx.beginPath(); ctx.moveTo(40,gy); ctx.lineTo(W-40,gy); ctx.stroke()
    }
    pts.forEach(tree => {
      const [cx, cy] = toCanvas(tree.coord_x!, tree.coord_y!, W, H)
      const isSel = tree.id === selected
      ctx.beginPath(); ctx.arc(cx, cy, isSel ? 10 : 7, 0, Math.PI*2)
      ctx.fillStyle = ACTION_COLORS[tree.action] || ACTION_COLORS.pending; ctx.fill()
      if (isSel) { ctx.strokeStyle=CANVAS_COLORS.selectionStroke; ctx.lineWidth=2; ctx.stroke() }
      ctx.fillStyle=CANVAS_COLORS.labelText; ctx.font='9px sans-serif'; ctx.textAlign='center'
      ctx.fillText(tree.tree_code, cx, cy+18)
    })
  }, [trees, selected])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current!
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX-rect.left, my = e.clientY-rect.top
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    const hit = pts.find(t => { const [cx,cy]=toCanvas(t.coord_x!,t.coord_y!,W,H); return Math.hypot(mx-cx,my-cy)<12 })
    if (hit) onSelect?.(hit)
  }

  return <canvas ref={ref} role="img" aria-label="Map of tree locations on farm land" className="w-full h-full cursor-pointer" onClick={handleClick} />
}
