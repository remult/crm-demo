import { Allow, Entity, Field, Fields } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { CompanySize } from "./CompanySize";

@Entity("companies", { allowApiCrud: Allow.authenticated })
export class Company {
    @Fields.uuid()
    id?: string;
    @Fields.string()
    name = '';
    @Fields.string()
    logo = '';
    @Fields.string()
    sector = '';
    @Field(() => CompanySize)
    size = CompanySize.s1;
    @Fields.string()
    linkedIn = '';
    @Fields.string()
    website = '';
    @Fields.string()
    phoneNumber = '';
    @Fields.string()
    address = '';
    @Fields.string()
    zipcode = '';
    @Fields.string()
    city = '';
    @Fields.string()
    stateAbbr = '';
    @Field(() => AccountManager)
    accountManager!: AccountManager;
    @Fields.date({ allowApiUpdate: false })
    createdAt = new Date();
}
