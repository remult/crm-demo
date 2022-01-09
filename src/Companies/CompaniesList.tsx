import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { remult } from "../common"
import { Company } from "./Company.entity"
import AddIcon from '@mui/icons-material/Add';
import { CompanyEdit } from "./CompanyEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const amRepo = remult.repo(Company);

export const CompaniesList: React.FC<{}> = () => {
    const [companys, setCompanys] = useState<Company[]>([]);
    const loadCompanys = useCallback(() => amRepo.find().then(setCompanys), []);
    useEffect(() => {
        loadCompanys()
    }, [loadCompanys]);
    const [newCompany, setNewCompany] = useState<Company>();
    const [editCompany, setEditCompany] = useState<Company>();
    const deleteCompany = async (deletedCompany: Company) => {
        await amRepo.delete(deletedCompany);
        setCompanys(companys.filter(company => deletedCompany.id != company.id));
    }
    const editCompanySaved = (editCompany: Company) =>
        setCompanys(companys.map(company => company.id === editCompany.id ? editCompany : company));

    return <div>
        <Button
            variant="contained"
            onClick={() => setNewCompany(amRepo.create())}
            startIcon={<AddIcon />}>
            Add Company
        </Button>
        <List>
            {companys.map(am => (
                <ListItem disablePadding key={am.id} secondaryAction={
                    <Stack direction="row" spacing={2}>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => deleteCompany(am)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => setEditCompany(am)}>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                }>
                    <ListItemButton>
                        <ListItemText primary={am.name} />
                    </ListItemButton>
                </ListItem>
            ))}

        </List>
        {editCompany && <CompanyEdit
            company={editCompany}
            create={false}
            onClose={() => setEditCompany(undefined)}
            onSaved={(company) => {
                editCompanySaved(company)
            }} />}
        {newCompany && <CompanyEdit
            company={newCompany}
            create={true}
            onClose={() => setNewCompany(undefined)}
            onSaved={() => {
                loadCompanys()
            }} />}
    </div>
}