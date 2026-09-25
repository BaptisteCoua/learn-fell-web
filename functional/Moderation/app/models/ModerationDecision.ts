import { BelongsTo, Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

export type DecisionType = 'ignored' | 'retired' | 'restored'

/**
 * One moderation act; creating it is what ignores, retires or restores a subject.
 */
@Resource('moderation-decisions', { limits: [1, 10, 50, 100] })
export class ModerationDecision extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  subject_id!: number

  @Field()
  subject_title!: string

  @Field()
  decision!: DecisionType

  @Field()
  reason!: string | null

  @Field()
  created_at!: string

  admin = BelongsTo(() => Author, 'admin')
}
