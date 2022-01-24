import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Divider, FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlLabel, Switch, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { Deal } from "./Deal.entity"
import { remult } from "../common";
import { ErrorInfo } from "remult";

import { AccountManager } from "../AccountManagers/AccountManager.entity";
import { Company } from "../Companies/Company.entity";
import { DealTypes } from "./DealType";
import { DealStages } from "./DealStage";


const dealRepo = remult.repo(Deal);

interface IProps {
    deal: Deal;
    onClose: () => void;
    onSaved: (deal: Deal) => void;
}

export const DealEdit: React.FC<IProps> = ({ deal, onSaved, onClose }) => {
    const [accountManagers, setAccountManagers] = useState<AccountManager[]>(deal.accountManager ? [deal.accountManager] : []);
    const [companies, setCompanies] = useState<CompanyAutoSelect[]>([]);
    useEffect(() => {
        remult.repo(AccountManager).find().then(setAccountManagers)

    }, []);
    const [companySearch, setCompanySearch] = useState('');
    useEffect(() => {
        remult.repo(Company).find({ where: { name: { $contains: companySearch } }, limit: 20 }).then(x => setCompanies(x.map(mapCompanyToAutoComplete)))
    }, [companySearch]);

    const [state, setState] = useState(deal);

    const [errors, setErrors] = useState<ErrorInfo<Deal>>();
    const handleClose = () => {
        onClose();
    };
    const handleSave = async () => {
        try {
            setErrors(undefined);
            let newDeal = await dealRepo.save(state);
            onSaved(newDeal)
            handleClose();
        }
        catch (err: any) {
            setErrors(err);
        }
    }


    return (<div>
        <Dialog open={Boolean(deal)} onClose={handleClose}>
            <DialogTitle>{!deal.id ? "Create " : "Update "} Deal</DialogTitle>
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
                            label="Deal name"
                            error={Boolean(errors?.modelState?.name)}
                            helperText={errors?.modelState?.name}
                            fullWidth
                            value={state.name}
                            onChange={e => setState({ ...state, name: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            multiline
                            error={Boolean(errors?.modelState?.description)}
                            helperText={errors?.modelState?.description}
                            fullWidth
                            value={state.description}
                            onChange={e => setState({ ...state, description: e.target.value })}
                        />
                        <FormControl sx={{ flexGrow: 1 }}
                            error={Boolean(errors?.modelState?.accountManager)}>
                            <Autocomplete
                                disablePortal

                                id="combo-box-demo"
                                options={companies}
                                value={state.company ? mapCompanyToAutoComplete(state.company) : null}
                                inputValue={companySearch}
                                onChange={(e, newValue: CompanyAutoSelect | null) => setState({ ...state, company: newValue ? newValue.company : null! })}
                                onInputChange={(e, newInput) => setCompanySearch(newInput)}

                                renderInput={(params) => <TextField {...params} label="Company" />}
                            />
                            <FormHelperText>{errors?.modelState?.company}</FormHelperText>
                        </FormControl>
                        <FormControl sx={{ flexGrow: 1 }}
                            error={Boolean(errors?.modelState?.stage)}>
                            <InputLabel id="stage-label">Stage</InputLabel>
                            <Select

                                labelId="stage-label"
                                label="Stage"
                                value={state.stage}
                                onChange={e => setState({ ...state, stage: e.target.value })}
                            >
                                <MenuItem value={''}>None</MenuItem>
                                {DealStages.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                            </Select>
                            <FormHelperText>{errors?.modelState?.stage}</FormHelperText>
                        </FormControl>
                        <FormControl sx={{ flexGrow: 1 }}
                            error={Boolean(errors?.modelState?.type)}>
                            <InputLabel id="type-label">Type</InputLabel>
                            <Select

                                labelId="type-label"
                                label="Type"
                                value={state.type}
                                onChange={e => setState({ ...state, type: e.target.value })}
                            >
                                <MenuItem value={''}>None</MenuItem>
                                {DealTypes.map(type => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                            </Select>
                            <FormHelperText>{errors?.modelState?.type}</FormHelperText>
                        </FormControl>

                        <TextField
                            label="Amount"
                            error={Boolean(errors?.modelState?.amount)}
                            type="number"
                            helperText={errors?.modelState?.amount}
                            fullWidth
                            value={state.amount}
                            onChange={e => setState({ ...state, amount: +e.target.value })}
                        />

                        <FormControl sx={{ flexGrow: 1 }}
                            error={Boolean(errors?.modelState?.accountManager)}>
                            <InputLabel id="accountManager-label">Account Manager</InputLabel>
                            <Select

                                labelId="accountManager-label"
                                label="Account Manager"
                                value={accountManagers && (state.accountManager?.id || '')}
                                onChange={e => setState({ ...state, accountManager: accountManagers?.find(x => x.id === e.target.value)! })}
                            >
                                <MenuItem value={''}></MenuItem>
                                {accountManagers?.map(s => (<MenuItem key={s.id} value={s.id}>{s.lastName + " " + s.firstName}</MenuItem>))}
                            </Select>
                            <FormHelperText>{errors?.modelState?.accountManager}</FormHelperText>
                        </FormControl>


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

interface CompanyAutoSelect {
    label: string;
    company: Company;
}
function mapCompanyToAutoComplete(company: Company): CompanyAutoSelect {

    return {
        company,
        label: company.name
    }
}