import { Entity, Field, UuidField, Validators } from "remult";

@Entity("accountManagers", { allowApiCrud: true })
export class AccountManager {
    @UuidField()
    id: string = '';
    @Field({ validate: Validators.required })
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field()
    email: string = '';

}