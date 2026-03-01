import Anthropic from '@anthropic-ai/sdk'
import { buildSubscriptionExtractionPrompt, type EmailContent } from './prompts'
import { parseClaudeResponse, type SubscriptionExtraction } from './extraction-schema'

export class ClaudeSubscriptionParser {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  async extractSubscription(email: EmailContent): Promise<SubscriptionExtraction | null> {
    try {
      const prompt = buildSubscriptionExtractionPrompt(email)

      const message = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') return null

      return parseClaudeResponse(content.text)
    } catch (error) {
      console.error('Claude extraction error:', error)
      return null
    }
  }

  async extractSubscriptionBatch(emails: EmailContent[]): Promise<(SubscriptionExtraction | null)[]> {
    // Process emails with a small delay to avoid rate limits
    const results: (SubscriptionExtraction | null)[] = []
    for (const email of emails) {
      results.push(await this.extractSubscription(email))
      await sleep(200) // 200ms delay between requests
    }
    return results
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
