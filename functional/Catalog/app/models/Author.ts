import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * The public face of an account (display name only), as exposed on subjects.
 */
@Resource('users')
export class Author extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  display_name!: string
}
