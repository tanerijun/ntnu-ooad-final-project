// migration 檔案內容
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UserTaskSettings extends BaseSchema {
  protected tableName = 'user_task_settings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('subject', 255).notNullable()
      table.boolean('visible').notNullable().defaultTo(true)
      table.timestamps(true, true)

      // 唯一組合鍵避免重複
      table.unique(['user_id', 'subject'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
