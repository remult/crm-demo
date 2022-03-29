import { Allow, Entity, EntityFilter, EntityMetadata, Field, Filter, Remult, Repository, SqlCommand, SqlDatabase, Fields } from "remult";
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
    @Fields.uuid()
    id?: string;
    @Fields.string()
    firstName = '';
    @Fields.string()
    lastName = '';
    @Field(() => Gender)
    gender = Gender.male;
    @Fields.string()
    title = '';
    @Field(() => Company)
    company?: Company;
    @Fields.string()
    phoneNumber1 = '';
    @Fields.string()
    phoneNumber2 = '';
    @Fields.string()
    background = '';
    @Field(() => Acquisition)
    acquisition = Acquisition.inbound;
    @Fields.string()
    email = '';
    @Fields.string()
    avatar?= '';
    @Fields.boolean()
    hasNewsletter: boolean = false;
    @Fields.object((options, remult) =>
        options.serverExpression =
        async contact => remult.repo(ContactTag).find({ where: { contact } })
            .then(tags => tags.map(t => t.tag)))
    tags: Tag[] = [];
    @Field(() => AccountManager)
    accountManager?: AccountManager;
    @Field(() => Status)
    status = Status.cold;
    @Fields.date({
        allowApiUpdate: false
    })
    lastSeen = new Date();
    @Fields.date({
        allowApiUpdate: false
    })
    createdAt = new Date();

    @Fields.integer((options, remult) => options.serverExpression = async contact => remult.repo(ContactNote).count({ contact }))
    nbNotes = 0;

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
