import { NextResponse } from 'next/server'

export type ContactPayload = {
  name: string
  email: string
  inquiryType: string
  message: string
}

const INQUIRY_TYPES = ['Enterprise Demo', 'Support', 'Partnership', 'Recruitment', 'Technical Question']

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload
    const { name, email, inquiryType, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }
    if (!INQUIRY_TYPES.includes(inquiryType)) {
      return NextResponse.json({ ok: false, error: 'Invalid inquiry type' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    const to = process.env.CONTACT_TO_EMAIL ?? 'mevengueengofranck@gmail.com'

    if (resendKey) {
      // Resend integration — ready for production
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL ?? '4CHGM <onboarding@resend.dev>',
          to: [to],
          subject: `[4CHGM] ${inquiryType} — ${name}`,
          text: `From: ${name} <${email}>\nType: ${inquiryType}\n\n${message}`,
        }),
      })
    } else {
      // Mock fallback — log in dev
      console.info('[4CHGM contact]', { name, email, inquiryType, message: message.slice(0, 200) })
    }

    return NextResponse.json({ ok: true, mock: !resendKey })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
