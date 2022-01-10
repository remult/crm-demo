import { ValueListFieldType } from "remult";
import { ValueListValueConverter } from "remult/valueConverters";
@ValueListFieldType()
export class Status {
    static cold = new Status('cold', '#7dbde8');
    static warm = new Status('warm', '#e8cb7d');
    static hot = new Status('hot', '#e88b7d');
    static 'in-contract' = new Status('in-contract', '#a4e87d');
    constructor(public id: string, public color: string, public caption?: string) { }
    static helper = new ValueListValueConverter(Status);
}