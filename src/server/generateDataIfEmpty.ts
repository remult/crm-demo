import { Remult } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { name, internet, random, address, company, datatype, phone, lorem } from 'faker';
import { Company } from "../Companies/Company.entity";
import { sectors } from "../Companies/Sectors";
import { CompanySize } from "../Companies/CompanySize";
import { Contact } from "../Contacts/Contact.entity";
import { Gender } from "../Contacts/Gender";
import { Acquisition } from "../Contacts/Acquisition";
import { Status } from "../Contacts/Status";

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
    {
        const repo = remult.repo(Contact);
        const accountManagers = await remult.repo(AccountManager).find();
        const companies = await remult.repo(Company).find();
        if (await repo.count() == 0) {
            for (let index = 0; index < 300; index++) {
                const firstName = name.firstName();
                const lastName = name.lastName();
                const title = company.bsAdjective();
                await repo.save({
                    firstName,
                    lastName,
                    gender: random.arrayElement(Gender.helper.getOptions()),
                    title,
                    email: internet.email(firstName, lastName),
                    phoneNumber1: phone.phoneNumber(),
                    phoneNumber2: phone.phoneNumber(),
                    background: lorem.sentence(),
                    acquisition: random.arrayElement(Acquisition.helper.getOptions()),
                    avatar: 'https://i.pravatar.cc/40?img=' + datatype.number(70),
                    hasNewsletter: datatype.boolean(),
                    status: random.arrayElement(Status.helper.getOptions()),
                    company: random.arrayElement(companies),
                    accountManager: random.arrayElement(accountManagers)
                }, true)
            }
        }
    }
}
