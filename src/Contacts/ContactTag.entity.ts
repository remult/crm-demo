import { Entity, Field, UuidField } from "remult";
import { Contact } from "./Contact.entity";
import { Tag } from "./Tag.entity";

@Entity("contactTag", {
    allowApiCrud: true
})
export class ContactTag {
    @UuidField()
    id?: string;
    @Field(o => o.valueType = Contact, { lazy: true })
    contact!: Contact;
    @Field(o => o.valueType = Tag)
    tag!: Tag;
}
