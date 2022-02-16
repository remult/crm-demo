import { Box, Chip, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Skeleton, TextField, TablePagination } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { remult } from "../common"
import { Contact } from "./Contact.entity"

import { useSearchParams } from "react-router-dom";
import CancelIcon from '@mui/icons-material/Cancel';
import { Status } from "./Status";
import { ContactsList } from "./ContactsList";
import { Tag } from "./Tag.entity";


const amRepo = remult.repo(Contact);

export const ContactsPage: React.FC<{}> = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const filter = {
        search: searchParams.get("search") || '',
        status: searchParams.get("status") || '',
        tag: searchParams.get("tag") || ''
    };
    const patchFilter = (f: Partial<typeof filter>) => {
        setSearchParams({ ...filter, ...f });
    }
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [contactsCount, setContactsCount] = useState(0);

    const [addedContacts, setAddedContacts] = useState<Contact[]>([]);

    const contactsQuery = useMemo(() => {
        const query = amRepo.query({
            where: {
                $or: [
                    { firstName: { $contains: filter.search } },
                    { lastName: { $contains: filter.search } }
                ],
                status: filter.status ? Status.helper.byId(filter.status) : undefined,
                $and: [filter.tag ? Contact.filterTag(filter.tag) : undefined!]
            }, pageSize: rowsPerPage
        });
        query.count().then(count => setContactsCount(count));
        return query;
    }, [filter.search, filter.status, filter.tag, rowsPerPage]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setContacts(await contactsQuery.getPage(page));
            }
            finally {
                setLoading(false);
            }
        })();
    }, [contactsQuery, page]);

    useEffect(() => {
        (async () => {
            try {
                setLoadingTags(true);
                await remult.repo(Tag).find().then(setTags);
            } finally {
                setLoadingTags(false);
            }
        })();
    }, []);


    return <Grid container spacing={2}>
        <Grid item xs={2}>
            <TextField label="Search" variant="filled"
                value={filter.search}
                onChange={e =>
                    patchFilter({ search: e.target.value })
                } />
            <List dense={true}>
                <ListItem>
                    <ListItemText>STATUS</ListItemText>
                </ListItem>
                {Status.helper.getOptions().map((s: Status) => (<ListItem
                    key={s.id}

                    secondaryAction={s.id.toString() === filter.status &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            patchFilter({ status: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        patchFilter({ status: s.id.toString() });
                    }}>
                        <ListItemText
                            primary={s.caption}
                        />
                    </ListItemButton>
                </ListItem>))}

            </List>
            <List dense={true}>
                <ListItem>
                    <ListItemText>TAGS</ListItemText>
                </ListItem>
                {loadingTags ?
                    Array.from(Array(5).keys()).map(i => (<Skeleton key={i} />))
                    : tags.map((tag: Tag) => (
                        <Box mt={1} mb={1} key={tag.id}>
                            <Chip onClick={() => {
                                patchFilter({ tag: tag.tag });
                            }}
                                size="small"
                                variant="outlined"
                                onDelete={tag.tag === filter.tag ? (() => patchFilter({ tag: '' })) : undefined}
                                label={tag.tag}
                                style={{ backgroundColor: tag.color, border: 1 }}
                            />
                        </Box>
                    ))}

            </List>
        </Grid>
        <Grid item xs={10}>
            <ContactsList contacts={contacts}
                setContacts={setContacts}
                loading={loading}
                itemsPerPage={rowsPerPage}
                addedContacts={addedContacts}
                setAddedContacts={setAddedContacts} />

            <TablePagination
                component="div"
                count={contactsCount}
                page={page}
                onPageChange={(_, newPage) => {
                    setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />
        </Grid>
    </Grid >
}
