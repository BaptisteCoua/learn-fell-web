import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

@Resource('tags', { limits: [1, 10, 20] })
export class Tag extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  name!: string
}
