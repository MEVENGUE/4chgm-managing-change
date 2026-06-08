'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minimize2, Download, Wand2, Loader2, Sparkles, FolderKanban, Lightbulb } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useProjects } from '@/providers/ProjectsProvider'
import { MERMAID_TEMPLATES } from '@/lib/mermaidTemplates'
import { generateMermaid, explainMermaid, mermaidFromInitiatives, AI_PROMPT_SUGGESTIONS } from '@/lib/mermaidAI'
import { generateMermaidWithApi } from '@/services/aiApi'
import { isApiEnabled } from '@/lib/apiClient'

let renderSeq = 0

export default function MermaidStudio() {
  const { theme } = useTheme()
  const { initiatives } = useProjects()
  const [code, setCode] = useState(MERMAID_TEMPLATES[0].code)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(() => {
    const map = new Map<string, typeof MERMAID_TEMPLATES>()
    for (const t of MERMAID_TEMPLATES) {
      const arr = map.get(t.category) ?? []
      arr.push(t)
      map.set(t.category, arr)
    }
    return Array.from(map.entries())
  }, [])

  const render = useCallback(
    async (source: string) => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: theme === 'light' ? 'default' : 'dark',
          themeVariables: {
            fontFamily: 'Inter, system-ui, sans-serif',
            primaryColor: theme === 'light' ? '#ede9fe' : '#1a1f3a',
            primaryBorderColor: theme === 'light' ? '#8b5cf6' : '#7c5cff',
            lineColor: theme === 'light' ? '#a855f7' : '#00d4ff',
            primaryTextColor: theme === 'light' ? '#1f2430' : '#f5f7ff',
          },
        })
        const id = `mermaid-${++renderSeq}`
        const { svg: out } = await mermaid.render(id, source)
        setSvg(out)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid diagram syntax')
      }
    },
    [theme]
  )

  useEffect(() => {
    const t = setTimeout(() => render(code), 300)
    return () => clearTimeout(t)
  }, [code, render])

  function exportSvg() {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    triggerDownload(URL.createObjectURL(blob), '4chgm-diagram.svg')
  }

  async function exportPng() {
    if (!previewRef.current || !svg) return
    const { toPng } = await import('html-to-image')
    const bg = theme === 'light' ? '#f8f9fc' : '#0d1117'
    const dataUrl = await toPng(previewRef.current, {
      pixelRatio: 3,
      backgroundColor: bg,
      cacheBust: true,
      style: { padding: '24px' },
    })
    triggerDownload(dataUrl, '4chgm-diagram.png')
  }

  function triggerDownload(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  async function runGenerate(promptText: string) {
    const text = promptText.trim()
    if (!text) return
    setGenerating(true)
    setExplanation(null)
    const ctx = initiatives.map((i) => `${i.name} (${i.status}, ${i.progress}%)`).join('; ')
    if (isApiEnabled()) {
      const api = await generateMermaidWithApi(text, ctx)
      if (api?.code) {
        setCode(api.code)
        setNote(api.note + (api.mock ? ' (mode mock)' : ''))
        setGenerating(false)
        return
      }
    }
    const { code: out, note: n } = generateMermaid(text, { initiatives })
    setCode(out)
    setNote(n)
    setGenerating(false)
  }

  function generateFromInitiatives() {
    setGenerating(true)
    setExplanation(null)
    setTimeout(() => {
      setCode(mermaidFromInitiatives(initiatives))
      setNote(`Dependency map built from ${initiatives.length} live initiatives.`)
      setGenerating(false)
    }, 500)
  }

  const aiBar = (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--secondary)]" />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runGenerate(prompt) }}
          placeholder="Describe a diagram — e.g. 'Generate AWS migration architecture'"
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          onClick={() => runGenerate(prompt)}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Generate
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {AI_PROMPT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setPrompt(s); runGenerate(s) }}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-strong)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)] transition hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
          >
            {s}
          </button>
        ))}
      </div>
      {note && <p className="mt-2 text-[11px] text-[var(--text-muted)]">{note}</p>}
    </div>
  )

  const editor = (
    <div className="flex flex-col">
      <div className="mb-2 space-y-1.5">
        {categories.map(([cat, items]) => (
          <div key={cat} className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{cat}</span>
            {items.map((t) => (
              <button
                key={t.id}
                onClick={() => { setCode(t.code); setNote(null) }}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
              >
                {t.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="w-full flex-1 resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 font-mono text-xs leading-relaxed text-[var(--text-secondary)] outline-none transition focus:border-[var(--border-medium)]"
        style={{ minHeight: fullscreen ? '60vh' : 220, fontFamily: 'var(--font-mono)' }}
      />
    </div>
  )

  const preview = (
    <div className="relative flex flex-1 items-center justify-center overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      {error ? (
        <p className="max-w-sm text-center text-xs text-[var(--danger)]">{error}</p>
      ) : (
        <div
          ref={previewRef}
          className="mermaid-preview flex w-full items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  )

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={generateFromInitiatives}
        disabled={generating}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--primary)] disabled:opacity-50"
      >
        <FolderKanban className="h-3.5 w-3.5" /> From initiatives
      </button>
      <button
        onClick={() => setExplanation(explainMermaid(code))}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
      >
        <Lightbulb className="h-3.5 w-3.5" /> Explain
      </button>
      <button onClick={exportSvg} className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]">
        <Download className="h-3.5 w-3.5" /> SVG
      </button>
      <button onClick={exportPng} className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]">
        <Download className="h-3.5 w-3.5" /> PNG
      </button>
      <button
        onClick={() => setFullscreen((f) => !f)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
        aria-label="Plein écran"
      >
        {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-4 bg-[var(--bg-overlay)] p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold tracking-wider text-[var(--text-primary)]">Mermaid Studio</p>
          {toolbar}
        </div>
        {aiBar}
        {explanation && (
          <div className="flex items-start gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs text-[var(--text-secondary)]">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" /> <span>{explanation}</span>
          </div>
        )}
        <div className="grid flex-1 gap-4 lg:grid-cols-2">
          {editor}
          {preview}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel-strong flex flex-col rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="section-title">Mermaid Studio</p>
        {toolbar}
      </div>
      <div className="mt-4">{aiBar}</div>
      {explanation && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs text-[var(--text-secondary)]">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" /> <span>{explanation}</span>
        </div>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {editor}
        {preview}
      </div>
    </div>
  )
}
