import { Allow, Entity, Field, Fields } from "remult";
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
    @Fields.uuid()
    id?: string;
    @Field(() => Contact)
    contact!: Contact;
    @Fields.string()
    text = '';
    @Field(() => AccountManager)
    accountManager!: AccountManager;
    @Fields.date()
    createdAt = new Date();
    @Field(() => Status)
    status = Status.cold;
}