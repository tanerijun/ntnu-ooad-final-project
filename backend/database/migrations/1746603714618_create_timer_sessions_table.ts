import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TimerSessions extends BaseSchema {
  protected tableName = 'timer_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // 自增主鍵
      table.integer('user_id').unsigned().notNullable() // 使用者 ID
      table.date('date').notNullable() // 日期
      table.string('subject', 255).notNullable() // 科目
      table.integer('duration').unsigned().notNullable() // 持續時間（以分鐘為單位）

      // 關聯到使用者（假設有 users 表）
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')

      table.timestamps(true, true) // 自動生成 created_at 和 updated_at 欄位
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName) // 刪除資料表
  }
}
