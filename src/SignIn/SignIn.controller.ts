import { BackendMethod, Controller, Fields, Remult, UserInfo, Validators } from "remult";
import * as jwt from 'jsonwebtoken';
import { AccountManager } from "../AccountManagers/AccountManager.entity";

@Controller("SignIn")
export class SignInController {

    constructor(private remult: Remult) {

    }

    @Fields.string({ validate: Validators.required.withMessage("Required.") })
    username = '';
    @Fields.string({ validate: Validators.required.withMessage("Required.") })
    password = '';
    @BackendMethod({ allowed: true })
    async signIn() {
        const accountManager = await this.remult.repo(AccountManager).findFirst({
            firstName: this.username
        })
        if (!accountManager) {

            throw new Error("Invalid User, Try: " + await SignInController.getValidUserName(this.remult));
        }
        return jwt.sign({
            id: accountManager.id,
            name: accountManager.firstName + ' ' + accountManager.lastName,
            roles: []
        } as UserInfo, getJwtSigningKey());
    }
    @BackendMethod({ allowed: true })
    static async getValidUserName(remult?: Remult) {
        const allUsers = await remult!.repo(AccountManager).find();
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        return randomUser.firstName;
    }

}
export function getJwtSigningKey() {
    if (process.env.NODE_ENV === "production")
        return process.env.TOKEN_SIGN_KEY!;
    return "my secret key";
}
