import { Entity, Field, UuidField } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { CompanySize } from "./CompanySize";

@Entity("companies", { allowApiCrud: true })
export class Company {
    @UuidField()
    id: string = '';
    @Field()
    name: string = '';
    @Field()
    logo: string = '';
    @Field()
    sector: string = '';
    @Field(o => o.valueType = CompanySize)
    size: CompanySize = CompanySize.s1;
    @Field()
    linkedIn: string = '';
    @Field()
    website: string = '';
    @Field()
    phoneNumber: string = '';
    @Field()
    address: string = '';
    @Field()
    zipcode: string = '';
    @Field()
    city: string = '';
    @Field()
    stateAbbr: string = '';
    @Field(o => o.valueType = AccountManager)
    accountManager!: AccountManager;
    @Field()
    created_at: string = '';
}
