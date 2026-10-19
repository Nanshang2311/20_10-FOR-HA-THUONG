import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { wishes } from './config/wishes'

const FLOWERS = 64
const COLORS = ['#f4b4d0', '#ed8fba', '#c9a3f3', '#f8d0df', '#d783bd', '#f2a7c1']

type FlowerData = { x: number; height: number; color: string; kind: number; delay: number; sway: number }

function makeFlowers(): FlowerData[] {
  return Array.from({ length: FLOWERS }, (_, i) => {
    const spread = (i - (FLOWERS - 1) / 2) / ((FLOWERS - 1) / 2)
    return { x: 50 + spread * 43 + (Math.random() - .5) * 2, height: 20 + Math.random() * 35 + (1 - Math.abs(spread)) * 9, color: COLORS[Math.floor(Math.random() * COLORS.length)], kind: i % 4, delay: Math.abs(spread) * 5.2 + Math.random() * .3, sway: 2 + Math.random() * 2 }
  }).sort((a, b) => Math.abs(a.x - 50) - Math.abs(b.x - 50))
}

type PetalProps = { rotation: number; d: string; fill: string; stroke: string; opacity?: number }

function Petal({ rotation, d, fill, stroke, opacity = 1 }: PetalProps) {
  return <g className="petal-unit" data-angle={rotation} transform={`rotate(${rotation})`}>
    <path d={d} fill={fill} stroke={stroke} strokeWidth=".85" strokeLinejoin="round" opacity={opacity} />
  </g>
}

const ROSE_PETAL = 'M0 3 C-5 0 -13 -6 -14 -15 C-15 -24 -8 -29 -3 -21 C-1 -18 1 -18 3 -21 C8 -29 15 -24 14 -15 C13 -6 5 0 0 3Z'
const TULIP_PETAL = 'M0 3 C-5 0 -12 -7 -14 -17 C-16 -28 -9 -34 -4 -25 C-2 -21 2 -21 4 -25 C9 -34 16 -28 14 -17 C12 -7 5 0 0 3Z'

