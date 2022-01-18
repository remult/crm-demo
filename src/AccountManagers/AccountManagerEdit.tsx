import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useState } from "react";
import { AccountManager } from "./AccountManager.entity"
import { remult } from "../common";
import { ErrorInfo } from "remult";

const amRepo = remult.repo(AccountManager);

interface IProps {
    accountManager: AccountManager;
    onClose: () => void;
    onSaved: (accountManager: AccountManager) => void;
}

export const AccountManagerEdit: React.FC<IProps> = ({ accountManager, onSaved, onClose }) => {
    const [state, setState] = useState(accountManager);
    const [errors, setErrors] = useState<ErrorInfo<AccountManager>>();
    const handleClose = () => {
        onClose();
    };
    const handleSave = async () => {
        try {
            setErrors(undefined);
            let newAccountManager = await amRepo.save(state);
            onSaved(newAccountManager)
            handleClose();
        }
        catch (err: any) {
            setErrors(err);
        }
    }


    return (<div>
        <Dialog open={Boolean(accountManager)} onClose={handleClose}>
            <DialogTitle>{!accountManager.id ? "Create " : "Update "} Account Manager</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1 },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        autoFocus
                        label="First Name"
                        error={Boolean(errors?.modelState?.firstName)}
                        helperText={errors?.modelState?.firstName}
                        fullWidth
                        value={state.firstName}
                        onChange={e => setState({ ...state, firstName: e.target.value })}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        error={Boolean(errors?.modelState?.lastName)}
                        helperText={errors?.modelState?.lastName}
                        value={state.lastName}
                        onChange={e => setState({ ...state, lastName: e.target.value })}
                    />
                    <TextField
                        label="email"
                        fullWidth
                        error={Boolean(errors?.modelState?.email)}
                        helperText={errors?.modelState?.email}
                        value={state.email}
                        onChange={e => setState({ ...state, email: e.target.value })}
                    />

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    </div>)
}