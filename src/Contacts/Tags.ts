import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";

@ValueListFieldType()
export class Tag {
    static t0 = new Tag(0, 'football-fan', '#eddcd2');
    static t1 = new Tag(1, 'holiday-card', '#fff1e6');
    static t2 = new Tag(2, 'influencer', '#fde2e4');
    static t3 = new Tag(3, 'manager', '#fad2e1');
    static t4 = new Tag(4, 'musician', '#c5dedd');
    static t5 = new Tag(5, 'vip', '#dbe7e4');
    constructor(public id: number, public caption: string, public color: string) { }
    static helper = new ValueListValueConverter(Tag);
}