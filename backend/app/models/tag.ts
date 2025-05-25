// app/models/tag.ts
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Note from '#models/note'

export default class Tag extends BaseModel {
  static table = 'tags'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Note, {
    pivotTable: 'note_tags',
  })
  declare notes: ManyToMany<typeof Note>
}
