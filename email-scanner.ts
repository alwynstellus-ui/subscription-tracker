import { createServiceClient } from '../supabase/server'
import { GmailClient } from './gmail'
import { MicrosoftClient } from './microsoft'
import { ClaudeSubscriptionParser } from '../ai/claude'
import { CONFIDENCE_THRESHOLD } from '../utils/constants'
import { decrypt } from '../utils/encryption'
import type { ConnectedAccount, ScanJob } from '@/types/database'

export interface ScanProgress {
  jobId: string
  status: string
  progressPercentage: number
  emailsProcessed: number
  totalEmails: number
  newSubscriptionsFound: number
}

export class EmailScanner {
  private parser = new ClaudeSubscriptionParser()

  async startScan(userId: string, connectedAccountId: string): Promise<string> {
    const supabase = createServiceClient()

    // Get connected account
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', connectedAccountId)
      .eq('user_id', userId)
      .single()

    if (!account) throw new Error('Connected account not found')

    // Create scan job
    const { data: job } = await supabase
      .from('scan_jobs')
      .insert({
        user_id: userId,
        connected_account_id: connectedAccountId,
        provider: account.provider,
        status: 'in_progress',
      })
      .select()
      .single()

    if (!job) throw new Error('Failed to create scan job')

    // Run scan asynchronously (fire and forget)
    this.runScan(userId, account as ConnectedAccount, job as ScanJob).catch(console.error)

    return job.id
  }

  private async runScan(userId: string, account: ConnectedAccount, job: ScanJob) {
    const supabase = createServiceClient()

    try {
      const accessToken = decrypt(account.access_token)
      let emailsProcessed = 0
      let newSubscriptions = 0

      if (account.provider === 'google') {
        const gmail = new GmailClient(accessToken)
        const query = gmail.buildSubscriptionQuery()

        let pageToken: string | undefined
        const BATCH_SIZE = 20
        let estimated = 200 // initial estimate

        do {
          const { messages, nextPageToken, resultSizeEstimate } = await gmail.searchMessages(
            query, pageToken, BATCH_SIZE
          )
          estimated = resultSizeEstimate || estimated
          pageToken = nextPageToken ?? undefined

          for (const msg of messages) {
            const email = await gmail.getMessage(msg.id!)
            if (!email) continue

            // Skip already processed
            const { data: existing } = await supabase
              .from('processed_emails')
              .select('id')
              .eq('user_id', userId)
              .eq('provider', 'google')
              .eq('email_id', msg.id!)
              .single()

            if (existing) { emailsProcessed++; continue }

            // Extract with Claude
            const extraction = await this.parser.extractSubscription({
              subject: email.subject,
              from: email.from,
              date: email.date,
              body: email.body || email.snippet,
            })

            // Save processed email record
            await supabase.from('processed_emails').insert({
              user_id: userId,
              connected_account_id: account.id,
              email_id: msg.id!,
              provider: 'google',
              contains_subscription: extraction?.is_subscription ?? false,
              extracted_data: extraction as any,
              ai_confidence: extraction?.confidence_score ?? null,
            })

            // Save subscription if confident enough
            if (extraction?.is_subscription && extraction.confidence_score >= CONFIDENCE_THRESHOLD && extraction.service_name) {
              await supabase.from('subscriptions').upsert({
                user_id: userId,
                connected_account_id: account.id,
                service_name: extraction.service_name,
                company_name: extraction.company_name,
                cost: extraction.cost ?? 0,
                currency: extraction.currency ?? 'USD',
                billing_cycle: extraction.billing_cycle ?? 'monthly',
                subscribed_date: extraction.subscribed_date,
                next_billing_date: extraction.next_billing_date,
                is_auto_renew: extraction.is_auto_renew ?? true,
                status: 'active',
                source: 'email',
                email_subject: email.subject,
                email_body_preview: email.snippet?.slice(0, 500),
                email_date: email.date ? new Date(email.date).toISOString() : null,
                confidence_score: extraction.confidence_score,
              }, {
                onConflict: 'user_id,service_name,next_billing_date',
                ignoreDuplicates: true,
              })
              newSubscriptions++
            }

            emailsProcessed++

            // Update progress
            const progress = Math.min(Math.round((emailsProcessed / estimated) * 100), 95)
            await supabase
              .from('scan_jobs')
              .update({
                progress_percentage: progress,
                emails_processed: emailsProcessed,
                new_subscriptions_found: newSubscriptions,
              })
              .eq('id', job.id)
          }
        } while (pageToken)

      } else if (account.provider === 'microsoft') {
        const graph = new MicrosoftClient(accessToken)
        const query = graph.buildSubscriptionQuery()
        let skip = 0
        let hasMore = true

        while (hasMore) {
          const { messages, hasMore: more } = await graph.searchMessages(query, skip, 20)
          hasMore = more
          skip += messages.length

          for (const msg of messages) {
            const email = await graph.getMessage(msg.id)
            if (!email) continue

            const { data: existing } = await supabase
              .from('processed_emails')
              .select('id')
              .eq('user_id', userId)
              .eq('provider', 'microsoft')
              .eq('email_id', msg.id)
              .single()

            if (existing) { emailsProcessed++; continue }

            const extraction = await this.parser.extractSubscription({
              subject: email.subject,
              from: email.from,
              date: email.date,
              body: email.body || email.snippet,
            })

            await supabase.from('processed_emails').insert({
              user_id: userId,
              connected_account_id: account.id,
              email_id: msg.id,
              provider: 'microsoft',
              contains_subscription: extraction?.is_subscription ?? false,
              extracted_data: extraction as any,
              ai_confidence: extraction?.confidence_score ?? null,
            })

            if (extraction?.is_subscription && extraction.confidence_score >= CONFIDENCE_THRESHOLD && extraction.service_name) {
              await supabase.from('subscriptions').upsert({
                user_id: userId,
                connected_account_id: account.id,
                service_name: extraction.service_name,
                company_name: extraction.company_name,
                cost: extraction.cost ?? 0,
                currency: extraction.currency ?? 'USD',
                billing_cycle: extraction.billing_cycle ?? 'monthly',
                subscribed_date: extraction.subscribed_date,
                next_billing_date: extraction.next_billing_date,
                is_auto_renew: extraction.is_auto_renew ?? true,
                status: 'active',
                source: 'email',
                email_subject: email.subject,
                email_body_preview: email.snippet?.slice(0, 500),
                email_date: email.date ? new Date(email.date).toISOString() : null,
                confidence_score: extraction.confidence_score,
              }, {
                onConflict: 'user_id,service_name,next_billing_date',
                ignoreDuplicates: true,
              })
              newSubscriptions++
            }

            emailsProcessed++
          }
        }
      }

      // Mark complete
      await supabase
        .from('scan_jobs')
        .update({
          status: 'completed',
          progress_percentage: 100,
          emails_processed: emailsProcessed,
          total_emails_scanned: emailsProcessed,
          new_subscriptions_found: newSubscriptions,
          emails_with_subscriptions: newSubscriptions,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      // Update last sync
      await supabase
        .from('connected_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', account.id)

    } catch (error: any) {
      await supabase
        .from('scan_jobs')
        .update({
          status: 'failed',
          error_message: error?.message ?? 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)
    }
  }
}
