import '../styles/globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { OrganizationProvider } from '@/providers/OrganizationProvider'
import { I18nProvider } from '@/i18n/I18nProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import CookieConsent from '@/components/legal/CookieConsent'

export const metadata: Metadata = {
  title: '4CHGM — Managing Change | AI-Powered Change Management Platform',
  description:
    '4CHGM is an AI-powered enterprise operating system for organizational transformation, strategic execution, agile delivery, analytics, and governance.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <OrganizationProvider>
                {children}
                <CookieConsent />
              </OrganizationProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
