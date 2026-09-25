import { BelongsTo, Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

export type ReportReason = 'inappropriate' | 'incorrect' | 'spam' | 'copyright' | 'other'

/**
 * A reader's report on a published subject, pending until a moderator decides.
 */
@Resource('reports', { limits: [1, 10, 50, 100] })
export class Report extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  subject_id!: number

  @Field()
  reason!: ReportReason

  @Field()
  comment!: string | null

  @Field()
  status!: 'pending' | 'closed'

  @Field()
  created_at!: string

  subject = BelongsTo(() => Subject, 'subject')
  reporter = BelongsTo(() => Author, 'reporter')
}
