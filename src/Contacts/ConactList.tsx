import { Button, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { remult } from "../common"
import { Contact } from "./Contact.entity"
import AddIcon from '@mui/icons-material/Add';
import { ContactEdit } from "./ContactEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSearchParams } from "react-router-dom";
import CancelIcon from '@mui/icons-material/Cancel';
import { Status } from "./Status";
import { Tag } from "./Tags";


const amRepo = remult.repo(Contact);

export const ContactsList: React.FC<{}> = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const search = {
        search: searchParams.get("search") || '',
        status: searchParams.get("status") || '',
        tag: searchParams.get("tag") || ''
    };

    const [contacts, setContacts] = useState<Contact[]>([]);
    const loadContacts = useCallback(() => amRepo.find({
        where: {
            $or: [
                { firstName: { $contains: search.search } },
                { lastName: { $contains: search.search } }
            ],
            status: search.status ? Status.helper.byId(search.status) : undefined,
            tags: search.tag ? { $contains: search.tag } : undefined
        }, limit: 5
    }).then(setContacts), [search.search, search.status, search.tag]);
    useEffect(() => {
        loadContacts()
    }, [loadContacts]);
    const [newContact, setNewContact] = useState<Contact>();
    const [editContact, setEditContact] = useState<Contact>();
    const deleteContact = async (deletedContact: Contact) => {
        await amRepo.delete(deletedContact);
        setContacts(contacts.filter(contact => deletedContact.id != contact.id));
    }
    const editContactSaved = (editContact: Contact) =>
        setContacts(contacts.map(contact => contact.id === editContact.id ? editContact : contact));

    return <Grid container spacing={2}>
        <Grid item xs={2}>
            <TextField label="Search" variant="filled"
                value={search.search}
                onChange={e =>
                    setSearchParams({ ...search, search: e.target.value })
                } />
            <List dense={true}>
                <ListItem>
                    <ListItemText>STATUS</ListItemText>
                </ListItem>
                {Status.helper.getOptions().map((s: Status) => (<ListItem
                    key={s.id}

                    secondaryAction={s.id.toString() == search.status &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            setSearchParams({ ...search, size: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        setSearchParams({ ...search, size: s.id.toString() });
                    }}>
                        <ListItemText
                            primary={s.caption}
                        />
                    </ListItemButton>
                </ListItem>))}

            </List>
        </Grid>
        <Grid item xs={10}>
            <Button
                variant="contained"
                onClick={() => setNewContact(amRepo.create())}
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
            {
                newContact && <ContactEdit
                    contact={newContact}
                    create
                    onClose={() => setNewContact(undefined)}
                    onSaved={() => {
                        loadContacts()
                    }} />
            }
        </Grid>
    </Grid >
}