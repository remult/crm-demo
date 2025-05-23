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
import { ChatMessage } from '../Chat/ChatMessage.entity'
import { llmsChatServer } from '../Chat/ChatMessage.entity.server'

config()
export const entities = [
  AccountManager,
  Company,
  Contact,
  ContactNote,
  ContactTag,
  Deal,
  DealContact,
  Tag,
  ChatMessage
]

export const api = remultExpress({
  getUser: (req) => req.session!['user'],
  dataProvider: async () => {
    if (process.env.NODE_ENV === 'production')
      return createPostgresConnection({
        configuration: 'heroku',
        caseInsensitiveIdentifiers: true
      })
    return undefined
  },
  initApi: () => {
    seed()
    // Initialize the llmsChat implementation
    ChatMessage.llmsChatImplementation = llmsChatServer
  },
  entities,
  admin: true
})
