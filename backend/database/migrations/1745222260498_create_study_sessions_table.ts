import { BaseSchema } from '@adonisjs/lucid/schema'

export default class StudySessions extends BaseSchema {
  protected tableName = 'study_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('start_time').notNullable()
      table.timestamp('end_time').notNullable()
      table.integer('duration').notNullable() // 秒數
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
