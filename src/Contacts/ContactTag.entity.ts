import { Allow, Entity, Field, Fields, Relations } from 'remult'
import { Contact } from './Contact.entity'
import { Tag } from './Tag.entity'

@Entity<ContactTag>('contactTag', {
  allowApiCrud: Allow.authenticated,
  id: { contactId: true, tag: true }
})
export class ContactTag {
  @Fields.string({ dbName: 'contact' })
  contactId = ''
  @Relations.toOne<ContactTag, Contact>(() => Contact, 'contactId')
  contact!: Contact

  @Relations.toOne(() => Tag, {
    defaultIncluded: true
  })
  tag!: Tag
}
