import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class StudySession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare start_time: Date

  @column()
  declare end_time: Date

  @column()
  declare duration: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
