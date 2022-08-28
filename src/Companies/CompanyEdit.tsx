import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Divider, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { useEffect, useState } from "react";
import { Company } from "./Company.entity"
import { remult } from "remult";
import { ErrorInfo, getValueList } from "remult";
import { sectors } from "./Sectors";
import { CompanySize } from "./CompanySize";
import { AccountManager } from "../AccountManagers/AccountManager.entity";

const companyRepo = remult.repo(Company);

interface IProps {
    company: Company;
    onClose: () => void;
    onSaved: (company: Company) => void;
}

export const CompanyEdit: React.FC<IProps> = ({ company, onSaved, onClose }) => {
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
    useEffect(() => {
        remult.repo(AccountManager).find().then(setAccountManagers)
    }, [])

    const [state, setState] = useState(company);

    const [errors, setErrors] = useState<ErrorInfo<Company>>();
    const handleClose = () => {
        onClose();
    };
    const handleSave = async () => {
        try {
            setErrors(undefined);
            let newCompany = await companyRepo.save(state);
            onSaved(newCompany)
            handleClose();
        }
        catch (err: any) {
            setErrors(err);
        }
    }


    return (<div>
        <Dialog open={Boolean(company)} onClose={handleClose}>
            <DialogTitle>{!company.id ? "Create " : "Update "} Company</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{ pt: 1 }}
                    noValidate
                    autoComplete="off"
                >


                    <Stack spacing={2}>
                        <TextField
                            autoFocus

                            label="Name"
                            error={Boolean(errors?.modelState?.name)}
                            helperText={errors?.modelState?.name}
                            fullWidth
                            value={state.name}
                            onChange={e => setState({ ...state, name: e.target.value })}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                            <FormControl sx={{ flexGrow: 1 }}
                                error={Boolean(errors?.modelState?.sector)}>
                                <InputLabel id="sector-label">Sector</InputLabel>
                                <Select

                                    labelId="sector-label"
                                    label="Sector"
                                    value={state.sector}
                                    onChange={e => setState({ ...state, sector: e.target.value })}
                                >
                                    <MenuItem value={''}>None</MenuItem>
                                    {sectors.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                                </Select>
                                <FormHelperText>{errors?.modelState?.sector}</FormHelperText>
                            </FormControl>

                            <FormControl sx={{ flexGrow: 1 }}
                                error={Boolean(errors?.modelState?.size)}>
                                <InputLabel id="size-label">Size</InputLabel>
                                <Select

                                    labelId="size-label"
                                    label="Size"
                                    value={state.size?.id}
                                    onChange={e => setState({ ...state, size: getValueList(CompanySize).find(item => item.id === e.target.value)! })}
                                >
                                    <MenuItem value={''}></MenuItem>
                                    {getValueList(CompanySize).map(s => (<MenuItem key={s.id} value={s.id}>{s.caption}</MenuItem>))}
                                </Select>
                                <FormHelperText>{errors?.modelState?.size}</FormHelperText>
                            </FormControl>
                        </Stack>
                        <Divider />
                        <TextField

                            label="Address"
                            error={Boolean(errors?.modelState?.address)}
                            helperText={errors?.modelState?.address}
                            fullWidth
                            value={state.address}
                            onChange={e => setState({ ...state, address: e.target.value })}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField

                                label="City"
                                error={Boolean(errors?.modelState?.city)}
                                helperText={errors?.modelState?.city}
                                fullWidth
                                value={state.city}
                                onChange={e => setState({ ...state, city: e.target.value })}
                            /> <TextField

                                label="Zipcode"
                                error={Boolean(errors?.modelState?.zipcode)}
                                helperText={errors?.modelState?.zipcode}
                                fullWidth
                                value={state.zipcode}
                                onChange={e => setState({ ...state, zipcode: e.target.value })}
                            /> <TextField

                                label="State abbr"
                                error={Boolean(errors?.modelState?.stateAbbr)}
                                helperText={errors?.modelState?.stateAbbr}
                                fullWidth
                                value={state.stateAbbr}
                                onChange={e => setState({ ...state, stateAbbr: e.target.value })}
                            />
                        </Stack>
                        <Divider />
                        <TextField

                            label="Website"
                            error={Boolean(errors?.modelState?.website)}
                            helperText={errors?.modelState?.website}
                            fullWidth
                            value={state.website}
                            onChange={e => setState({ ...state, website: e.target.value })}
                        /> <TextField

                            label="Linked in"
                            error={Boolean(errors?.modelState?.linkedIn)}
                            helperText={errors?.modelState?.linkedIn}
                            fullWidth
                            value={state.linkedIn}
                            onChange={e => setState({ ...state, linkedIn: e.target.value })}
                        /> <TextField

                            label="Logo"
                            error={Boolean(errors?.modelState?.logo)}
                            helperText={errors?.modelState?.logo}
                            fullWidth
                            value={state.logo}
                            onChange={e => setState({ ...state, logo: e.target.value })}
                        />
                        <Divider />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField sx={{ flexGrow: 1 }}

                                label="Phone number"
                                error={Boolean(errors?.modelState?.phoneNumber)}
                                helperText={errors?.modelState?.phoneNumber}
                                value={state.phoneNumber}
                                onChange={e => setState({ ...state, phoneNumber: e.target.value })}
                            />
                            <FormControl sx={{ flexGrow: 1 }}
                                error={Boolean(errors?.modelState?.accountManager)}>
                                <InputLabel id="accountManager-label">Account Manager</InputLabel>
                                <Select

                                    labelId="accountManager-label"
                                    label="Account Manager"
                                    value={state.accountManager?.id || ''}
                                    onChange={e => setState({ ...state, accountManager: accountManagers.find(x => x.id == e.target.value)! })}
                                >
                                    <MenuItem value={''}></MenuItem>
                                    {accountManagers?.map(s => (<MenuItem key={s.id} value={s.id}>{s.lastName + " " + s.firstName}</MenuItem>))}
                                </Select>
                                <FormHelperText>{errors?.modelState?.accountManager}</FormHelperText>
                            </FormControl>

                        </Stack>
                    </Stack>


                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    </div >)
}