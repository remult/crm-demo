import { Avatar, Box, Card, CardContent, Stack, Tab, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { remult } from "../common";
import { Contact } from "../Contacts/Contact.entity";
import { ContactNote } from "./ContactNote.entity";
import { ContactAside } from "./ContactAside"
import { Logo } from "../Companies/Logo";
import { StatusIndicator } from "./StatusIndicator";

export const ContactShow: React.FC<{}> = () => {
    let params = useParams();
    const [contact, setContact] = useState<Contact>();
    const [notes, setNotes] = useState<ContactNote[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const contact = await remult.repo(Contact).findId(params.id!);
            setContact(contact);
            if (contact) {
                setNotes(await remult.repo(ContactNote).find({ where: { contact } }));
            }
            setLoading(false)
        })();
    }, [params.id]);

    if (loading)
        return <span>Loading</span>;
    if (!contact)
        return <span>not found</span>;

    return <Box mt={2} display="flex">
        <Box flex="1">
            <Card>
                <CardContent>
                    <Box display="flex">
                        <Avatar src={contact.avatar} />
                        <Box ml={2} flex="1">
                            <Typography variant="h4">
                                {contact.firstName} {contact.lastName}
                            </Typography>
                            <Typography variant="body1">
                                {contact.title} at {contact.company?.name}
                            </Typography>
                        </Box>
                        <Box>
                            <Logo url={contact.company!.logo} title={contact.company!.name} sizeInPixels={20} />
                        </Box>
                    </Box>

                    {notes.map((note) => (<Box key={note.id} mt={2}>
                        {note.contact.firstName} 
                        added a note on {' '}
                        {note.createdAt.toLocaleString()}{' '}
                        <StatusIndicator status={note.status}/>
                        <Card>
                            <CardContent>
                                <Typography variant="body1">
                                    {note.text}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
        <ContactAside contact={contact} setContact={setContact}></ContactAside>
    </Box>
}

