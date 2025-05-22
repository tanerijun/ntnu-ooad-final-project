import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TimerSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare date: string

  @column()
  declare subject: string

  @column()
  declare duration: number

  @column()
  declare createdAt: Date

  @column()
  declare updatedAt: Date
}
