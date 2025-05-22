import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserTaskSetting extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  declare user_id: number

  @column()
  declare subject: string

  @column()
  declare visible: boolean

  @column()
  declare createdAt: Date

  @column()
  declare updatedAt: Date
}
