'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useProjects } from '@/providers/ProjectsProvider'
import { PHASES, STATUS_META, type Initiative, type InitiativeStatus } from '@/types/projects'

const STATUSES = Object.keys(STATUS_META) as InitiativeStatus[]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]'

export default function InitiativeForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { initiatives, addInitiative } = useProjects()
  const [form, setForm] = useState({
    name: '',
    description: '',
    owner: '',
    status: 'planning' as InitiativeStatus,
    phase: PHASES[0],
    progress: 0,
    budgetPlanned: 500000,
    budgetSpent: 0,
    riskScore: 30,
    impactScore: 60,
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    dependencies: [] as string[],
    tags: '',
  })

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const initiative: Omit<Initiative, 'id'> = {
      name: form.name.trim(),
      description: form.description.trim() || 'No description provided.',
      owner: form.owner.trim() || 'Unassigned',
      status: form.status,
      phase: form.phase,
      progress: Number(form.progress),
      budgetPlanned: Number(form.budgetPlanned),
      budgetSpent: Number(form.budgetSpent),
      riskScore: Number(form.riskScore),
      impactScore: Number(form.impactScore),
      startDate: form.startDate,
      dueDate: form.dueDate || form.startDate,
      dependencies: form.dependencies,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    addInitiative(initiative)
    onClose()
    setForm((f) => ({ ...f, name: '', description: '', owner: '', dependencies: [], tags: '' }))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--bg-overlay)] p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="dropdown-panel max-h-[88vh] w-full max-w-2xl overflow-y-auto scrollbar-hide rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">New Initiative</h2>
                <p className="text-xs text-[var(--text-muted)]">Define scope, budget and risk for portfolio tracking</p>
              </div>
              <button onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 transition hover:bg-[var(--bg-surface-hover)]">
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Field label="Initiative name">
                <input className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Cloud Migration Phase 3" />
              </Field>
              <Field label="Description">
                <textarea className={`${inputClass} h-20 resize-none`} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Goal, scope and expected outcome" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Owner">
                  <input className={inputClass} value={form.owner} onChange={(e) => set({ owner: e.target.value })} placeholder="Lead name" />
                </Field>
                <Field label="Phase">
                  <select className={inputClass} value={form.phase} onChange={(e) => set({ phase: e.target.value })}>
                    {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={inputClass} value={form.status} onChange={(e) => set({ status: e.target.value as InitiativeStatus })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                </Field>
                <Field label={`Progress — ${form.progress}%`}>
                  <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set({ progress: Number(e.target.value) })} className="w-full accent-[var(--primary)]" />
                </Field>
                <Field label="Planned budget ($)">
                  <input type="number" className={inputClass} value={form.budgetPlanned} onChange={(e) => set({ budgetPlanned: Number(e.target.value) })} />
                </Field>
                <Field label="Spent budget ($)">
                  <input type="number" className={inputClass} value={form.budgetSpent} onChange={(e) => set({ budgetSpent: Number(e.target.value) })} />
                </Field>
                <Field label={`Risk score — ${form.riskScore}`}>
                  <input type="range" min={0} max={100} value={form.riskScore} onChange={(e) => set({ riskScore: Number(e.target.value) })} className="w-full accent-[var(--danger)]" />
                </Field>
                <Field label={`Impact score — ${form.impactScore}`}>
                  <input type="range" min={0} max={100} value={form.impactScore} onChange={(e) => set({ impactScore: Number(e.target.value) })} className="w-full accent-[var(--success)]" />
                </Field>
                <Field label="Start date">
                  <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} />
                </Field>
                <Field label="Due date">
                  <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
                </Field>
              </div>

              <Field label="Tags (comma separated)">
                <input className={inputClass} value={form.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="cloud, cost, infrastructure" />
              </Field>

              {initiatives.length > 0 && (
                <Field label="Dependencies">
                  <div className="flex flex-wrap gap-2">
                    {initiatives.map((i) => {
                      const active = form.dependencies.includes(i.id)
                      return (
                        <button
                          type="button"
                          key={i.id}
                          onClick={() => set({ dependencies: active ? form.dependencies.filter((d) => d !== i.id) : [...form.dependencies, i.id] })}
                          className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
                          style={{
                            borderColor: active ? 'var(--primary)' : 'var(--border-subtle)',
                            background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
                            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {i.name}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">
                  Create initiative
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
