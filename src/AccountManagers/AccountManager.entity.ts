import { Allow, Entity, Field, UuidField, Validators } from "remult";

@Entity<AccountManager>("accountManagers", {
    allowApiCrud: Allow.authenticated,
    defaultOrderBy: {
        firstName: "asc",
        lastName: "asc"
    }
})
export class AccountManager {
    @UuidField()
    id?: string;
    @Field({ validate: Validators.required })
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field()
    email: string = '';
    @Field()
    avatar: string = '';

}