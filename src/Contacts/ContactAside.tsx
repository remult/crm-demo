
import { Box, Typography, Divider, Link, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { Contact } from './Contact.entity';
import { ContactEdit } from './ContactEdit';
import { Gender } from './Gender';

export const ContactAside = ({
    contact,
    setContact,
    link = 'edit',
}: {
    contact: Contact;
    setContact: (company: Contact) => void;
    link?: string;
}) => {

    const [editContact, setEditContact] = useState<Contact>();

    return (contact ? (
        <>
            <Box ml={4} width={250} minWidth={250}>
                <Box textAlign="center" mb={2}>
                    {link === 'edit' ? (
                        <Button startIcon={<EditIcon />} onClick={() => setEditContact(contact)}>Edit Contact</Button>
                    ) : (
                        <Button>Show Contact</Button>
                    )}
                </Box>

                <Typography variant="subtitle1">Personal info</Typography>
                <Divider />

                <Box mt={2}>
                    <Link href={contact.email}>{contact.email}</Link>
                </Box>

                <Box mt={1}>
                    {contact.phoneNumber1}{' '}

                    <Typography variant="body1" color="textSecondary" component="span">
                        Work
                    </Typography>
                </Box>
                <Box mb={1}>

                    {contact.phoneNumber2}{' '}

                    <Typography variant="body1" color="textSecondary" component="span">
                        Home
                    </Typography>
                </Box>

                <Box mb={3}>
                    <Typography variant="body1">
                        {contact.gender === Gender.male ? 'He/Him' : 'She/Her'}
                    </Typography>
                </Box>

                <Typography variant="subtitle1">Background</Typography>
                <Divider />

                <Box mt={2}>
                    {contact.background}
                </Box>

                <Box mt={1}>
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        component="span"
                    >
                        Added on{' '}
                        {contact.lastSeen.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </Typography>
                    <br />
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        component="span"
                    >
                        Last seen on{' '}
                        {contact.lastSeen.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </Typography>
                </Box>

                <Typography variant="subtitle2">Tags</Typography>
                <Divider />
                <Box mt={2}>
                    {contact.tags}
                </Box>

            </Box>
            {
                editContact && <ContactEdit
                    contact={editContact}
                    onClose={() => setEditContact(undefined)}
                    onSaved={(contact) => {
                        setContact(contact)
                    }} />
            }
        </>
    ) : null);
}