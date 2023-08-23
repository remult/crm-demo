import { Allow, Entity, Field, Fields } from 'remult'
import { Contact } from './Contact.entity'
import { Tag } from './Tag.entity'
import { InstanceTypeWithRelations, config } from '../dev-remult/relations'

@Entity('contactTag', {
  allowApiCrud: Allow.authenticated
})
export class ContactTag {
  @Fields.uuid()
  id?: string
  @Fields.string()
  contact = ''
  @Fields.string()
  tag = ''

  static config = config(ContactTag, {
    relations: ({ one }) => ({
      tag2: one(Tag, 'tag')
    })
  })
}

export type ContactTagWithTag = InstanceTypeWithRelations<
  typeof ContactTag,
  {
    tag2: true
  }
>
