'use client'

import { useState } from 'react'
import { Settings, Sun, Moon, Check, User, Shield, Bell } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'
import { updateProfile } from '@/services/user/userService'
import { loadPreferences, savePreferences } from '@/services/preferences/preferencesService'

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="relative h-6 w-11 shrink-0 rounded-full transition" style={{ background: on ? 'var(--primary)' : 'var(--bg-surface-strong)' }} aria-pressed={on}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: on ? '22px' : '2px' }} />
    </button>
  )
}

const TABS = [
  { id: 'profile', icon: User, key: 'settings.profile' },
  { id: 'security', icon: Shield, key: 'settings.security' },
  { id: 'appearance', icon: Sun, key: 'settings.appearance' },
  { id: 'notifications', icon: Bell, key: 'settings.notifications' },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, refresh } = useAuth()
  const { t } = useTranslation()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('profile')
  const [prefs, setPrefs] = useState(() => loadPreferences())
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    phone: user?.phone ?? '',
    timezone: user?.timezone ?? 'UTC',
    department: user?.department ?? '',
    bio: user?.bio ?? '',
    company: user?.company ?? '',
    role: user?.role ?? '',
  })

  function updatePref<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    const next = savePreferences({ [key]: value })
    setPrefs(next)
  }

  function saveProfile() {
    updateProfile(profile)
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Settings} title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, icon: Icon, key }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition"
            style={{
              borderColor: tab === id ? 'var(--primary)' : 'var(--border-subtle)',
              background: tab === id ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
              color: tab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(key)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <MotionCard delay={0.05}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">{t('settings.profile')}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/25 to-[var(--secondary)]/25 text-xl font-bold text-[var(--text-primary)]">
                {profile.firstName[0] || 'U'}
              </div>
              <button className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)]">
                {t('settings.profileImage')}
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { k: 'firstName', l: t('auth.firstName') },
                { k: 'lastName', l: t('auth.lastName') },
                { k: 'username', l: t('auth.username') },
                { k: 'phone', l: t('settings.phone') },
                { k: 'timezone', l: t('settings.timezone') },
                { k: 'department', l: t('settings.department') },
                { k: 'company', l: t('auth.company') },
                { k: 'role', l: t('auth.role') },
              ].map(({ k, l }) => (
                <div key={k}>
                  <label className="text-xs text-[var(--text-muted)]">{l}</label>
                  <input
                    value={profile[k as keyof typeof profile]}
                    onChange={(e) => setProfile((s) => ({ ...s, [k]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-[var(--text-muted)]">{t('settings.bio')}</label>
              <textarea value={profile.bio} onChange={(e) => setProfile((s) => ({ ...s, bio: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]" />
            </div>
            <button onClick={saveProfile} className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">{t('common.save')}</button>
          </div>
        </MotionCard>
      )}

      {tab === 'security' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <MotionCard delay={0.05}>
            <div className="glass-panel-strong rounded-3xl p-6">
              <p className="section-title">{t('settings.changePassword')}</p>
              <div className="mt-4 space-y-3">
                <input placeholder={t('settings.currentPassword')} className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
                <input placeholder={t('settings.newPassword')} type="password" className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
          </MotionCard>
          <MotionCard delay={0.1}>
            <div className="glass-panel-strong rounded-3xl p-6">
              <p className="section-title">{t('settings.twoFactor')}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{t('settings.twoFactorDesc')}</p>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)]">{t('settings.activeSessions')}</p>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs text-[var(--text-muted)]">Chrome · Windows · Active now</div>
              </div>
            </div>
          </MotionCard>
        </section>
      )}

      {tab === 'appearance' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <MotionCard delay={0.05}>
            <div className="glass-panel-strong rounded-3xl p-6">
              <p className="section-title">{t('settings.appearance')}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(['dark', 'light'] as const).map((th) => (
                  <button key={th} onClick={() => setTheme(th)} className="relative flex items-center gap-3 rounded-2xl border p-4 text-left transition" style={{ borderColor: theme === th ? 'var(--primary)' : 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    {th === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <span className="text-sm font-medium capitalize">{t(`settings.${th}`)}</span>
                    {theme === th && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)]"><Check className="h-3 w-3 text-white" /></span>}
                  </button>
                ))}
              </div>
            </div>
          </MotionCard>
          <MotionCard delay={0.1}>
            <div className="glass-panel-strong rounded-3xl p-6">
              <p className="section-title">{t('settings.preferences')}</p>
              <div className="mt-4 space-y-1">
                {[
                  { key: 'animations' as const, label: t('settings.ambientMotion'), detail: t('settings.ambientMotionDesc') },
                  { key: 'density' as const, label: t('settings.density'), detail: t('settings.compactModeDesc'), toggle: prefs.density === 'compact', onToggle: (v: boolean) => updatePref('density', v ? 'compact' : 'comfortable') },
                ].map((p) => (
                  <div key={p.key} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-[var(--bg-surface)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{p.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{p.detail}</p>
                    </div>
                    <Toggle on={p.key === 'animations' ? prefs.animations : (p.toggle ?? false)} onChange={p.onToggle ?? ((v) => updatePref('animations', v))} />
                  </div>
                ))}
              </div>
            </div>
          </MotionCard>
        </section>
      )}

      {tab === 'notifications' && (
        <MotionCard delay={0.05}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">{t('settings.notifications')}</p>
            <div className="mt-4 space-y-1">
              {([
                ['email', 'settings.emailNotif'],
                ['aiInsights', 'settings.aiInsights'],
                ['projectAlerts', 'settings.projectAlerts'],
                ['riskAlerts', 'settings.riskAlerts'],
                ['weeklyReports', 'settings.weeklyReports'],
                ['pipelineAlerts', 'settings.pipelineAlerts'],
              ] as const).map(([key, labelKey]) => (
                <div key={key} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-[var(--bg-surface)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t(labelKey)}</p>
                  <Toggle
                    on={prefs.notifications[key]}
                    onChange={(v) => updatePref('notifications', { ...prefs.notifications, [key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        </MotionCard>
      )}
    </div>
  )
}
