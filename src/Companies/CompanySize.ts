import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from 'remult/valueConverters';

@ValueListFieldType()
export class CompanySize {
    constructor(public id: number, public caption: string) { }
    static s1 = new CompanySize(1, '1 employee');
    static s10 = new CompanySize(10, '2-9 employees');
    static s50 = new CompanySize(50, '10-49 employees');
    static s250 = new CompanySize(250, '50-249 employees');
    static s500 = new CompanySize(500, '250 or more employees');


    static helper = new ValueListValueConverter(CompanySize);

}

