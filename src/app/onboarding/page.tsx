'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles, Building2, Rocket } from 'lucide-react'
import AmbientBackground from '@/components/layout/AmbientBackground'
import LogoFull from '@/components/brand/LogoFull'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useTranslation } from '@/i18n/I18nProvider'

const INDUSTRIES = ['Finance', 'Healthcare', 'Technology', 'Retail', 'Manufacturing', 'Energy', 'Public Sector', 'Telecom']
const SIZES = ['1–50', '51–250', '251–1,000', '1,001–5,000', '5,000+']
const DEPARTMENTS = ['Engineering', 'Product', 'Finance', 'Operations', 'HR', 'Marketing', 'Security', 'Data & AI', 'Transformation Office']
const TOOLS = ['Jira', 'Azure DevOps', 'GitHub', 'GitLab', 'SAP', 'ServiceNow', 'Notion', 'Slack', 'Teams', 'Confluence']
const CLOUDS = ['AWS', 'Azure', 'Google Cloud', 'On-premise', 'Hybrid']
const METHODOLOGIES = ['Scrum', 'SAFe', 'Kanban', 'Waterfall', 'Hybrid']
const GOALS = ['Reduce cost', 'Accelerate delivery', 'Cloud migration', 'AI adoption', 'Risk reduction', 'Team enablement', 'Data governance']

type StepKey = 'company' | 'size' | 'departments' | 'tools' | 'cloud' | 'methodology' | 'goals' | 'review'

const STEPS: { key: StepKey; title: string; subtitle: string }[] = [
  { key: 'company', title: 'Your organization', subtitle: 'Tell us who we are building for' },
  { key: 'size', title: 'Company size', subtitle: 'Helps calibrate benchmarks' },
  { key: 'departments', title: 'Departments', subtitle: 'departmentsSubtitle' },
  { key: 'tools', title: 'Existing tools', subtitle: 'Connect your current stack' },
  { key: 'cloud', title: 'Cloud providers', subtitle: 'Where your workloads run' },
  { key: 'methodology', title: 'Methodology', subtitle: 'How your teams deliver' },
  { key: 'goals', title: 'Transformation goals', subtitle: 'What success looks like' },
  { key: 'review', title: 'Maturity assessment', subtitle: 'Your AI-generated baseline' },
]

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border px-4 py-2.5 text-sm font-medium transition"
      style={{
        borderColor: active ? 'var(--primary)' : 'var(--border-subtle)',
        background: active ? 'color-mix(in srgb, var(--primary) 14%, transparent)' : 'var(--bg-surface)',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        boxShadow: active ? '0 0 24px -10px var(--glow-primary)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useOrganization()
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')
  const [departments, setDepartments] = useState<string[]>([])
  const [tools, setTools] = useState<string[]>([])
  const [cloud, setCloud] = useState<string[]>([])
  const [methodology, setMethodology] = useState('')
  const [goals, setGoals] = useState<string[]>([])

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const maturityScore = useMemo(() => {
    const raw = 38 + tools.length * 3 + cloud.length * 4 + goals.length * 4 + departments.length * 1.5 + (methodology ? 10 : 0)
    return Math.min(99, Math.round(raw))
  }, [tools, cloud, goals, departments, methodology])

  const current = STEPS[step]
  const canNext = (() => {
    switch (current.key) {
      case 'company': return name.trim().length > 1 && industry !== ''
      case 'size': return size !== ''
      case 'departments': return departments.length > 0
      case 'methodology': return methodology !== ''
      default: return true
    }
  })()

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const finish = () => {
    completeOnboarding({ name, industry, size, departments, tools, cloud, methodology, goals, maturityScore })
    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 text-[var(--text-primary)] md:p-8">
      <AmbientBackground />
      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[300px_1fr]">
        {/* Brand / progress rail */}
        <div className="glass-panel-strong glass-elevated hidden flex-col justify-between rounded-3xl p-7 lg:flex">
          <div>
            <LogoFull />
            <p className="mt-2 text-xs text-[var(--text-muted)]">Enterprise setup</p>

            <div className="mt-8 space-y-1">
              {STEPS.map((s, i) => {
                const done = i < step
                const active = i === step
                return (
                  <div key={s.key} className="flex items-center gap-3 py-1.5">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition"
                      style={{
                        background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--bg-surface)',
                        color: done || active ? '#fff' : 'var(--text-muted)',
                        border: done || active ? 'none' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={`text-xs ${active ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                      {s.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              4CHGM tailors your dashboards, AI copilot and benchmarks from this setup.
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="glass-panel-strong flex min-h-[560px] flex-col rounded-3xl p-7 md:p-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              Step {step + 1} / {STEPS.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{current.subtitle === 'departmentsSubtitle' ? t('onboarding.departmentsSubtitle') : current.subtitle}</p>

          <div className="mt-7 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {current.key === 'company' && (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">Company name</label>
                      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 focus-within:border-[var(--primary)]">
                        <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Acme Corporation"
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">Industry</label>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRIES.map((opt) => (
                          <Chip key={opt} label={opt} active={industry === opt} onClick={() => setIndustry(opt)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {current.key === 'size' && (
                  <div className="flex flex-wrap gap-3">
                    {SIZES.map((opt) => (
                      <Chip key={opt} label={`${opt} employees`} active={size === opt} onClick={() => setSize(opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'departments' && (
                  <div className="flex flex-wrap gap-2.5">
                    {DEPARTMENTS.map((opt) => (
                      <Chip key={opt} label={opt} active={departments.includes(opt)} onClick={() => toggle(departments, setDepartments, opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'tools' && (
                  <div className="flex flex-wrap gap-2.5">
                    {TOOLS.map((opt) => (
                      <Chip key={opt} label={opt} active={tools.includes(opt)} onClick={() => toggle(tools, setTools, opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'cloud' && (
                  <div className="flex flex-wrap gap-3">
                    {CLOUDS.map((opt) => (
                      <Chip key={opt} label={opt} active={cloud.includes(opt)} onClick={() => toggle(cloud, setCloud, opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'methodology' && (
                  <div className="flex flex-wrap gap-3">
                    {METHODOLOGIES.map((opt) => (
                      <Chip key={opt} label={opt} active={methodology === opt} onClick={() => setMethodology(opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'goals' && (
                  <div className="flex flex-wrap gap-2.5">
                    {GOALS.map((opt) => (
                      <Chip key={opt} label={opt} active={goals.includes(opt)} onClick={() => toggle(goals, setGoals, opt)} />
                    ))}
                  </div>
                )}

                {current.key === 'review' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
                      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(maturityScore / 100) * 264} 264`}
                          />
                        </svg>
                        <span className="absolute text-xl font-bold">{maturityScore}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Transformation Maturity</p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          Based on your stack, cloud footprint and goals, 4CHGM estimates a strong baseline.
                          The AI copilot will prioritize {goals[0]?.toLowerCase() || 'quick wins'} first.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        ['Organization', name || '—'],
                        ['Industry', industry || '—'],
                        ['Size', size || '—'],
                        ['Methodology', methodology || '—'],
                        ['Tools', `${tools.length} connected`],
                        ['Goals', `${goals.length} selected`],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{k}</p>
                          <p className="mt-1 font-medium text-[var(--text-primary)]">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-0"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {current.key === 'review' ? (
                <>{t('onboarding.launch')} <Rocket className="h-4 w-4" /></>
              ) : (
                <>Continue <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
