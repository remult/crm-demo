import {
  Allow,
  Entity,
  EntityFilter,
  Field,
  Filter,
  remult,
  Fields,
  getEntityRef,
  Validators
} from 'remult'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Company } from '../Companies/Company.entity'
import { Acquisition } from './Acquisition'
import { ContactNote } from './ContactNote.entity'
import { ContactTag } from './ContactTag.entity'
import { Gender } from './Gender'
import { Status } from './Status'
import { Tag } from './Tag.entity'

@Entity<Contact>('contacts', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: false,
  defaultOrderBy: {
    lastName: 'asc'
  }
})
export class Contact {
  @Fields.uuid()
  id?: string
  @Fields.string({
    validate: Validators.required
  })
  firstName = ''
  @Fields.string({
    validate: Validators.required
  })
  lastName = ''
  @Field(() => Gender)
  gender = Gender.male
  @Fields.string()
  title = ''
  @Field(() => Company)
  company?: Company
  @Fields.string()
  phoneNumber1 = ''
  @Fields.string()
  phoneNumber2 = ''
  @Fields.string()
  background = ''
  @Field(() => Acquisition)
  acquisition = Acquisition.inbound
  @Fields.string()
  email = ''
  @Fields.string()
  avatar? = ''
  @Fields.boolean()
  hasNewsletter: boolean = false
  @Fields.object({
    serverExpression: async (contact) =>
      remult
        .repo(ContactTag)
        .find({ where: { contact } })
        .then((tags) => tags.map((t) => t.tag))
  })
  tags: Tag[] = []
  @Field(() => AccountManager)
  accountManager?: AccountManager
  @Field(() => Status)
  status = Status.cold
  @Fields.date({
    allowApiUpdate: false
  })
  lastSeen = new Date()
  @Fields.date({
    allowApiUpdate: false
  })
  createdAt = new Date()

  @Fields.integer({
    serverExpression: async (contact) =>
      remult.repo(ContactNote).count({ contact })
  })
  nbNotes = 0

  static filterTag = Filter.createCustom<Contact, string>(
    async (remult, tag) => {
      if (!tag) return {}
      const r: EntityFilter<Contact> = {
        id: await remult
          .repo(ContactTag)
          .find({
            where: {
              tag: await remult.repo(Tag).findFirst({ tag })
            },
            load: (ct) => []
          })
          .then((ct) => ct.map((ct) => getEntityRef(ct).fields.contact.getId()))
      }
      return r
    }
  )
  static disableLastSeenUpdate = false
  static async updateLastSeen(contact: Contact) {
    if (Contact.disableLastSeenUpdate) return
    const last = await remult.repo(ContactNote).findFirst(
      {
        contact
      },
      {
        orderBy: {
          createdAt: 'desc'
        }
      }
    )
    contact.lastSeen = last?.createdAt
    await remult.repo(Contact).save(contact)
  }
}
