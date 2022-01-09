import { Remult } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { name, internet, random, address, company, datatype, phone } from 'faker';
import { Company } from "../Companies/Company.entity";
import { sectors } from "../Companies/Sectors";
import { CompanySize } from "../Companies/CompanySize";

export async function generateDataIfEmpty(remult: Remult) {
    {
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
    {
        const repo = remult.repo(Company);
        const accountManagers = await remult.repo(AccountManager).find();
        if (await repo.count() == 0) {
            for (let index = 0; index < 100; index++) {
                const name = company.companyName();
                await repo.save({
                    accountManager: random.arrayElement(accountManagers),
                    address: address.streetAddress(),
                    city: address.city(),
                    linkedIn: `https://www.linkedin.com/company/${name
                        .toLowerCase()
                        .replace(/\W+/, '_')}`,
                    logo: `https://picsum.photos/id/${datatype.number(1000)}/200/200`,
                    name,
                    phoneNumber: phone.phoneNumber(),
                    sector: random.arrayElement(sectors),
                    size: random.arrayElement(CompanySize.helper.getOptions()),
                    stateAbbr: address.stateAbbr(),
                    website: internet.url(),
                    zipcode: address.zipCode()
                }, true)
            }
        }
    }
}