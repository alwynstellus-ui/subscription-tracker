export interface EmailContent {
  subject: string
  from: string
  date: string
  body: string
}

export function buildSubscriptionExtractionPrompt(email: EmailContent): string {
  return `You are an expert at identifying and extracting subscription billing information from emails.

Analyze the following email and determine if it contains subscription or billing information.

EMAIL:
---
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Body:
${email.body.slice(0, 3000)}
---

Extract the following fields and return ONLY a valid JSON object (no markdown, no code blocks):

{
  "is_subscription": boolean,          // true if this email is about a subscription/billing
  "service_name": string | null,       // Name of the service/product (e.g. "Netflix", "Slack")
  "company_name": string | null,       // Company providing the service
  "subscribed_date": string | null,    // When subscription started (YYYY-MM-DD format, or null)
  "next_billing_date": string | null,  // Next charge date (YYYY-MM-DD format, or null)
  "cost": number | null,               // Numeric cost amount (e.g. 9.99)
  "currency": string | null,           // 3-letter currency code (e.g. "USD", "EUR")
  "billing_cycle": string | null,      // "monthly", "yearly", "quarterly", "weekly", or "one-time"
  "is_auto_renew": boolean | null,     // Whether auto-renewal is mentioned
  "confidence_score": number           // Your confidence 0.0-1.0 that this is a subscription email
}

Rules:
- Return null for any field you cannot determine with confidence
- For dates use YYYY-MM-DD format only
- Extract cost as a plain number (no currency symbols)
- confidence_score must be between 0.0 and 1.0
- Only set is_subscription to true if there is clear evidence of a recurring subscription or billing
- Return ONLY the JSON object, nothing else`
}
