import { Field, HasMany, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

@Resource('categories', { limits: [1, 50, 100] })
export class Category extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  name!: string

  @Field()
  position!: number

  @Field()
  subjects_count?: number

  subjects = HasMany(() => Subject, 'subjects')
}
