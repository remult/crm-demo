import { Allow, Entity, Field, IntegerField, UuidField } from "remult";
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
    created_at: Date = new Date();
    @Field(o => o.valueType = Date)
    updated_at: Date = new Date();
    @Field(o => o.valueType = AccountManager)
    accountManager?: AccountManager;
    @Field()
    index: number = 0;
    @Field()
    nb_notes: number = 0;
}

@Entity("dealContacts", {
    allowApiCrud: Allow.authenticated
})
export class DealContacts {
    @UuidField()
    id?: string;
    @Field(o => o.valueType = Deal)
    deal!: Deal;
    @Field(o => o.valueType = Contact)
    contact!: Contact;
}