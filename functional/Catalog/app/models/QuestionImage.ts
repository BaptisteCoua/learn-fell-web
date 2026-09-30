import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * An image on the recto of a question. Its files are served at fixed widths by the API
 * (`question-images/{id}/{width}`), so the resource only describes them.
 */
@Resource('question-images', { limits: [1, 10, 25, 50, 100] })
export class QuestionImage extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  question_id!: number | null

  @Field()
  alt!: string | null

  @Field()
  position!: number | null

  @Field()
  width!: number

  @Field()
  height!: number

  @Field()
  variant_widths!: number[]
}
