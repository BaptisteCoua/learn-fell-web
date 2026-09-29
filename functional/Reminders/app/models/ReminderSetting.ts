import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

export type EmailDisabledReason = 'unsubscribed' | 'bounced'

/**
 * The reminder settings of the signed-in account: one row, created with the account.
 */
@Resource('reminder-settings', { limits: [1] })
export class ReminderSetting extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  email_enabled!: boolean

  @Field()
  send_time!: string

  @Field()
  activated_at!: string | null

  @Field()
  proposal_seen_at!: string | null

  @Field()
  email_disabled_reason!: EmailDisabledReason | null

  @Field()
  next_reminder_at!: string | null

  @Field()
  devices_count!: number
}
