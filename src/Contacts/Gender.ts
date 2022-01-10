import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";

@ValueListFieldType()
export class Gender {
    static male = new Gender();
    static female = new Gender();
    static helper = new ValueListValueConverter(Gender);
    id!: string;
    caption!: string;
}