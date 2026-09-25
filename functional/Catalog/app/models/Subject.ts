import {
  BelongsTo,
  BelongsToMany,
  Field,
  HasMany,
  Key,
  Model,
  Resource,
} from 'laravel-raom-nuxt/runtime'

export type SubjectStatus = 'draft' | 'published' | 'retired'

@Resource('subjects', { limits: [1, 10, 20, 50] })
export class Subject extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  title!: string

  @Field()
  description!: string

  @Field()
  status!: SubjectStatus

  @Field()
  category_id!: number

  @Field()
  author_id!: number

  @Field()
  published_at!: string | null

  @Field()
  retired_reason!: string | null

  @Field()
  retired_at!: string | null

  @Field()
  created_at!: string

  @Field()
  updated_at!: string

  @Field()
  questions_count?: number

  author = BelongsTo(() => Author, 'author')
  category = BelongsTo(() => Category, 'category')
  tags = BelongsToMany(() => Tag, 'tags')
  questions = HasMany(() => Question, 'questions')
}
