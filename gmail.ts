import { google } from 'googleapis'
import { SUBSCRIPTION_KEYWORDS } from '../utils/constants'

export interface EmailMessage {
  id: string
  subject: string
  from: string
  date: string
  body: string
  snippet: string
}

export class GmailClient {
  private gmail

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.gmail = google.gmail({ version: 'v1', auth })
  }

  async listLabels() {
    const res = await this.gmail.users.labels.list({ userId: 'me' })
    return res.data.labels ?? []
  }

  async searchMessages(query: string, pageToken?: string, maxResults: number = 50) {
    const res = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      pageToken,
      maxResults,
    })
    return {
      messages: res.data.messages ?? [],
      nextPageToken: res.data.nextPageToken,
      resultSizeEstimate: res.data.resultSizeEstimate ?? 0,
    }
  }

  async getMessage(messageId: string): Promise<EmailMessage | null> {
    try {
      const res = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      const msg = res.data
      const headers = msg.payload?.headers ?? []

      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value ?? '(no subject)'
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value ?? ''
      const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value ?? ''

      const body = extractGmailBody(msg.payload)

      return {
        id: messageId,
        subject,
        from,
        date,
        body,
        snippet: msg.snippet ?? '',
      }
    } catch {
      return null
    }
  }

  buildSubscriptionQuery(): string {
    const keywordQuery = SUBSCRIPTION_KEYWORDS
      .slice(0, 10)
      .map(k => `"${k}"`)
      .join(' OR ')
    return keywordQuery
  }
}

function extractGmailBody(payload: any): string {
  if (!payload) return ''

  // Direct body
  if (payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  // Multipart
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data)
      }
    }
    // Try HTML if no plain text
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return stripHtml(decodeBase64(part.body.data))
      }
      // Nested multipart
      if (part.parts) {
        const nested = extractGmailBody(part)
        if (nested) return nested
      }
    }
  }

  return ''
}

function decodeBase64(data: string): string {
  try {
    return Buffer.from(data, 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
