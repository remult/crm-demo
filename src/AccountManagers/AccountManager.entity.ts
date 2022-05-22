import { Allow, Entity, Fields, Validators } from "remult";

@Entity<AccountManager>("accountManagers", {
    allowApiCrud: Allow.authenticated,
    allowApiDelete: false,
    defaultOrderBy: {
        firstName: "asc",
        lastName: "asc"
    }
})
export class AccountManager {
    @Fields.uuid()
    id?: string;
    @Fields.string({ validate: Validators.required })
    firstName = '';
    @Fields.string()
    lastName = '';
    @Fields.string()
    email = '';
    @Fields.string()
    avatar = '';

}