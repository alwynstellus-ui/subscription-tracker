export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'one-time'
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'expired'
export type EmailProvider = 'google' | 'microsoft'
export type ScanJobStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type SubscriptionSource = 'email' | 'manual'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  preferences: {
    currency: string
    notification_enabled: boolean
    notification_days_before: number
  }
  created_at: string
  updated_at: string
}

export interface ConnectedAccount {
  id: string
  user_id: string
  provider: EmailProvider
  account_email: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  is_active: boolean
  error_message: string | null
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  connected_account_id: string | null
  service_name: string
  company_name: string | null
  description: string | null
  category: string | null
  cost: number
  currency: string
  billing_cycle: BillingCycle
  subscribed_date: string | null
  next_billing_date: string | null
  cancellation_date: string | null
  status: SubscriptionStatus
  is_auto_renew: boolean
  source: SubscriptionSource | null
  email_subject: string | null
  email_body_preview: string | null
  email_date: string | null
  confidence_score: number | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ScanJob {
  id: string
  user_id: string
  connected_account_id: string | null
  provider: EmailProvider
  status: ScanJobStatus
  progress_percentage: number
  total_emails_scanned: number
  emails_with_subscriptions: number
  new_subscriptions_found: number
  emails_processed: number
  error_message: string | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface ProcessedEmail {
  id: string
  user_id: string
  connected_account_id: string
  email_id: string
  provider: EmailProvider
  contains_subscription: boolean | null
  extracted_data: Json | null
  ai_confidence: number | null
  created_at: string
}
