import {
  Box,
  Typography,
  Divider,
  Link,
  Button,
  Chip,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  DialogTitle,
  TextField
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { FormEvent, useEffect, useState } from 'react'
import { Contact, ContactWithTags } from './Contact.entity'
import { ContactEdit } from './ContactEdit'
import { Gender } from './Gender'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import { colors, Tag } from './Tag.entity'
import { ContactTag, ContactTagWithTag } from './ContactTag.entity'
import { remult } from 'remult'
import { useIsDesktop } from '../utils/useIsDesktop'

const tagsRepo = remult.repo(Tag)
const contactTagsRepo = remult.repo(ContactTag)
export const ContactAside = ({
  contact,
  setContact,
  link = 'edit'
}: {
  contact: ContactWithTags
  setContact: (contact: ContactWithTags) => void
  link?: string
}) => {
  const [editContact, setEditContact] = useState<ContactWithTags>()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [contactTags, setContactTags] = useState<ContactTagWithTag[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const unselectedTagIds: Tag[] = allTags.filter(
    (t) => !contactTags.find((ct) => ct.tag === t.id)
  )
  useEffect(() => {
    setContactTags(contact.tags2)
    tagsRepo.find().then(setAllTags)
  }, [contact])

  const handleDeleteTag = async (contactTagToDelete: ContactTag) => {
    await contactTagsRepo.delete(contactTagToDelete)
    setContactTags(contactTags.filter((t) => t !== contactTagToDelete))
  }
  const handleAddTag = async (tag: Tag) => {
    setContactTags([
      ...contactTags,
      {
        ...(await contactTagsRepo.insert({
          contact: contact.id,
          tag: tag.id
        })),
        tag2: tag
      }
    ])
    setAnchorEl(null)
  }
  const isDesktop = useIsDesktop()

  const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const handleOpenCreateDialog = () => {
    setCreateTagDialogOpen(true)
    setAnchorEl(null)
    setIsSaving(false)
  }

  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(colors[0])
  const handleCreateTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const newTag = await tagsRepo.insert({
        tag: newTagName,
        color: newTagColor
      })
      setAllTags([...allTags, newTag])
      handleAddTag(newTag)
      setCreateTagDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return contact ? (
    <>
      <Box
        ml={isDesktop ? 4 : undefined}
        width={isDesktop ? 250 : undefined}
        minWidth={isDesktop ? 250 : undefined}
      >
        <Box textAlign="center" mb={2}>
          {link === 'edit' ? (
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditContact(contact)}
            >
              Edit Contact
            </Button>
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

        <Box mt={2}>{contact.background}</Box>

        <Box mt={1}>
          <Typography variant="body1" color="textSecondary" component="span">
            Added on{' '}
            {contact.createdAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <br />
          <Typography variant="body1" color="textSecondary" component="span">
            Last seen on{' '}
            {contact.lastSeen.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>

        <Typography variant="subtitle2">Tags</Typography>
        <Divider />
        {contactTags.map((contactTag) => (
          <Box mt={1} mb={1} key={contactTag.id}>
            <Chip
              size="small"
              variant="outlined"
              onDelete={() => handleDeleteTag(contactTag)}
              label={contactTag.tag2.tag}
              style={{ backgroundColor: contactTag.tag2.color, border: 0 }}
            />
          </Box>
        ))}
        <Box mt={1}>
          <Chip
            icon={<ControlPointIcon />}
            size="small"
            variant="outlined"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            label="Add tag"
            color="primary"
          />
        </Box>
        <Menu
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorEl={anchorEl}
        >
          {unselectedTagIds?.map((tag) => (
            <MenuItem key={tag.tag} onClick={() => handleAddTag(tag)}>
              <Chip
                size="small"
                variant="outlined"
                label={tag.tag}
                style={{
                  backgroundColor: tag.color,
                  border: 0
                }}
              />
            </MenuItem>
          ))}
          <MenuItem onClick={handleOpenCreateDialog}>
            <Chip
              icon={<EditIcon />}
              size="small"
              variant="outlined"
              onClick={handleOpenCreateDialog}
              color="primary"
              label="Create new tag"
            />
          </MenuItem>
        </Menu>
        <Dialog
          open={createTagDialogOpen}
          onClose={() => setCreateTagDialogOpen(false)}
          aria-labelledby="form-dialog-title"
        >
          <form onSubmit={handleCreateTag}>
            <DialogTitle id="form-dialog-title">Create a new tag</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                label="Tag name"
                fullWidth
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                sx={{ mt: 1 }}
              />
              <Box display="flex" flexWrap="wrap" width={230} mt={2}>
                {colors.map((color) => (
                  <RoundButton
                    key={color}
                    color={color}
                    selected={color === newTagColor}
                    handleClick={() => {
                      setNewTagColor(color)
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setCreateTagDialogOpen(false)}
                color="primary"
              >
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={isSaving}>
                Add tag
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
      {editContact && (
        <ContactEdit
          contact={editContact}
          onClose={() => setEditContact(undefined)}
          onSaved={(contact) => {
            setContact(contact)
          }}
        />
      )}
    </>
  ) : null
}
const RoundButton = ({
  color,
  handleClick,
  selected
}: {
  color: string
  selected: boolean
  handleClick: () => void
}) => {
  return (
    <button
      type="button"
      style={{
        backgroundColor: color,
        border: selected ? '2px solid grey' : 'none',
        width: 30,
        height: 30,
        borderRadius: 15,
        display: 'inline-block',
        margin: 8
      }}
      onClick={handleClick}
    />
  )
}
