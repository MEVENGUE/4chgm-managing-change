'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileText, Search, Sparkles, Tag, Upload, Brain, Layers } from 'lucide-react'
import {
  getAllSources,
  getAllTags,
  semanticSearch,
  recommendKnowledge,
  summarizeDocument,
  PLAYBOOKS,
  KNOWLEDGE_UPDATED_EVENT,
  getUserIngestedCount,
  type KnowledgeSource,
  type Playbook,
} from '@/services/knowledge'
import IngestDocumentModal from '@/components/knowledge/IngestDocumentModal'

function DocCard({ doc }: { doc: KnowledgeSource }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-strong hover-lift rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">{doc.title}</p>
        </div>
        <span className="pill text-[9px]">{doc.type}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{summarizeDocument(doc.content).slice(0, 140)}…</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {doc.tags.slice(0, 4).map((t) => (
          <span key={t} className="rounded-full bg-[var(--accent-violet)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-secondary)]">{t}</span>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[var(--text-muted)]">{doc.origin} · {doc.ingestedAt}</p>
    </motion.div>
  )
}

function PlaybookCard({ pb }: { pb: Playbook }) {
  return (
    <motion.div layout className="glass-panel-strong hover-lift rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[var(--secondary)]" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">{pb.title}</p>
      </div>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{pb.category}</p>
      <ol className="mt-3 space-y-1.5">
        {pb.steps.map((s, i) => (
          <li key={s} className="flex gap-2 text-xs text-[var(--text-secondary)]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[9px] font-bold text-[var(--primary)]">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </motion.div>
  )
}

export default function KnowledgeCenterPage() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [sources, setSources] = useState<KnowledgeSource[]>(() => getAllSources())
  const [ingestOpen, setIngestOpen] = useState(false)
  const userIngested = useMemo(() => getUserIngestedCount(), [sources])
  const tags = useMemo(() => getAllTags(), [sources])

  useEffect(() => {
    const refresh = () => setSources(getAllSources())
    window.addEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
  }, [])
  const recommendations = useMemo(() => recommendKnowledge(query || 'transformation'), [query])

  const searchResults = useMemo(() => {
    if (!query.trim() && !activeTag) return null
    const q = activeTag ? `${query} ${activeTag}` : query
    return semanticSearch(q, 12)
  }, [query, activeTag])

  const filteredDocs = useMemo(() => {
    if (searchResults) {
      const docs = searchResults.flatMap((r) => r.sources)
      return docs.length ? docs : sources.filter((s) => !activeTag || s.tags.includes(activeTag))
    }
    return sources.filter((s) => !activeTag || s.tags.includes(activeTag))
  }, [searchResults, sources, activeTag])

  const filteredPlaybooks = useMemo(() => {
    if (searchResults) {
      const pbs = searchResults.flatMap((r) => r.playbooks)
      return pbs.length ? pbs : PLAYBOOKS.filter((p) => !activeTag || p.tags.includes(activeTag))
    }
    return PLAYBOOKS.filter((p) => !activeTag || p.tags.includes(activeTag))
  }, [searchResults, activeTag])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
              <Brain className="h-5 w-5 text-white" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Knowledge Center</h1>
              <p className="text-xs text-[var(--text-muted)]">Enterprise documents · playbooks · AI retrieval</p>
            </div>
          </div>
        </div>
        <button onClick={() => setIngestOpen(true)} className="flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--primary)]">
          <Upload className="h-3.5 w-3.5" /> Ingérer un document
        </button>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Documents indexés', value: sources.length },
          { label: 'Vos imports', value: userIngested },
          { label: 'Playbooks', value: PLAYBOOKS.length },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Chaque document ingéré alimente la recherche sémantique, les citations du Copilot IA et recalcule les statistiques Analytics.
      </p>

      <div className="glass-panel-strong glass-elevated rounded-3xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Semantic search across documents and playbooks…"
            className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${!activeTag ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'}`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t === activeTag ? null : t)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${activeTag === t ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">AI Recommendations</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendations.map((r) => (
            <a key={r.label} href={r.href} className="pill hover-lift transition hover:border-[var(--primary)]">{r.label}</a>
          ))}
        </div>
      </div>

      <section id="documents">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="section-title">Enterprise Documents</h2>
          <span className="text-[10px] text-[var(--text-muted)]">{filteredDocs.length} indexed</span>
        </div>
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((d) => <DocCard key={d.id} doc={d} />)}
          </div>
        </AnimatePresence>
      </section>

      <section id="playbooks">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="section-title">Transformation Playbooks</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPlaybooks.map((pb) => <PlaybookCard key={pb.id} pb={pb} />)}
        </div>
      </section>

      <IngestDocumentModal open={ingestOpen} onClose={() => setIngestOpen(false)} onIngested={() => setSources(getAllSources())} />
    </div>
  )
}
