import type { PlatformIntelligence } from '@/lib/intelligence'
import { formatCurrency } from '@/types/projects'

export type ExecutiveReport = {
  title: string
  generatedAt: string
  sections: { heading: string; body: string }[]
}

export function generateExecutiveReport(intel: PlatformIntelligence, orgName = 'Organization'): ExecutiveReport {
  const { forecast, risks, roadmap, recommendations, executiveSummary } = intel
  return {
    title: `${orgName} — Executive Transformation Report`,
    generatedAt: new Date().toLocaleString(),
    sections: [
      { heading: 'Executive Summary', body: executiveSummary },
      {
        heading: 'Portfolio Health',
        body: `Average health score: ${forecast.avgHealth}/100. Initiatives at risk: ${forecast.atRiskCount}. Budget committed: ${formatCurrency(forecast.totalSpent)}. Projected total: ${formatCurrency(forecast.projectedTotal)} (${forecast.overrunPct >= 0 ? '+' : ''}${forecast.overrunPct}% vs plan).`,
      },
      {
        heading: 'Risk Overview',
        body: `High: ${risks.high} · Medium: ${risks.medium} · Low: ${risks.low}. Top risks: ${risks.topRisks.map((r) => `${r.name} (${r.score}, ${r.owner})`).join('; ') || 'None identified'}.`,
      },
      {
        heading: 'Roadmap Snapshot',
        body: roadmap.map((r) => `${r.phase}: ${r.count} initiatives, ${r.avgProgress}% avg progress — ${r.initiatives.join(', ')}`).join('\n') || 'No roadmap data.',
      },
      {
        heading: 'AI Recommendations',
        body: recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n'),
      },
      {
        heading: 'Critical Signals',
        body: intel.insights.filter((i) => i.severity === 'high').map((i) => `• ${i.title}: ${i.detail}`).join('\n') || 'No critical signals.',
      },
    ],
  }
}

/** Mock PDF export — downloads formatted text report (PDF architecture ready). */
export function downloadReport(report: ExecutiveReport) {
  const content = [
    report.title,
    `Generated: ${report.generatedAt}`,
    '',
    ...report.sections.flatMap((s) => [`## ${s.heading}`, '', s.body, '']),
    '— 4CHGM — Managing Change',
  ].join('\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `4chgm-executive-report-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
