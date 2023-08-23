import { Allow, Entity, Field, Fields } from 'remult'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { CompanySize } from './CompanySize'
import { InstanceTypeWithRelations, config } from '../dev-remult/relations'
import { Contact } from '../Contacts/Contact.entity'
import { Deal } from '../Deals/Deal.entity'

@Entity('companies', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: false
})
export class Company {
  @Fields.uuid()
  id?: string
  @Fields.string()
  name = ''
  @Fields.string()
  logo = ''
  @Fields.string()
  sector = ''
  @Field(() => CompanySize)
  size = CompanySize.s1
  @Fields.string()
  linkedIn = ''
  @Fields.string()
  website = ''
  @Fields.string()
  phoneNumber = ''
  @Fields.string()
  address = ''
  @Fields.string()
  zipcode = ''
  @Fields.string()
  city = ''
  @Fields.string()
  stateAbbr = ''
  @Fields.string()
  accountManager = ''
  @Fields.date({ allowApiUpdate: false })
  createdAt = new Date()

  static config = config(Company, {
    relations: ({ one, many }) => ({
      accountManager2: one(AccountManager, 'accountManager'),
      contacts: many(Contact, 'company'),
      deals: many(Deal, 'company')
    })
  })
}
