import { Avatar, Box, Button, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemSecondaryAction, ListItemText, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { remult } from "../common"
import { Contact } from "./Contact.entity"
import AddIcon from '@mui/icons-material/Add';
import { ContactEdit } from "./ContactEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Company } from "../Companies/Company.entity";
import { amber } from "@mui/material/colors";
import { formatDistance } from "date-fns";
import { Link } from 'react-router-dom';
import { StatusIndicator } from "./StatusIndicator";

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
    const now = Date.now();
    return <>
        <Button
            variant="contained"
            onClick={create}
            startIcon={<AddIcon />}>
            Add Contact
        </Button>
        <List>
            {contacts.map(contact => (
                <ListItem disablePadding key={contact.id} secondaryAction={
                    <Stack direction="row" spacing={2}>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => deleteContact(contact)}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="edit"
                            onClick={() => setEditContact(contact)}>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                }>
                    <ListItemButton component={Link} to={`/contacts/${contact.id}`}>
                        <ListItemAvatar>
                            <Avatar src={contact.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${contact.firstName} ${contact.lastName}`}
                            secondary={
                                <>
                                    {contact.title} at{' '}
                                    {contact.company?.name}{' '}
                                    {`- ${contact.nbNotes} notes `}
                                    {contact.tags.map(tag => (<Chip key={tag.id}
                                        sx={{ m: 0.5 }}
                                        size="small"
                                        variant="outlined"
                                        label={tag.tag}
                                        style={{ backgroundColor: tag.color }} />
                                    ))}
                                </>
                            }
                        />
                    </ListItemButton>
                    <ListItemSecondaryAction>
                        <Typography variant="body1" color="textSecondary">
                            last activity{' '}
                            {contact.lastSeen ? formatDistance(contact.lastSeen, now) : ""}{' '}
                            ago <StatusIndicator status={contact.status}></StatusIndicator>
                        </Typography>
                    </ListItemSecondaryAction>
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