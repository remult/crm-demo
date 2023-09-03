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
import {
  InstanceFromWith,
  InstanceTypeWithRelations,
  OneToMany,
  OneToManyField,
  config,
  specialRepo
} from '../dev-remult/relations'

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
  @Fields.string()
  company = ''
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

  @Fields.string()
  accountManager = ''
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

  @OneToManyField(Contact, () => ContactTag, 'contact')
  tags3: OneToMany<typeof ContactTag> = []

  static config = config(Contact, {
    relations: ({ many, one }) => ({
      tags2: many(ContactTag, 'contact'),
      company2: one(Company, 'company'),
      accountManager2: one(AccountManager, 'accountManager'),
      notes: many(ContactNote, 'contact')
    })
  })

  static filterTag = Filter.createCustom<Contact, string>(async (tag) => {
    if (!tag) return {}
    const r: EntityFilter<Contact> = {
      id: await remult
        .repo(ContactTag)
        .find({
          where: {
            tag: (await remult.repo(Tag).findFirst({ tag })).id
          },
          load: (ct) => []
        })
        .then((ct) => ct.map((ct) => ct.contact))
    }
    return r
  })
  static disableLastSeenUpdate = false
  static async updateLastSeen(contactId: string) {
    if (Contact.disableLastSeenUpdate) return
    const last = await remult.repo(ContactNote).findFirst(
      {
        contact: contactId
      },
      {
        orderBy: {
          createdAt: 'desc'
        }
      }
    )
    const contact = await remult.repo(Contact).findId(contactId)
    contact.lastSeen = last?.createdAt
    await remult.repo(Contact).save(contact)
  }
}

export type ContactWithTags = InstanceTypeWithRelations<
  typeof Contact,
  {
    tags2: {
      with: {
        //[ ] - consider adding one to many type with load etc...
        //[ ] - consider creating a shared definition between the with and the with type

        //[ ] - allows any value - I want it to give an error when it is not a relation
        //[ ] - what happens with an outer join relation where the related value not necessary exists
        //[ ] - remix shows the actual fields and not the types and their names
        //[ ] - consider the find options that are relevant for one (not many)
        //[ ] - server expression fields should also be optional (I think) as they can be expensive
        //[ ] - consider lazy default to true
        //[ ] - consider when lazy is true, to return an object with only id.

        tag2: true
      }
    }
    company2: true
  }
>

specialRepo(Contact)
  .find({
    with: {
      company2: true
    }
  })
  .then((y) => {})

let x = specialRepo(Contact).buildWith({
  with: {
    company2: true
  }
})
let y: InstanceFromWith<typeof x>
