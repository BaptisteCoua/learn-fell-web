import { BelongsTo, Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

@Resource('questions', { limits: [1, 10, 25, 50, 100] })
export class Question extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  subject_id!: number

  @Field()
  recto_html!: string

  @Field()
  verso_html!: string

  @Field()
  position!: number

  subject = BelongsTo(() => Subject, 'subject')
}
