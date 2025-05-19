// migration/create_tags.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Tags extends BaseSchema {
  protected tableName = 'tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique().notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
