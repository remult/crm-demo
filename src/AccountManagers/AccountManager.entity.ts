import { Entity, Field, UuidField } from "remult";

@Entity("accountManagers", { allowApiCrud: true })
export class AccountManager {
    @UuidField()
    id: string = '';
    @Field()
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field()
    email: string = '';

}