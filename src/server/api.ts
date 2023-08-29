import { remultExpress } from 'remult/remult-express'
import { createPostgresConnection } from 'remult/postgres'
import { seed } from './seed'
import { config } from 'dotenv'
import { Deal, DealContact } from '../Deals/Deal.entity'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Company } from '../Companies/Company.entity'
import { Contact } from '../Contacts/Contact.entity'
import { ContactTag } from '../Contacts/ContactTag.entity'
import { ContactNote } from '../Contacts/ContactNote.entity'
import { Tag } from '../Contacts/Tag.entity'
import { InstanceTypeWithRelations, specialRepo } from '../dev-remult/relations'

config()

export const api = remultExpress({
  getUser: (req) => req.session!['user'],
  dataProvider: async () => {
    if (process.env.NODE_ENV === 'production')
      return createPostgresConnection({ configuration: 'heroku' })
    return undefined
  },
  initApi: async () => {
    await seed()
    const repo = specialRepo(Contact)
    const c = await repo.find({
      limit: 2,

      with: {
        tags2: true
      }
    })
    PrintContact(c[0])
  },
  entities: [
    AccountManager,
    Company,
    Contact,
    ContactNote,
    Tag,
    ContactTag,
    DealContact,
    Deal
  ]
})



export function PrintContact(
  contact: InstanceTypeWithRelations<
    typeof Contact,
    {
      tags2: true
    }
  >
) {
  console.log(contact)
  console.log(contact)
}
