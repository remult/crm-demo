import { Allow, BackendMethod, Entity, Field, Fields, remult } from 'remult'
import { AccountManager } from '../AccountManagers/AccountManager.entity'
import { Company } from '../Companies/Company.entity'
import { Contact } from '../Contacts/Contact.entity'
import { config } from '../dev-remult/relations'

@Entity('deals', {
  allowApiCrud: Allow.authenticated
})
export class Deal {
  @Fields.uuid()
  id?: string
  @Fields.string()
  name = ''
  @Fields.string()
  company = ''
  @Fields.string()
  type = ''
  @Fields.string()
  stage = ''
  @Fields.string()
  description = ''
  @Fields.integer()
  amount = 0
  @Fields.date()
  createdAt = new Date()
  @Fields.date()
  updatedAt = new Date()
  @Fields.string()
  accountManager = ''
  @Fields.integer()
  index = 0

  static config = config(Deal, {
    relations: ({ one, many }) => ({
      company2: one(Company, 'company'),
      accountManager2: one(AccountManager, 'accountManager'),
      dealContacts: many(DealContact, 'deal')
    })
  })

  @BackendMethod({ allowed: Allow.authenticated })
  static async DealDropped(
    dealId: string,
    stage: string,
    onDealId: string | undefined
  ) {
    const dealRepo = remult!.repo(Deal)
    const deal = await dealRepo.findId(dealId)
    const origList = await dealRepo.find({
      where: { stage: deal.stage },
      orderBy: { index: 'asc' }
    })
    let targetList = origList
    if (deal.stage !== stage) {
      targetList = await (
        await dealRepo.find({ where: { stage }, orderBy: { index: 'asc' } })
      ).filter((d) => d.id !== deal.id)
      deal.stage = stage
    }
    Deal.organizeLists({ dealId, stage, onDealId, origList, targetList })
    let i = 0
    for (const deal of targetList) {
      deal.index = i++
      await dealRepo.save(deal)
    }
    if (targetList !== origList) {
      i = 0
      for (const deal of origList) {
        deal.index = i++
        await dealRepo.save(deal)
      }
    }
  }
  static organizeLists({
    dealId,
    onDealId,
    stage,
    origList,
    targetList
  }: {
    dealId: string
    stage: string
    onDealId: string | undefined
    origList: Deal[]
    targetList: Deal[]
  }) {
    if (dealId === onDealId) return
    const deal = origList.find((d) => d.id === dealId)!
    deal.stage = stage
    const origIndex = origList.findIndex((d) => d.id === deal.id)
    origList.splice(origIndex, 1)
    if (!onDealId) {
      targetList.push(deal)
    } else {
      let insertAt = targetList.findIndex((d) => d.id === onDealId)
      if (insertAt >= origIndex && origList === targetList) insertAt++
      targetList.splice(insertAt, 0, deal)
    }
  }
  @BackendMethod({ allowed: Allow.authenticated })
  async saveWithContacts?(contacts: string[]) {
    const isNew = !this.id
    const dealContactRepo = remult!.repo(DealContact)
    const deal = await remult!.repo(Deal).save(this)
    const existingContacts = isNew
      ? []
      : await dealContactRepo.find({ where: { deal: deal.id } })
    const contactsToDelete = existingContacts.filter(
      (c) => !contacts.includes(c.id!)
    )
    const contactsToAdd = contacts.filter(
      (c) => !existingContacts.find((ec) => ec.id === c)
    )
    await Promise.all(contactsToDelete.map((dc) => dealContactRepo.delete(dc)))
    await dealContactRepo.insert(
      contactsToAdd.map((ac) => ({ deal: deal.id, contact: ac }))
    )
  }
}

@Entity('dealContacts', {
  allowApiCrud: Allow.authenticated
})
export class DealContact {
  @Fields.uuid()
  id?: string
  @Fields.string()
  deal = ''
  @Fields.string()
  contact = ''

  static config = config(DealContact, {
    relations: ({ one }) => ({ contact2: one(Contact, 'contact') })
  })
}
