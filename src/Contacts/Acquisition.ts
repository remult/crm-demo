import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";

@ValueListFieldType()
export class Acquisition {
    static inbound = new Acquisition();
    static outbound = new Acquisition();
    static helper = new ValueListValueConverter(Acquisition);
    id!: string;
    caption!: string;
}