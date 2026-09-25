import { BelongsTo, Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * A subject the account learns, with its cards counted by the API.
 */
@Resource('learnings', { limits: [1, 10, 25, 50] })
export class Learning extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  subject_id!: number

  @Field()
  created_at!: string

  @Field()
  due_today_count!: number

  @Field()
  box_1_count!: number

  @Field()
  box_2_count!: number

  @Field()
  box_3_count!: number

  @Field()
  box_4_count!: number

  @Field()
  box_5_count!: number

  @Field()
  next_review_on!: string | null

  subject = BelongsTo(() => Subject, 'subject')
}
