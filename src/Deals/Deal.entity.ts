import { Allow, BackendMethod, Entity, Field, IntegerField, Remult, UuidField } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { Company } from "../Companies/Company.entity";
import { Contact } from "../Contacts/Contact.entity";

@Entity("deals", {
    allowApiCrud: Allow.authenticated
})
export class Deal {
    @UuidField()
    id?: string;
    @Field()
    name: string = '';
    @Field(o => o.valueType = Company)
    company!: Company;
    @Field()
    type: string = '';
    @Field()
    stage: string = '';
    @Field()
    description: string = '';
    @IntegerField()
    amount: number = 0;
    @Field(o => o.valueType = Date)
    createdAt: Date = new Date();
    @Field(o => o.valueType = Date)
    updatedAt: Date = new Date();
    @Field(o => o.valueType = AccountManager)
    accountManager?: AccountManager;
    @Field()
    index: number = 0;

    @BackendMethod({ allowed: Allow.authenticated })
    static async DealDropped(dealId: string, stage: string, onDealId: string | undefined, remult?: Remult) {
        const dealRepo = remult!.repo(Deal);
        const deal = await dealRepo.findId(dealId);
        const origList = await dealRepo.find({ where: { stage: deal.stage }, orderBy: { index: "asc" } });
        let targetList = origList;
        if (deal.stage != stage) {
            targetList = await (await dealRepo.find({ where: { stage }, orderBy: { index: "asc" } })).filter(d => d.id != deal.id);
            deal.stage = stage;
        }
        Deal.organizeLists({ dealId, stage, onDealId, origList, targetList });
        let i = 0;
        for (const deal of targetList) {
            deal.index = i++;
            await dealRepo.save(deal);
        }
        if (targetList != origList) {
            i = 0;
            for (const deal of origList) {
                deal.index = i++;
                await dealRepo.save(deal);
            }
        }

    }
    static organizeLists({ dealId, onDealId, stage, origList, targetList }: { dealId: string, stage: string, onDealId: string | undefined, origList: Deal[], targetList: Deal[] }) {
        if (dealId == onDealId)
            return;
        const deal = origList.find(d => d.id === dealId)!;
        deal.stage = stage;
        const origIndex = origList.findIndex(d => d.id === deal.id);
        origList.splice(origIndex, 1);
        if (!onDealId) {
            targetList.push(deal);
        } else {
            let insertAt = targetList.findIndex(d => d.id == onDealId);
            if (insertAt >= origIndex && origList == targetList)
                insertAt++;
            targetList.splice(insertAt, 0, deal);
        }
    }
}

@Entity("dealContacts", {
    allowApiCrud: Allow.authenticated
})
export class DealContact {
    @UuidField()
    id?: string;
    @Field(o => o.valueType = Deal)
    deal!: Deal;
    @Field(o => o.valueType = Contact)
    contact!: Contact;
}