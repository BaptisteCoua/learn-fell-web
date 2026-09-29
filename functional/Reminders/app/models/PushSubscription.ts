import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * A browser that shows the reminders of the account. Its keys stay on the API.
 */
@Resource('push-subscriptions', { limits: [10, 25, 50] })
export class PushSubscription extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  endpoint!: string

  @Field()
  device_label!: string

  @Field()
  last_delivered_at!: string | null

  @Field()
  created_at!: string
}
