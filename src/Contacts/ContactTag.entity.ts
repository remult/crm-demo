import { Allow, Entity, Field, Fields } from 'remult'
import { Contact } from './Contact.entity'
import { Tag } from './Tag.entity'

@Entity<ContactTag>('contactTag', {
  allowApiCrud: Allow.authenticated,
  id: { contactId: true, tag: true }
})
export class ContactTag {
  @Fields.string({ dbName: 'contact' })
  contactId = ''
  @Fields.one<ContactTag, Contact>(() => Contact, 'contactId')
  contact!: Contact

  @Fields.reference(() => Tag, {
    defaultIncluded: true
  })
  tag!: Tag
}
