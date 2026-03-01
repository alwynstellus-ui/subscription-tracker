import { SUBSCRIPTION_KEYWORDS } from '../utils/constants'

export interface EmailMessage {
  id: string
  subject: string
  from: string
  date: string
  body: string
  snippet: string
}

export class MicrosoftClient {
  private accessToken: string
  private baseUrl = 'https://graph.microsoft.com/v1.0'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`Graph API error: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  async getMailFolders() {
    const data = await this.fetch<{ value: any[] }>('/me/mailFolders?$top=50')
    return data.value
  }

  async searchMessages(query: string, skip: number = 0, top: number = 50) {
    const filter = encodeURIComponent(query)
    const data = await this.fetch<{ value: any[]; '@odata.nextLink'?: string }>(
      `/me/messages?$search="${filter}"&$top=${top}&$skip=${skip}&$select=id,subject,from,receivedDateTime,bodyPreview<body`
    )
    return {
      messages: data.value ?? [],
      hasMore: !!data['@odata.nextLink'],
    }
  }

  async getMessage(messageId: string): Promise<EmailMessage | null> {
    try {
      const msg = await this.fetch<any>(
        `/me/messages/${messageId}?$select=id,subject,from,receivedDateTime,body,bodyPreview`
      )

      const body = msg.body?.contentType === 'html'
        ? stripHtml(msg.body.content ?? '')
        : (msg.body?.content ?? '')

      return {
        id: messageId,
        subject: msg.subject ?? '(no subject)',
        from: msg.from?.emailAddress?.address ?? '',
        date: msg.receivedDateTime ?? '',
        body,
        snippet: msg.bodyPreview ?? '',
      }
    } catch {
      return null
    }
  }

  buildSubscriptionQuery(): string {
    return SUBSCRIPTION_KEYWORDS.slice(0, 5).join(' OR ')
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
