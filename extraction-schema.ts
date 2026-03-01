import { z } from 'zod'

export const SubscriptionExtractionSchema = z.object({
  is_subscription: z.boolean(),
  service_name: z.string().min(1).nullable(),
  company_name: z.string().min(1).nullable(),
  subscribed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  next_billing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  cost: z.number().nonnegative().nullable(),
  currency: z.string().length(3).toUpperCase().nullable(),
  billing_cycle: z.enum(['monthly', 'yearly', 'quarterly', 'weekly', 'one-time']).nullable(),
  is_auto_renew: z.boolean().nullable(),
  confidence_score: z.number().min(0).max(1),
})

export type SubscriptionExtraction = z.infer<typeof SubscriptionExtractionSchema>

export function parseClaudeResponse(text: string): SubscriptionExtraction | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    
    const parsed = JSON.parse(jsonMatch[0])
    return SubscriptionExtractionSchema.parse(parsed)
  } catch {
    return null
  }
}
