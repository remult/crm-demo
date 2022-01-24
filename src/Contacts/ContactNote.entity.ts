import { Allow, Entity, Field, UuidField } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { Contact } from "./Contact.entity";
import { Status } from "./Status";

@Entity<ContactNote>("contactNote",
    {
        allowApiCrud: Allow.authenticated,
        defaultOrderBy: {
            createdAt: "desc"
        }
    },
    (options, remult) => {
        options.saved = ({ contact }) => Contact.updateLastSeen(remult, contact);
        options.deleted = ({ contact }) => Contact.updateLastSeen(remult, contact);
    })
export class ContactNote {
    @UuidField()
    id?: string;
    @Field(o => o.valueType = Contact)
    contact!: Contact;
    @Field()
    text: string = '';
    @Field(o => o.valueType = AccountManager)
    accountManager!: AccountManager;
    @Field(o => o.valueType = Date)
    createdAt: Date = new Date();
    @Field(o => o.valueType = Status)
    status: Status = Status.cold;
}