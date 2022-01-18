import { Entity, Field, UuidField } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { Company } from "../Companies/Company.entity";
import { Acquisition } from "./Acquisition";
import { Gender } from "./Gender";
import { Status } from "./Status";
import { Tag } from "./Tags";

@Entity<Contact>("contacts", {
    allowApiCrud: true,
    defaultOrderBy: {
        lastName: "asc"
    }
})
export class Contact {
    @UuidField()
    id?: string;
    @Field()
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field()
    gender: Gender = Gender.male;
    @Field()
    title: string = '';
    @Field(c => c.valueType = Company)
    company?: Company;
    @Field()
    phoneNumber1: string = '';
    @Field()
    phoneNumber2: string = '';
    @Field()
    background: string = '';
    @Field()
    acquisition: Acquisition = Acquisition.inbound;
    @Field()
    email: string = '';
    @Field()
    avatar?: string = '';
    @Field()
    hasNewsletter: boolean = false;
    @Field()
    tags: Tag[] = [];
    @Field(o => o.valueType = AccountManager)
    accountManager?: AccountManager;
    @Field(s => s.valueType = Status)
    status: Status = Status.cold;
    @Field(f => f.valueType = Date)
    lastSeen: Date = new Date();
}