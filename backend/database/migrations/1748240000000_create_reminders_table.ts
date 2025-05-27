import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateRemindersTable extends BaseSchema {
  protected tableName = 'reminders'

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
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.timestamp('reminder_time').notNullable()
      table.boolean('is_completed').notNullable().defaultTo(false)
      table.boolean('is_notified').notNullable().defaultTo(false)
      table.timestamps(true, true)

      table.index(['user_id', 'reminder_time'])
      table.index(['user_id', 'is_completed'])
      table.index(['reminder_time', 'is_notified', 'is_completed'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
