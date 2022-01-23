import { Allow, Entity, Field, UuidField, Validators } from "remult";

@Entity("accountManagers", { allowApiCrud: Allow.authenticated })
export class AccountManager {
    @UuidField()
    id?: string;
    @Field({ validate: Validators.required })
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field()
    email: string = '';

}