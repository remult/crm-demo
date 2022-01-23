import { BackendMethod, Controller, Field, Remult, UserInfo, Validators } from "remult";
import { getJwtTokenSignKey } from "./AuthService";
import * as jwt from 'jsonwebtoken';
import { AccountManager } from "../AccountManagers/AccountManager.entity";

@Controller("SignIn")
export class SignInController {

    constructor(private remult: Remult) {

    }

    @Field({ validate: Validators.required.withMessage("Required.") })
    username: string = '';
    @Field({ validate: Validators.required.withMessage("Required, try 123") })
    password: string = '';
    @BackendMethod({ allowed: true })
    async signIn() {
        const accountManager = await this.remult.repo(AccountManager).findFirst({
            firstName: { $contains: this.username }
        })
        if (!accountManager) {
            const allUsers = await this.remult.repo(AccountManager).find();
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            throw new Error("Invalid User, Try: " + randomUser.firstName);
        }
        return jwt.sign({
            id: accountManager.id,
            name: accountManager.firstName + ' ' + accountManager.lastName,
            roles: []
        } as UserInfo, getJwtTokenSignKey());
    }

}