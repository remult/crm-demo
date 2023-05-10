import { Allow, Entity, Field, Fields, isBackend, remult } from 'remult'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Contact } from './Contact.entity'
import { Status } from './Status'

@Entity<ContactNote>('contactNote', {
  allowApiCrud: Allow.authenticated,
  defaultOrderBy: {
    createdAt: 'desc'
  },
  saving: async (contactNote) => {
    if (isBackend()) {
      contactNote.accountManager = await remult
        .repo(AccountManager)
        .findId(remult.user!.id)
    }
  },
  saved: ({ contact }) => Contact.updateLastSeen(contact),
  deleted: ({ contact }) => Contact.updateLastSeen(contact)
})
export class ContactNote {
  @Fields.uuid()
  id?: string
  @Field(() => Contact)
  contact!: Contact
  @Fields.string()
  text = ''
  @Field(() => AccountManager, { allowApiUpdate: false })
  accountManager!: AccountManager
  @Fields.date()
  createdAt = new Date()
  @Field(() => Status)
  status = Status.cold
}
