import { Remult } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { name, internet } from 'faker';

export async function generateDataIfEmpty(remult: Remult) {
    console.log("here");
    const repo = remult.repo(AccountManager);
    if (await repo.count() == 0) {
        for (let index = 0; index < 10; index++) {
            const firstName = name.firstName();
            const lastName = name.lastName();
            await repo.save({
                firstName,
                lastName,
                email: internet.email(firstName, lastName)
            }, true)
        }
    }
}