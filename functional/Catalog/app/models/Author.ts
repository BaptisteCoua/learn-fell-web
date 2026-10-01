import { Field, Key, Model, Resource } from 'laravel-raom-nuxt/runtime'

/**
 * The public face of an account (display name only), as exposed on subjects. The name is null
 * while the account's deletion is pending; once it is erased, the relation itself is null.
 */
@Resource('users')
export class Author extends Model {
  @Key()
  @Field()
  id!: number

  @Field()
  display_name!: string | null
}
