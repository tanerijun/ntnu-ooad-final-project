import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Reminder extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  declare user_id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare reminder_time: Date

  @column()
  declare is_completed: boolean

  @column()
  declare is_notified: boolean

  @column()
  declare created_at: Date

  @column()
  declare updated_at: Date

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
