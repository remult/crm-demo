import { Remult } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { name as nameFaker, internet, random, address, company as companyFaker, datatype, phone, lorem, date } from 'faker';
import { Company } from "../Companies/Company.entity";
import { sectors } from "../Companies/Sectors";
import { CompanySize } from "../Companies/CompanySize";
import { Contact } from "../Contacts/Contact.entity";
import { Gender } from "../Contacts/Gender";
import { Acquisition } from "../Contacts/Acquisition";
import { Status } from "../Contacts/Status";
import { ContactNote } from "../Contacts/ContactNote.entity";
import { Tag } from "../Contacts/Tag.entity";
import { ContactTag } from "../Contacts/ContactTag.entity";

export async function seed(remult: Remult) {
    try {
        {
            const repo = remult.repo(Tag);
            if (await repo.count() == 0)
                await repo.insert([
                    { tag: 'football-fan', color: '#eddcd2' },
                    { tag: 'holiday-card', color: '#fff1e6' },
                    { tag: 'influencer', color: '#fde2e4' },
                    { tag: 'manager', color: '#fad2e1' },
                    { tag: 'musician', color: '#c5dedd' },
                    { tag: 'vip', color: '#dbe7e4' }
                ])
        }
        {
            const repo = remult.repo(AccountManager);
            if (await repo.count() == 0) {
                for (let index = 0; index < 10; index++) {
                    const firstName = nameFaker.firstName();
                    const lastName = nameFaker.lastName();
                    await repo.insert({
                        firstName,
                        lastName,
                        email: internet.email(firstName, lastName),
                        avatar: 'https://i.pravatar.cc/40?img=' + datatype.number(70)
                    })
                }
            }
        }
        {
            const companyRepo = remult.repo(Company);
            const accountManagers = await remult.repo(AccountManager).find();
            if (await companyRepo.count() == 0) {
                console.log("Start seed company");
                const contactRepo = remult.repo(Contact);
                Contact.disableLastSeenUpdate = true;
                const contactNotesRepo = remult.repo(ContactNote);
                const contactTagsRepo = remult.repo(ContactTag);

                const allTags = await remult.repo(Tag).find();
                // delete related data
                {
                    for (const c of await contactRepo.find()) {
                        await contactRepo.delete(c);
                    }
                    for (const c of await contactNotesRepo.find()) {
                        await contactNotesRepo.delete(c);
                    }

                    for (const c of await contactTagsRepo.find()) {
                        await contactTagsRepo.delete(c);
                    }
                }
                // Start create Companies
                for (let index = 0; index < 100; index++) {
                    const name = companyFaker.companyName();
                    const company = await companyRepo.insert({
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
                        zipcode: address.zipCode(),
                        created_at: date.recent(500)
                    });
                    console.log(index + ": " + company.name);
                    // Create contact
                    {
                        let numOfContacts = datatype.number(company.size.id / 10);
                        if (numOfContacts < 1)
                            numOfContacts = 1;
                        for (let index = 0; index < numOfContacts; index++) {
                            const firstName = nameFaker.firstName();
                            const lastName = nameFaker.lastName();
                            const title = companyFaker.bsAdjective();
                            const contact = await contactRepo.insert({
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
                                company,
                                accountManager: random.arrayElement(accountManagers)
                            });
                            // Create Contact Notes
                            for (let index = 0; index < datatype.number(20) + 1; index++) {
                                const note = await contactNotesRepo.insert({
                                    text: lorem.paragraphs(3),
                                    contact,
                                    accountManager: random.arrayElement(accountManagers),
                                    createdAt: date.between(company.created_at, new Date()),
                                    status: random.arrayElement(Status.helper.getOptions())
                                });
                                if (index == 0 || note.createdAt > contact.lastSeen) {
                                    contact.lastSeen = note.createdAt;
                                }
                                if (index == 0 || note.createdAt < contact.createdAt) {
                                    contact.createdAt = note.createdAt; 
                                }
                            }
                            // Create Contact Tags
                            let tags = [...allTags];
                            for (let index = 0; index < datatype.number(3); index++) {
                                const tag = random.arrayElement(tags);
                                tags = tags.filter(t => t != tag);
                                await contactTagsRepo.insert({
                                    tag,
                                    contact
                                })
                            }
                            await contactRepo.save(contact);
                        }
                    }
                }
                console.log("End seed company");
            }
        }
    }
    catch (err) {
        console.log({ err });
    }
    finally {
        Contact.disableLastSeenUpdate = false;
    }
}