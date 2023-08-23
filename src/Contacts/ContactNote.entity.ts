import { Allow, Entity, Field, Fields, isBackend, remult } from 'remult'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Contact } from './Contact.entity'
import { Status } from './Status'
import { config } from '../dev-remult/relations'

@Entity<ContactNote>('contactNote', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: {
    createdAt: 'desc'
  },
  saving: async (contactNote) => {
    if (isBackend()) {
      contactNote.accountManager = remult.user!.id
    }
  },
  saved: ({ contact }) => Contact.updateLastSeen(contact),
  deleted: ({ contact }) => Contact.updateLastSeen(contact)
})
export class ContactNote {
  @Fields.uuid()
  id?: string
  @Fields.string()
  contact = ''
  @Fields.string()
  text = ''
  @Fields.string({ allowApiUpdate: false })
  accountManager = ''
  @Fields.date()
  createdAt = new Date()
  @Field(() => Status)
  status = Status.cold

  static config = config(ContactNote, {
    relations: ({ one }) => ({
      accountManager2: one(AccountManager, 'accountManager')
    })
  })
}
