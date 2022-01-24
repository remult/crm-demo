import { Avatar, Box, Button, List, ListItem, ListItemAvatar, ListItemButton, ListItemSecondaryAction, ListItemText, Pagination, Skeleton, TablePagination, Typography } from "@mui/material";
import React, { useState } from "react";
import { remult } from "../common"
import { Contact } from "./Contact.entity"
import AddIcon from '@mui/icons-material/Add';
import { ContactEdit } from "./ContactEdit";
import { Company } from "../Companies/Company.entity";
import { formatDistance } from "date-fns";
import { Link } from 'react-router-dom';
import { StatusIndicator } from "./StatusIndicator";

const amRepo = remult.repo(Contact);


export const ContactsList: React.FC<{
    contacts: Contact[],
    setContacts: (contacts: Contact[]) => void,
    defaultCompany?: Company,
    loading: boolean,
    itemsPerPage?: number
}> = ({ contacts, setContacts, defaultCompany, loading, itemsPerPage = 10 }) => {

    const [editContact, setEditContact] = useState<Contact>();
    const deleteContact = async (deletedContact: Contact) => {
        await amRepo.delete(deletedContact);
        setContacts(contacts.filter(contact => deletedContact.id !== contact.id));
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
        <Box display="flex" justifyContent="flex-end">
            <Button
                variant="contained"
                onClick={create}
                startIcon={<AddIcon />}>
                Add Contact
            </Button>
        </Box>
        <List>
            {loading && Array.from(Array(itemsPerPage).keys()).map(i => (<ListItem disablePadding key={i}>
                <ListItemButton >
                    <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <ListItemText primary={<Skeleton variant="text" />}
                        secondary={<Skeleton variant="text" />}>

                    </ListItemText>
                </ListItemButton>
            </ListItem>))}
            {!loading && contacts.map((contact, index) => (<ListItem disablePadding key={contact.id} >
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
                                {contact.tags.map(tag => (
                                    <span key={tag.id}
                                        style={{ color: 'InfoText', backgroundColor: tag.color, padding: 4, paddingLeft: 8, paddingRight: 8, margin: 4, borderRadius: 20 }} >
                                        {tag.tag}
                                    </span>
                                ))}
                            </>
                        }
                    />
                    <ListItemSecondaryAction>
                        <Typography variant="body1" color="textSecondary">
                            last activity{' '}
                            {contact.lastSeen ? formatDistance(contact.lastSeen, now) : ""}{' '}
                            ago <StatusIndicator status={contact.status}></StatusIndicator>
                        </Typography>
                    </ListItemSecondaryAction>
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