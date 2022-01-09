import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useState } from "react";
import { AccountManager } from "./AccountManager.entity"
import { useForm } from 'react-hook-form';
import { remult } from "../common";
import { ErrorInfo } from "remult";

const amRepo = remult.repo(AccountManager);

interface IProps {
    accountManager: AccountManager;
    onClose: () => void;
    onSaved: (accountManager: AccountManager) => void;
    create?: boolean;
}

export const AccountManagerEdit: React.FC<IProps> = ({ accountManager, create, onSaved, onClose }) => {
    const { register, handleSubmit } = useForm({ defaultValues: accountManager });
    const [errors, setErrors] = useState<ErrorInfo<AccountManager>>();
    const handleClose = () => {
        onClose();
    };
    const handleSave =
        handleSubmit(async data => {
            try {
                setErrors(undefined);
                let newAccountManager = await amRepo.save({
                    ...data
                }, create);
                onSaved(newAccountManager)
                handleClose();
            }
            catch (err: any) {
                setErrors(err);
            }
        }, invalid => {
            console.log(invalid);
        })


    return (<div>
        <Dialog open={Boolean(accountManager)} onClose={handleClose}>
            <DialogTitle>{create ? "Create " : "Update "} Account Manager</DialogTitle>
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
                        {...register("firstName")}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        error={Boolean(errors?.modelState?.lastName)}
                        helperText={errors?.modelState?.lastName}
                        {...register("lastName")}
                    />
                    <TextField
                        label="email"
                        fullWidth
                        error={Boolean(errors?.modelState?.email)}
                        helperText={errors?.modelState?.email}
                        {...register("email")}
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