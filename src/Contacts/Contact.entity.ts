import { Allow, Entity, EntityFilter, EntityMetadata, Field, Filter, Remult, Repository, SqlCommand, SqlDatabase, UuidField } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { Company } from "../Companies/Company.entity";
import { Acquisition } from "./Acquisition";
import { ContactNote } from "./ContactNote.entity";
import { ContactTag } from "./ContactTag.entity";
import { Gender } from "./Gender";
import { Status } from "./Status";
import { Tag } from "./Tag.entity";
import { CustomSqlFilterBuilder, dbNameProvider, FilterConsumerBridgeToSqlRequest, getDbNameProvider } from 'remult/src/filter/filter-consumer-bridge-to-sql-request';

@Entity<Contact>("contacts", {
    allowApiCrud: Allow.authenticated,
    defaultOrderBy: {
        lastName: "asc"
    }
})
export class Contact {
    @UuidField()
    id?: string;
    @Field()
    firstName: string = '';
    @Field()
    lastName: string = '';
    @Field(o => o.valueType = Gender)
    gender: Gender = Gender.male;
    @Field()
    title: string = '';
    @Field(c => c.valueType = Company)
    company?: Company;
    @Field()
    phoneNumber1: string = '';
    @Field()
    phoneNumber2: string = '';
    @Field()
    background: string = '';
    @Field(o => o.valueType = Acquisition)
    acquisition: Acquisition = Acquisition.inbound;
    @Field()
    email: string = '';
    @Field()
    avatar?: string = '';
    @Field()
    hasNewsletter: boolean = false;
    @Field((options, remult) =>
        options.serverExpression =
        async contact => remult.repo(ContactTag).find({ where: { contact } })
            .then(tags => tags.map(t => t.tag)))
    tags: Tag[] = [];
    @Field(o => o.valueType = AccountManager)
    accountManager?: AccountManager;
    @Field(s => s.valueType = Status)
    status: Status = Status.cold;
    @Field(f => f.valueType = Date,
        {
            allowApiUpdate: false
        })
    lastSeen: Date = new Date();
    @Field(f => f.valueType = Date,
        {
            allowApiUpdate: false
        })
    createdAt: Date = new Date();

    @Field((options, remult) => options.serverExpression = async contact => remult.repo(ContactNote).count({ contact }))
    nbNotes: number = 0;

    static filterTag = Filter.createCustom<Contact, string>(async (remult, tag) => {
        if (!tag)
            return {};
        if (false) {
            const t = await remult.repo(Tag).findFirst({ tag });
            return SqlDatabase.customFilter(async build => {
                const contacts = await sqlFor(remult.repo(Contact), build);
                const contactTags = await sqlFor(remult.repo(ContactTag), build);
                build.sql = `${contacts.id} in (select ${contactTags.contact} from ${contactTags} where ${await contactTags._condition({
                    tag: t
                })})`
            })
        }
        else {
            const r: EntityFilter<Contact> =
            {
                id: await remult.repo(ContactTag).find({
                    where: {
                        tag: await remult.repo(Tag).findFirst({ tag })
                    },
                    load: ct => [ct.contact]
                }).then(ct => ct.map(ct => ct.contact.id!))
            };
            return r;
        }
    });
    static disableLastSeenUpdate = false;
    static async updateLastSeen(remult: Remult, contact: Contact) {
        if (Contact.disableLastSeenUpdate)
            return;
        const last = await remult.repo(ContactNote).findFirst(
            {
                contact
            }, {
            orderBy: {
                createdAt: "desc"
            }
        });
        contact.lastSeen = last?.createdAt;
        await remult.repo(Contact).save(contact);
    }
}


async function sqlFor<entityType>(repo: Repository<entityType>, sql: CustomSqlFilterBuilder): Promise<sqlFor<entityType>> {
    const meta = repo.metadata;
    const name = await getDbNameProvider(repo.metadata);
    const result = {
        toString: () => name.entityName,
        _condition: async (filter: EntityFilter<entityType>) => {
            const bridge = new FilterConsumerBridgeToSqlRequest({
                addParameterAndReturnSqlToken: x => sql.addParameterAndReturnSqlToken(x),
                execute: undefined!
            }, name);
            bridge._addWhere = false;
            Filter.fromEntityFilter(meta, filter).__applyToConsumer(bridge);
            return await bridge.resolveWhere();
        }
    }
    for (const f of meta.fields.toArray()) {
        //@ts-ignore
        result[f.key] = name.nameOf(f)
    }
    //@ts-ignore
    return result;
}

export declare type sqlFor<entityType> = {
    [Properties in keyof entityType]: string
} & {
    _condition: (filter: EntityFilter<entityType>) => Promise<string>
};
