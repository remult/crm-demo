import { Allow, Entity, Field, Fields } from "remult";

@Entity("tags", {
    allowApiCrud: Allow.authenticated
})
export class Tag {
    @Fields.uuid()
    id?: string;
    @Fields.string()
    tag = '';
    @Fields.string()
    color = '';

}

export const colors = [
    '#eddcd2',
    '#fff1e6',
    '#fde2e4',
    '#fad2e1',
    '#c5dedd',
    '#dbe7e4',
    '#f0efeb',
    '#d6e2e9',
    '#bcd4e6',
    '#99c1de',
];
