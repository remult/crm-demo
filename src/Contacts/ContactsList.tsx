import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useState } from "react";
import { remult } from "../common"
import { Contact } from "./Contact.entity"
import AddIcon from '@mui/icons-material/Add';
import { ContactEdit } from "./ContactEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Company } from "../Companies/Company.entity";

const amRepo = remult.repo(Contact);


export const ContactsList: React.FC<{
    contacts: Contact[],
    setContacts: (contacts: Contact[]) => void,
    defaultCompany?: Company
}> = ({ contacts, setContacts, defaultCompany }) => {


    const [editContact, setEditContact] = useState<Contact>();
    const deleteContact = async (deletedContact: Contact) => {
        await amRepo.delete(deletedContact);
        setContacts(contacts.filter(contact => deletedContact.id != contact.id));
    }
    const editContactSaved = (afterEditContact: Contact) => {
        if (!editContact?.id)
            setContacts([...contacts, afterEditContact]);
        else
            setContacts(contacts.map(contact => contact.id === afterEditContact.id ? afterEditContact : contact));
    }
    const create = () => {
        const newContact = new Contact();
        newContact.company = defaultCompany;
        setEditContact(newContact);
    }
    return <>
        <Button
            variant="contained"
            onClick={create}
            startIcon={<AddIcon />}>
            Add Contact
        </Button>
        <List>
            {contacts.map(am => (
                <ListItem disablePadding key={am.id} secondaryAction={
                    <Stack direction="row" spacing={2}>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => deleteContact(am)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => setEditContact(am)}>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                }>
                    <ListItemButton>
                        <ListItemText primary={am.firstName + " " + am.lastName} />
                    </ListItemButton>
                </ListItem>
            ))}

        </List>
        {
            editContact && <ContactEdit
                contact={editContact}

                onClose={() => setEditContact(undefined)}
                onSaved={(contact) => {
                    editContactSaved(contact)
                }} />
        }
    </>
}