import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddTagsToNotes extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.specificType('tags', 'text[]').notNullable().defaultTo('{}')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tags')
    })
  }
}
