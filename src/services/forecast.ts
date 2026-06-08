import type { AnalyticsPoint } from './analytics'

export type ForecastData = {
  projectedTotal: string
  confidence: number
  savingsOpportunity: string
  points: AnalyticsPoint[]
}

const MOCK_FORECAST: ForecastData = {
  projectedTotal: '$4.32M',
  confidence: 87,
  savingsOpportunity: '$680K',
  points: [
    { month: 'Q1', value: 1015 },
    { month: 'Q2', value: 1080 },
    { month: 'Q3', value: 1120 },
    { month: 'Q4', value: 1105 },
  ],
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchCostForecast(): Promise<ForecastData> {
  await delay(250)
  return MOCK_FORECAST
}
