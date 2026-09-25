import { BelongsTo, Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * One question for one learner: its box and when it comes back.
 */
@Resource('card-progress', { limits: [1, 10, 25, 50, 100] })
export class CardProgress extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  subject_id!: number

  @Field()
  question_id!: number

  @Field()
  box!: number

  @Field()
  next_review_on!: string

  @Field()
  last_answered_at!: string | null

  question = BelongsTo(() => Question, 'question')
  subject = BelongsTo(() => Subject, 'subject')
}
