import { ValueListFieldType } from "remult";

@ValueListFieldType()
export class Gender {
    static male = new Gender();
    static female = new Gender();
    id!: string;
    caption!: string;
}