// database/migrations/create_note_tags.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class NoteTags extends BaseSchema {
  protected tableName = 'note_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('note_id').unsigned().references('id').inTable('notes').onDelete('CASCADE')

      table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE')

      table.unique(['note_id', 'tag_id']) // prevent duplicates
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
