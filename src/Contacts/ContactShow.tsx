import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Link,
  Stack,
  FormControl,
  InputLabel
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { remult } from 'remult'
import { Contact, ContactWithTags } from '../Contacts/Contact.entity'
import { ContactNote } from './ContactNote.entity'
import { ContactAside } from './ContactAside'
import { Logo } from '../Companies/Logo'
import { StatusIndicator } from './StatusIndicator'

import { Status } from './Status'
import { Note } from './Note'
import { getValueList } from 'remult'
import { useIsDesktop } from '../utils/useIsDesktop'
import { InstanceTypeWithRelations, specialRepo } from '../dev-remult/relations'

export const ContactShow: React.FC<{}> = () => {
  let params = useParams()
  const [contact, setContact] = useState<
    InstanceTypeWithRelations<
      typeof Contact,
      {
        company2: true
        notes: {
          with: {
            accountManager2: true
          }
        }
        tags2: {
          with: {
            tag2: true
          }
        }
      }
    >
  >()

  const [loading, setLoading] = useState(true)

  const [newNote, setNewNote] = useState(new ContactNote())

  const submitNewNote = async () => {
    const submittedNote = await remult
      .repo(ContactNote)
      .insert({ ...newNote, contact: contact!.id! })
    setContact({
      ...contact!,
      notes: [
        {
          ...submittedNote,
          accountManager2: (await specialRepo(
            ContactNote
          ).relations.accountManager2(submittedNote))!
        },
        ...contact!.notes
      ]
    })
    setNewNote(new ContactNote())
  }

  useEffect(() => {
    ;(async () => {
      const contact = await specialRepo(Contact).findId(params.id!, {
        with: {
          tags2: {
            with: {
              tag2: true
            }
          },
          company2: true,
          notes: {
            with: {
              accountManager2: true
            }
          }
        }
      })
      setContact(contact)
      setLoading(false)
    })()
  }, [params.id])
  const isDesktop = useIsDesktop()

  if (loading) return <span>Loading</span>
  if (!contact) return <span>not found</span>

  return (
    <Box mt={2} display="flex">
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
                  {contact.title} at{' '}
                  <Link
                    component={RouterLink}
                    to={`/companies/${contact.company}`}
                  >
                    {contact.company2?.name}
                  </Link>
                </Typography>
              </Box>
              <Box>
                {contact.company && (
                  <Logo
                    url={contact.company2!.logo}
                    title={contact.company2!.name}
                    sizeInPixels={20}
                  />
                )}
              </Box>
            </Box>
            {!isDesktop && (
              <Box>
                <ContactAside
                  contact={contact}
                  setContact={(c) => setContact({ ...contact!, ...c })}
                ></ContactAside>
              </Box>
            )}

            <Box mt={2}>
              <TextField
                label="Add a note"
                size="small"
                fullWidth
                multiline
                value={newNote.text}
                variant="filled"
                onChange={(e: any) =>
                  setNewNote({ ...newNote, text: e.target.value })
                }
                rows={3}
              />

              <Box mt={1} display="flex">
                <Stack direction="row" spacing={1} flex={1}>
                  <FormControl
                    sx={{
                      flexGrow: 1,
                      visibility: newNote.text ? 'visible' : 'hidden'
                    }}
                    size="small"
                    variant="filled"
                  >
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      label="Status"
                      value={newNote.status?.id}
                      onChange={(e) =>
                        setNewNote({
                          ...newNote,
                          status: getValueList(Status).find(
                            (item) => item.id === e.target.value
                          )!
                        })
                      }
                      disabled={!newNote.text || loading}
                    >
                      {getValueList(Status).map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {' '}
                          <Box component="span" sx={{ mr: 1 }}>
                            {s.caption}{' '}
                          </Box>{' '}
                          <StatusIndicator status={s} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {isDesktop && (
                    <TextField
                      variant="filled"
                      sx={{
                        flexGrow: 1,
                        visibility: newNote.text ? 'visible' : 'hidden'
                      }}
                      size="small"
                      type="datetime-local"
                      disabled={!newNote.text || loading}
                      value={newNote.createdAt
                        .toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                        .replace(' ', 'T')}
                      onChange={(e) =>
                        setNewNote({
                          ...newNote,
                          createdAt: new Date(e.target.value)
                        })
                      }
                    />
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!newNote.text || loading}
                    onClick={() => submitNewNote()}
                  >
                    Add this note
                  </Button>
                </Stack>
              </Box>
            </Box>

            {contact.notes.map((note) => (
              <Box key={note.id} mt={2}>
                {note.accountManager2?.firstName} added a note on{' '}
                {note.createdAt.toLocaleString()}{' '}
                <StatusIndicator status={note.status} />
                <Note
                  note={note}
                  onDelete={(note) =>
                    setContact({
                      ...contact!,
                      notes: contact.notes.filter((n) => n !== note)
                    })
                  }
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
      {isDesktop && (
        <ContactAside
          contact={contact}
          setContact={(c) => setContact({ ...contact, ...c })}
        ></ContactAside>
      )}
    </Box>
  )
}