function Flower({ flower, index, active, onPetal, onBloomComplete }: { flower: FlowerData; index: number; active: boolean; onPetal: (e: React.MouseEvent<SVGSVGElement>) => void; onBloomComplete: (svg: SVGSVGElement, count?: number) => void }) {
  const stem = useRef<SVGGElement>(null)
  const outer = useRef<SVGGElement>(null)
  const middle = useRef<SVGGElement>(null)
  const inner = useRef<SVGGElement>(null)
  const glints = useRef<SVGGElement>(null)
  const halo = useRef<SVGCircleElement>(null)
  const bloomId = `bloom-${index}`
  const isTulip = flower.kind === 1 || flower.kind === 3
  let petalInterval: number | undefined
  useEffect(() => {
    if (!active || !stem.current || !outer.current || !inner.current || (!isTulip && !middle.current)) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ delay: flower.delay, onComplete: () => { const svg = stem.current?.ownerSVGElement; if (svg) { onBloomComplete(svg); if (!reduced) petalInterval = window.setInterval(() => onBloomComplete(svg, 1), 2800 + Math.random() * 1400) } } })
      timeline.fromTo(stem.current, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: reduced ? .08 : 1.65, ease: 'power2.out' })
      if (isTulip) {
        timeline.fromTo(outer.current!.children, { scaleX: .16, scaleY: .6, rotation: (i, target) => Number((target as SVGElement).dataset.angle) + (i % 2 ? -7 : 7), opacity: .35, svgOrigin: '60 57' }, { scaleX: 1.08, scaleY: 1, rotation: (_i, target) => Number((target as SVGElement).dataset.angle), opacity: 1, duration: reduced ? .08 : 1.35, stagger: reduced ? 0 : .11, ease: 'back.out(1.25)' }, '-=.12')
        timeline.fromTo(inner.current!.children, { scaleX: .1, scaleY: .55, rotation: (i, target) => Number((target as SVGElement).dataset.angle) + (i % 2 ? 6 : -6), opacity: .2, svgOrigin: '60 57' }, { scaleX: 1, scaleY: 1, rotation: (_i, target) => Number((target as SVGElement).dataset.angle), opacity: 1, duration: reduced ? .08 : 1.15, stagger: reduced ? 0 : .09, ease: 'back.out(1.35)' }, '-=.38')
      } else {
        timeline.fromTo(outer.current!.children, { scaleX: .12, scaleY: .56, rotation: (i, target) => Number((target as SVGElement).dataset.angle) + (i % 2 ? -8 : 8), opacity: .45, svgOrigin: '60 57' }, { scaleX: 1.08, scaleY: 1, rotation: (_i, target) => Number((target as SVGElement).dataset.angle), opacity: 1, duration: reduced ? .08 : 1.5, stagger: reduced ? 0 : .09, ease: 'back.out(1.2)' }, '-=.12')
        timeline.fromTo(middle.current!.children, { scaleX: .1, scaleY: .56, rotation: (i, target) => Number((target as SVGElement).dataset.angle) + (i % 2 ? 7 : -7), opacity: .25, svgOrigin: '60 57' }, { scaleX: .82, scaleY: .88, rotation: (_i, target) => Number((target as SVGElement).dataset.angle), opacity: 1, duration: reduced ? .08 : 1.25, stagger: reduced ? 0 : .085, ease: 'back.out(1.35)' }, '-=.43')
        timeline.fromTo(inner.current!.children, { scaleX: .08, scaleY: .5, rotation: (i, target) => Number((target as SVGElement).dataset.angle) + (i % 2 ? -9 : 9), opacity: .15, svgOrigin: '60 57' }, { scaleX: .57, scaleY: .67, rotation: (_i, target) => Number((target as SVGElement).dataset.angle), opacity: 1, duration: reduced ? .08 : 1.1, stagger: reduced ? 0 : .1, ease: 'back.out(1.4)' }, '-=.34')
      }
      if (halo.current) {
        timeline.fromTo(halo.current, { scale: .35, opacity: 0, svgOrigin: '60 57' }, { scale: 1, opacity: .36, duration: reduced ? .08 : 1.5, ease: 'sine.out' }, '>-0.35')
      }
      if (!reduced) {
        if (halo.current) gsap.to(halo.current, { opacity: .5, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: flower.delay + 7.5 })
        gsap.to(stem.current, { rotation: flower.sway, transformOrigin: '50% 100%', duration: 2.5 + flower.sway * .2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: flower.delay + 3.2 })
        if (glints.current) gsap.fromTo(glints.current.children, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: .85, duration: .45, stagger: .27, delay: flower.delay + 2.3, repeat: -1, repeatDelay: 1.1, yoyo: true, ease: 'sine.inOut' })
      }
    }, stem)
    return () => { if (petalInterval !== undefined) window.clearInterval(petalInterval); ctx.revert() }
  }, [active, flower, isTulip, onBloomComplete])

  const depth = Math.max(0, Math.min(1, (flower.height - 20) / 44))
  const width = 42 + depth * 36
  const rotation = (i: number, count: number, offset = 0) => (360 / count) * i + offset
  return <svg className="flower-svg" viewBox="0 0 120 150" preserveAspectRatio="none" style={{ left: `${flower.x}%`, height: `${flower.height}vh`, width: `${width}px`, zIndex: Math.round(flower.height), color: flower.color }} aria-label={isTulip ? 'Hoa tulip nở rộ' : 'Hoa hồng nở rộ'} onClick={onPetal}>
    <defs>
      <linearGradient id={`${bloomId}-outer`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2f6"/><stop offset=".42" stopColor={flower.color}/><stop offset="1" stopColor={flower.color} stopOpacity=".86"/></linearGradient>
      <linearGradient id={`${bloomId}-middle`} x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stopColor="#fff8f7"/><stop offset=".48" stopColor={flower.color}/><stop offset="1" stopColor="#a95189" stopOpacity=".9"/></linearGradient>
      <linearGradient id={`${bloomId}-inner`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff5d9"/><stop offset=".5" stopColor="#f5c4d3"/><stop offset="1" stopColor={flower.color}/></linearGradient>
      <radialGradient id={`${bloomId}-light`}><stop offset="0" stopColor="#fff5d9" stopOpacity=".7"/><stop offset=".3" stopColor={flower.color} stopOpacity=".35"/><stop offset="1" stopColor={flower.color} stopOpacity="0"/></radialGradient>
    </defs>
    <g ref={stem} className="plant">
      <path d="M60 150 C57 118 64 88 60 57" fill="none" stroke="#52735e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M59 123 C39 124 29 112 26 101 C43 101 55 108 59 123Z" fill="#537761" opacity=".94" />
      <path d="M61 101 C78 98 88 86 90 76 C73 79 63 87 61 101Z" fill="#66856b" opacity=".9" />
      <g className="bloom-head" transform="translate(60 57) scale(1 .32)">
        <circle ref={halo} className="bloom-halo" r="48" fill={`url(#${bloomId}-light)`} opacity="0" pointerEvents="none"/>
        {isTulip ? <>
          <g ref={outer} className="petal-layer tulip-outer">
            {[-58, -35, -12, 12, 35, 58].map((angle, i) => <Petal key={`tulip-outer-${i}`} rotation={angle} d={TULIP_PETAL} fill={`url(#${bloomId}-outer)`} stroke="#fff0f6" opacity={.88 + (i % 2) * .12} />)}
          </g>
          <g ref={inner} className="petal-layer tulip-inner">
            {[-18, 18].map((angle, i) => <Petal key={`tulip-inner-${i}`} rotation={angle} d={TULIP_PETAL} fill={`url(#${bloomId}-middle)`} stroke="#fff5f7" />)}
          </g>
        </> : <>
          <g ref={outer} className="petal-layer rose-outer">
            {Array.from({ length: 8 }, (_, i) => <Petal key={`rose-outer-${i}`} rotation={rotation(i, 8)} d={ROSE_PETAL} fill={`url(#${bloomId}-outer)`} stroke="#fbe2ed" opacity={.9 + (i % 2) * .1} />)}
          </g>
          <g ref={middle} className="petal-layer rose-middle">
            {Array.from({ length: 7 }, (_, i) => <Petal key={`rose-middle-${i}`} rotation={rotation(i, 7, 25)} d={ROSE_PETAL} fill={`url(#${bloomId}-middle)`} stroke="#f9d8e8" />)}
          </g>
          <g ref={inner} className="petal-layer rose-inner">
            {Array.from({ length: 5 }, (_, i) => <Petal key={`rose-inner-${i}`} rotation={rotation(i, 5, 18)} d={ROSE_PETAL} fill={`url(#${bloomId}-inner)`} stroke="#fff0dc" />)}
          </g>
        </>}
        <g className="flower-center"><circle r={isTulip ? 5.2 : 4.2} fill="#f7d98b"/><circle cx="-1.1" cy="-1.1" r="1.15" fill="#fff8d5"/></g>
        <g ref={glints} className="flower-glints" aria-hidden="true">
          <path className="flower-glint" d="M-27-18v7m-3.5-3.5h7" />
          <path className="flower-glint" d="M26-7v6m-3-3h6" />
          <path className="flower-glint" d="M1-37v6m-3-3h6" />
        </g>
      </g>
    </g>
  </svg>
}
function Atmosphere({ active, burst }: { active: boolean; burst: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    let raf = 0
    let w = 0, h = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particles = Array.from({ length: 85 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .3, phase: Math.random() * 6.28, speed: .0003 + Math.random() * .0008, hue: Math.random() > .78 ? 325 : 48 }))
    type Petal = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; heart?: boolean }
    const petals: Petal[] = []
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); w = el.clientWidth; h = el.clientHeight; el.width = w * dpr; el.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); window.addEventListener('resize', resize)
    const emit = (x: number, y: number, count = 9, heart = false) => { for (let i = 0; i < count; i++) petals.push({ x, y, vx: (Math.random() - .5) * (heart ? 1.2 : 2.8), vy: -Math.random() * (heart ? 1.8 : 2.4) - .4, rot: Math.random() * 6, vr: (Math.random() - .5) * .12, life: 100 + Math.random() * 80, heart }) }
    const onBurst = () => { for (let i = 0; i < 76; i++) { const t = (i / 76) * Math.PI * 2; const x = 16 * Math.pow(Math.sin(t), 3); const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); petals.push({ x: w * .5 + x * Math.min(w, h) / 44, y: h * .38 - y * Math.min(w, h) / 44, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, rot: t, vr: .01, life: 280 + Math.random() * 100, heart: true }) } }
    const onPointer = (e: PointerEvent) => { const r = el.getBoundingClientRect(); emit(e.clientX - r.left, e.clientY - r.top, 2) }
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) { const twinkle = .35 + .65 * ((Math.sin(time * p.speed * 8 + p.phase) + 1) / 2); ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r * twinkle, 0, Math.PI * 2); ctx.fillStyle = `hsla(${p.hue},80%,82%,${twinkle * (active ? .75 : .48)})`; ctx.shadowBlur = 9 * twinkle; ctx.shadowColor = '#f1b8e0'; ctx.fill(); if (!reduced) p.y -= p.speed }
      ctx.shadowBlur = 0
      for (let i = petals.length - 1; i >= 0; i--) { const p = petals[i]; p.x += p.vx; p.y += p.vy; p.vy += .013; p.rot += p.vr; p.life--; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life / 35); ctx.fillStyle = p.heart ? '#ffd3e5' : '#f2a9c8'; ctx.shadowColor = '#f69dce'; ctx.shadowBlur = p.heart ? 17 : 7; ctx.beginPath(); ctx.ellipse(0, 0, p.heart ? 3.5 : 3, p.heart ? 6 : 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); if (p.life <= 0) petals.splice(i, 1) }
      raf = requestAnimationFrame(draw)
    }
    const clickBurst = (e: Event) => { const ce = e as CustomEvent<{ x: number; y: number; count?: number }>; emit(ce.detail.x, ce.detail.y, ce.detail.count ?? 14) }
    el.addEventListener('garden-petal', clickBurst); el.addEventListener('garden-heart', onBurst); if (active) el.addEventListener('pointermove', onPointer, { passive: true })
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); el.removeEventListener('garden-petal', clickBurst); el.removeEventListener('garden-heart', onBurst); el.removeEventListener('pointermove', onPointer) }
  }, [active, burst])
  return <canvas ref={canvas} className="atmosphere" aria-hidden="true" />
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [bloomed, setBloomed] = useState(false)
  const [finale, setFinale] = useState(false)
  const [sound, setSound] = useState(true)
  const [musicMissing, setMusicMissing] = useState(false)
  const [burst, setBurst] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const wishRef = useRef<HTMLDivElement>(null)
  const flowers = useMemo(makeFlowers, [burst])
  useEffect(() => { gsap.fromTo('.intro-content > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .18, ease: 'power2.out' }) }, [])
  useEffect(() => { if (started) { gsap.to(introRef.current, { opacity: 0, duration: .7, onComplete: () => setBloomed(true) }) } }, [started])
  useEffect(() => { if (bloomed) { const timer = window.setTimeout(() => { gsap.fromTo(wishRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' }) }, 13500); return () => clearTimeout(timer) } }, [bloomed])
  const begin = async () => {
    setStarted(true)
    if (audio.current) { audio.current.volume = 0; try { audio.current.currentTime = 72; await audio.current.play(); gsap.to(audio.current, { volume: .72, duration: 3 }) } catch { setMusicMissing(true) } }
  }
  const reset = () => { gsap.killTweensOf('*'); setStarted(false); setBloomed(false); setFinale(false); setMusicMissing(false); setBurst(n => n + 1); if (audio.current) { audio.current.pause(); audio.current.currentTime = 0; audio.current.volume = 0 } }
  const toggleSound = () => { const el = audio.current; if (!el) return; setSound(!sound); if (!sound && started) { el.play().catch(() => setMusicMissing(true)); gsap.to(el, { volume: .72, duration: .6 }) } else gsap.to(el, { volume: 0, duration: .4, onComplete: () => el.pause() }) }
  const burstFlower = useCallback((svg: SVGSVGElement, count = 14) => { const r = svg.getBoundingClientRect(); const ev = new CustomEvent('garden-petal', { detail: { x: r.left + r.width / 2, y: r.top + r.height * .3, count } }); document.querySelector('canvas')?.dispatchEvent(ev) }, [])
  const petal = (e: React.MouseEvent<SVGSVGElement>) => burstFlower(e.currentTarget)
  const climax = () => { document.querySelector('canvas')?.dispatchEvent(new Event('garden-heart')); setFinale(true); window.setTimeout(() => setFinale(false), 9500) }
  return <main className={`app ${started ? 'is-started' : ''} ${bloomed ? 'garden-ready' : ''}`}>
    <audio ref={audio} src="/music/Đô Trưởng - Đạt G - Vpop.mp3" loop preload="none" onError={() => setMusicMissing(true)} />
    <div className="grain" aria-hidden="true" />
    <Atmosphere active={started} burst={burst} />
    <div className="topline"><span className="brand"><span className="brand-dot" /> HAPPY 20-10</span>{started && <button className="sound-button" onClick={toggleSound} aria-label={sound ? 'Tắt nhạc' : 'Bật nhạc'}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>{sound ? 'Âm nhạc' : 'Tắt tiếng'}</span></button>}</div>
    {!started && <section ref={introRef} className="intro-screen"><div className="intro-content"><div className="eyebrow"><Sparkles size={13} strokeWidth={1.5} /> MỘT MÓN QUÀ NHỎ</div><div className="intro-flower" aria-hidden="true"><svg viewBox="0 0 120 150"><path d="M60 148C59 108 62 76 60 49" stroke="#66856b" strokeWidth="2" fill="none"/><path d="M60 119c-21 1-29-12-30-21 16 1 26 7 30 21Z" fill="#66856b"/><g fill="#e89abd"><ellipse cx="60" cy="36" rx="12" ry="27"/><ellipse cx="60" cy="36" rx="12" ry="27" transform="rotate(60 60 60)"/><ellipse cx="60" cy="36" rx="12" ry="27" transform="rotate(120 60 60)"/><ellipse cx="60" cy="36" rx="12" ry="27" transform="rotate(180 60 60)"/><ellipse cx="60" cy="36" rx="12" ry="27" transform="rotate(240 60 60)"/><ellipse cx="60" cy="36" rx="12" ry="27" transform="rotate(300 60 60)"/></g><circle cx="60" cy="60" r="8" fill="#f5d49a"/></svg></div><h1>{wishes.intro}</h1><p>Một điều em có thể ngắm thật lâu.</p><button className="primary-button" onClick={begin}>{wishes.invitation}<span className="button-arrow">↗</span></button></div><div className="intro-foot">22 · 10 · 2026 <span /> MADE WITH LOVE</div></section>}
    {started && <><div className="moon" aria-hidden="true" /><div className="skyline" aria-hidden="true"/><div className="garden-ground" aria-hidden="true"/><section className="garden" aria-label="Khu vườn hoa"><div className="garden-glow" />{bloomed && flowers.map((f, i) => <Flower key={`${burst}-${i}`} flower={f} index={i} active={bloomed} onPetal={petal} onBloomComplete={burstFlower} />)}</section><div className={`wish-card ${finale ? 'wish-finale' : ''}`} ref={wishRef}><div className="wish-date">{wishes.date}</div><h2>{finale ? wishes.finale : wishes.title}</h2>{!finale && <p>{wishes.message}</p>}</div>{musicMissing && <div className="music-note">Chưa tìm thấy nhạc · đặt file tại <code>public/music/Đô Trưởng - Đạt G - Vpop.mp3</code></div>}{!finale && <button className="climax-button" onClick={climax}>Một điều ước dành cho HÀ THƯƠNG<span>✧</span></button>}{finale && <><div className="finale-label">MỘT ĐIỀU ƯỚC DÀNH RIÊNG CHO EM</div><div className="heart-message">YÊU HÀ THƯƠNG</div></>}<button className="replay-button" onClick={reset} aria-label="Xem lại animation"><RotateCcw size={15}/><span>{wishes.replay}</span></button></>}
    <div className="bottom-mark"><span>✳</span> FOR HÀ THƯƠNG</div>
  </main>
}
