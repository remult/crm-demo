import {
  Box,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  TablePagination,
  Drawer
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { remult } from 'remult'
import { Contact, ContactWithTags } from './Contact.entity'

import { useSearchParams } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel'
import { Status } from './Status'
import { ContactsList } from './ContactsList'
import { Tag } from './Tag.entity'
import { getValueList } from 'remult'
import { useIsDesktop } from '../utils/useIsDesktop'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { specialRepo } from '../dev-remult/relations'

const amRepo = remult.repo(Contact)

export const ContactsPage: React.FC<{}> = () => {
  let [searchParams, setSearchParams] = useSearchParams()
  const filter = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    tag: searchParams.get('tag') || ''
  }
  const [openDrawer, setOpenDrawer] = useState(false)
  const patchFilter = (f: Partial<typeof filter>) => {
    setSearchParams({ ...filter, ...f })
    setOpenDrawer(false)
  }
  const [contacts, setContacts] = useState<ContactWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [contactsCount, setContactsCount] = useState(0)

  const [addedContacts, setAddedContacts] = useState<Contact[]>([])

  const fetchRef = useRef(0)
  useEffect(() => {
    ;(async () => {
      const ref = ++fetchRef.current
      try {
        setLoading(true)
        const where = {
          $or: [
            { firstName: { $contains: filter.search } },
            { lastName: { $contains: filter.search } }
          ],
          status: filter.status
            ? getValueList(Status).find((s) => s.id === filter.status)
            : undefined,
          $and: [filter.tag ? Contact.filterTag(filter.tag) : undefined!]
        }
        amRepo.count(where).then((count) => setContactsCount(count))
        const contacts = await specialRepo(Contact).find({
          where,
          with: {
            tags2: {
              with: {}
            }
          },
          limit: rowsPerPage,
          page
        })
        if (ref === fetchRef.current) setContacts(contacts)
      } finally {
        if (ref === fetchRef.current) setLoading(false)
      }
    })()
  }, [page, filter.search, filter.status, filter.tag, rowsPerPage])

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingTags(true)
        await remult.repo(Tag).find().then(setTags)
      } finally {
        setLoadingTags(false)
      }
    })()
  }, [])
  const isDesktop = useIsDesktop()

  const FilterElement = () => (
    <>
      {' '}
      <List dense={true}>
        <ListItem>
          <ListItemText>STATUS</ListItemText>
        </ListItem>
        {getValueList(Status).map((s: Status) => (
          <ListItem
            key={s.id}
            secondaryAction={
              s.id.toString() === filter.status && (
                <IconButton
                  edge="end"
                  aria-label="cancel"
                  onClick={() => {
                    patchFilter({ status: '' })
                  }}
                >
                  <CancelIcon />
                </IconButton>
              )
            }
          >
            <ListItemButton
              onClick={() => {
                patchFilter({ status: s.id.toString() })
              }}
            >
              <ListItemText primary={s.caption} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense={true}>
        <ListItem>
          <ListItemText>TAGS</ListItemText>
        </ListItem>
        {loadingTags
          ? Array.from(Array(5).keys()).map((i) => <Skeleton key={i} />)
          : tags.map((tag: Tag) => (
              <Box mt={1} mb={1} key={tag.id}>
                <Chip
                  onClick={() => {
                    patchFilter({ tag: tag.tag })
                  }}
                  size="small"
                  variant="outlined"
                  onDelete={
                    tag.tag === filter.tag
                      ? () => patchFilter({ tag: '' })
                      : undefined
                  }
                  label={tag.tag}
                  style={{ backgroundColor: tag.color, border: 1 }}
                />
              </Box>
            ))}
      </List>
    </>
  )

  return (
    <Grid container spacing={2}>
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <FilterElement />
      </Drawer>
      {isDesktop && (
        <Grid item xs={2}>
          <FilterElement />
        </Grid>
      )}
      <Grid item xs={isDesktop ? 10 : 12}>
        <ContactsList
          contacts={contacts}
          setContacts={setContacts}
          loading={loading}
          itemsPerPage={rowsPerPage}
          addedContacts={addedContacts}
          setAddedContacts={setAddedContacts}
        >
          {!isDesktop && (
            <IconButton onClick={() => setOpenDrawer(true)}>
              <FilterAltIcon />
            </IconButton>
          )}
          <TextField
            label="Search"
            variant="filled"
            value={filter.search}
            onChange={(e) => patchFilter({ search: e.target.value })}
          />
        </ContactsList>

        <TablePagination
          component="div"
          count={contactsCount}
          page={page}
          onPageChange={(_, newPage) => {
            setPage(newPage)
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </Grid>
    </Grid>
  )
}
