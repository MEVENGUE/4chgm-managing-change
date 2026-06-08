'use client'

import { motion } from 'framer-motion'
import { Brain, Cloud, GitBranch, Layers, Shield, Sparkles, Target, Zap } from 'lucide-react'
import MarketingShell from '@/components/layout/MarketingShell'
import { FOUNDER } from '@/data/founder'
import { BRAND } from '@/lib/brand'

const MODULES = [
  { icon: Brain, title: 'AI Copilot', desc: 'Strategic copilot with persistent memory, artifacts, and enterprise context.' },
  { icon: Layers, title: 'Workspaces', desc: 'Role-based intelligence surfaces for Executive, Engineering, Finance, and Transformation.' },
  { icon: GitBranch, title: 'Portfolio', desc: 'Initiative management with dependencies, health scoring, and budget drift.' },
  { icon: Cloud, title: 'Integrations', desc: 'Enterprise connector architecture for Jira, GitHub, SAP, and more.' },
  { icon: Shield, title: 'Governance', desc: 'RBAC foundations, audit-ready workflows, and enterprise security.' },
  { icon: Zap, title: 'Insights', desc: 'Derived intelligence engine connecting projects to risks, analytics, and reports.' },
]

const STACK = ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'Three.js', 'FastAPI', 'OpenAI-ready']

const ROADMAP = [
  { q: 'Q2 2026', item: 'Real OAuth connectors (Jira, GitHub)' },
  { q: 'Q3 2026', item: 'Vector RAG knowledge engine' },
  { q: 'Q4 2026', item: 'Enterprise SSO & multi-tenant' },
  { q: '2027', item: 'Predictive transformation forecasting' },
]

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
      {children}
    </motion.section>
  )
}

export default function AboutPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise AI Platform
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            <span className="text-gradient">{BRAND.name}</span>
            <span className="mt-2 block text-2xl font-medium text-[var(--text-secondary)] md:text-3xl">{BRAND.tagline}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">{BRAND.description}</p>
        </motion.div>

        <div className="mt-20 space-y-16">
          <Section title="Mission">
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
              4CHGM exists to make organizational transformation measurable, intelligent, and executable. We unify strategy, delivery, analytics, and AI into one cinematic operating system — so leaders see what matters and teams act with clarity.
            </p>
          </Section>

          <Section title="Vision" delay={0.05}>
            <div className="glass-panel-strong glass-elevated rounded-3xl p-8">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                A world where every enterprise runs transformation like a product: with observability, automation, resilient workflows, and AI-native decision-making — not slide decks and disconnected tools.
              </p>
            </div>
          </Section>

          <Section title="Platform Architecture" delay={0.1}>
            <div className="grid gap-4 md:grid-cols-3">
              {['Experience Layer', 'Intelligence Layer', 'Data Layer'].map((layer, i) => (
                <div key={layer} className="glass-panel-strong rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Layer {i + 1}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{layer}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {i === 0 && 'Dashboards, copilot, workspaces, cinematic UX'}
                    {i === 1 && 'Insights engine, forecasting, AI artifacts, knowledge'}
                    {i === 2 && 'Projects, connectors, pipelines, persistence'}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="AI-Powered Transformation Philosophy" delay={0.15}>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
              AI is not a chatbox bolted onto dashboards. In 4CHGM, intelligence is derived from live portfolio data, grounded in knowledge, and surfaced where decisions happen — executive summaries, risk alerts, roadmap generation, and executive reports.
            </p>
          </Section>

          <Section title="Core Modules" delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => (
                <div key={m.title} className="glass-panel-strong hover-lift rounded-2xl p-5">
                  <m.icon className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-3 text-sm font-semibold">{m.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{m.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Enterprise Workflow" delay={0.25}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
              {['Onboard', 'Connect', 'Plan', 'Execute', 'Measure', 'Optimize'].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-3 py-1.5">{step}</span>
                  {i < arr.length - 1 && <span className="text-[var(--text-muted)]">→</span>}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Technology Stack" delay={0.3}>
            <div className="flex flex-wrap gap-2">
              {STACK.map((t) => (
                <span key={t} className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">{t}</span>
              ))}
            </div>
          </Section>

          <Section title="Founder" delay={0.35}>
            <div className="glass-panel-strong glass-elevated overflow-hidden rounded-3xl">
              <div className="grid md:grid-cols-[1fr_2fr]">
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)]/15 to-[var(--secondary)]/10 p-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[var(--border-medium)] bg-[var(--bg-surface)] text-2xl font-bold text-[var(--primary)]">FM</div>
                  <p className="mt-4 text-center text-sm font-bold tracking-wide">{FOUNDER.name}</p>
                  <p className="mt-1 text-center text-[11px] text-[var(--text-muted)]">{FOUNDER.headline}</p>
                </div>
                <div className="space-y-4 p-8">
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{FOUNDER.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {FOUNDER.specializations.map((s) => (
                      <span key={s} className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)]">{s}</span>
                    ))}
                  </div>
                  {FOUNDER.education.map((e) => (
                    <div key={e.degree} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{e.degree}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{e.school} · {e.period}</p>
                      <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{e.detail}</p>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a href={FOUNDER.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--primary)] hover:underline">LinkedIn</a>
                    <a href={FOUNDER.links.github} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--primary)] hover:underline">GitHub</a>
                    <a href={`mailto:${FOUNDER.links.email}`} className="text-xs font-semibold text-[var(--primary)] hover:underline">Email</a>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Roadmap" delay={0.4}>
            <div className="space-y-3">
              {ROADMAP.map((r) => (
                <div key={r.q} className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
                  <span className="shrink-0 text-xs font-bold text-[var(--primary)]">{r.q}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{r.item}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </MarketingShell>
  )
}
