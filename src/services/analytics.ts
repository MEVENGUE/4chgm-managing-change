export type AnalyticsPoint = {
  month: string
  value: number
}

export type AnalyticsSummary = {
  projectedCost: string
  period: string
  trend: number
  data: AnalyticsPoint[]
}

const MOCK_ANALYTICS: AnalyticsSummary = {
  projectedCost: '$4.32M',
  period: '12 months',
  trend: 8.4,
  data: [
    { month: 'Jan', value: 320 },
    { month: 'Feb', value: 340 },
    { month: 'Mar', value: 355 },
    { month: 'Apr', value: 370 },
    { month: 'May', value: 385 },
    { month: 'Jun', value: 400 },
    { month: 'Jul', value: 410 },
    { month: 'Aug', value: 420 },
    { month: 'Sep', value: 425 },
    { month: 'Oct', value: 430 },
    { month: 'Nov', value: 432 },
    { month: 'Dec', value: 432 },
  ],
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  await delay(250)
  return MOCK_ANALYTICS
}
