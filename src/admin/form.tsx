import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Fragment, useEffect, useMemo, useState } from "react";
import { getValueList, ValueListItem } from "remult";
import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { remult } from "remult";
import { Company } from "../Companies/Company.entity";
import { Acquisition } from "../Contacts/Acquisition";
import { Contact } from "../Contacts/Contact.entity";
import { Gender } from "../Contacts/Gender";
import { Status } from "../Contacts/Status";
import { FieldRenderProps, Layout, useInputArea } from "./useForm";


const contactRepo = remult.repo(Contact);
export const PlayForm = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);

    const layout = useMemo(() => {
        const f = contactRepo.metadata.fields;
        return [
            [
                [{ ...f.firstName, readonly: true }, f.lastName],
                [f.title, {
                    ...f.gender, renderInput: RenderSelect(getValueList(Gender))
                }],
                { ...f.company, renderInput: RenderSelect(companies, c => c.name) }
            ],
            [
                f.email,
                [f.phoneNumber1, f.phoneNumber2]
            ],
            [
                f.background,
                f.avatar,
                { ...f.hasNewsletter, inputType: 'checkbox' }
            ],
            [
                { ...f.accountManager, renderInput: RenderSelect(accountManagers, a => a.firstName + ' ' + a.lastName) },
                [{ ...f.status, renderInput: RenderSelect(getValueList(Status)) }, {
                    ...f.acquisition, renderInput: RenderSelect(getValueList(Acquisition))
                }]
            ]

        ] as Layout;
    }, [companies, accountManagers]);
    const f = useInputArea({
        layout,
        renderInput: props =>
            <TextField
                key={props.key}
                value={props.value || ''}
                onChange={e => props.setValue(e.target.value)}
                fullWidth />
    });
    useEffect(() => {
        contactRepo.findFirst().then(f.setState);
        remult.repo(Company).find().then(setCompanies);
        remult.repo(AccountManager).find().then(setAccountManagers);

    }, [f.setState]);
    return (<>
        {f.sections.map((section, i) => {
            return (<Fragment {...section.getProps()}>
                {i !== 0 && <Divider sx={{ mt: 2, mb: 2 }} />}
                <Stack gap={2}>
                    {section.lines.map((line) => (
                        <Stack {...line.getProps()} gap={2} direction="row">
                            {line.items.map(item => item.render())}
                        </Stack>
                    ))}
                </Stack>
            </Fragment>)
        })}
        <pre>{JSON.stringify(f.state, null, 4)}</pre>
    </>);
}

function RenderSelect<T extends ValueListItem>(valueList: T[],
    displayValue: (val: T) => string = x => x.caption) {
    return ({ error, label, value, setValue, errorText, key }: FieldRenderProps) => (
        <FormControl sx={{ flexGrow: 1 }} fullWidth key={key}
            error={error}>
            <InputLabel id={key}>{label}</InputLabel>
            <Select
                labelId={key}
                label={label}
                value={value?.id || ''}
                onChange={e =>
                    setValue(valueList.find(item => item.id === e.target.value)!)}
            >
                {valueList.map(s => (<MenuItem key={s.id} value={s.id}>{displayValue(s)}</MenuItem>))}
            </Select>
            <FormHelperText>{errorText}</FormHelperText>
        </FormControl>)

}