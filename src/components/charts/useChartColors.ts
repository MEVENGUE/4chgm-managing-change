'use client'

import { useTheme } from '@/providers/ThemeProvider'

export type ChartColors = {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string
  grid: string
  axis: string
  text: string
}

const DARK: ChartColors = {
  primary: '#7c5cff',
  secondary: '#00d4ff',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  grid: 'rgba(255,255,255,0.05)',
  axis: 'rgba(255,255,255,0.10)',
  text: '#7d86b2',
}

const LIGHT: ChartColors = {
  primary: '#8b5cf6',
  secondary: '#a855f7',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  grid: 'rgba(15,23,42,0.06)',
  axis: 'rgba(15,23,42,0.10)',
  text: '#8b95a7',
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme()
  return theme === 'light' ? LIGHT : DARK
}
