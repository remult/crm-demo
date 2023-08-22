import { Allow, Entity, Field, Fields } from 'remult'
import { Contact } from './Contact.entity'
import { Tag } from './Tag.entity'
import { config } from '../dev-remult/relations'

@Entity('contactTag', {
  allowApiCrud: Allow.authenticated
})
export class ContactTag {
  @Fields.uuid()
  id?: string
  @Field(() => Contact, { lazy: true })
  contact!: Contact
  @Field(() => Tag)
  tag!: Tag

  static config = config(ContactTag, {
    relations: ({ one }) => ({
      tag2: one(Tag, 'contact')
    })
  })
}
