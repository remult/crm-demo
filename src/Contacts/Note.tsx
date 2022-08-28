import { Box, Button, Card, CardContent, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { ContactNote } from "./ContactNote.entity";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { remult } from "remult";
const contactNoteRepo = remult.repo(ContactNote);

export const Note: React.FC<{ note: ContactNote, onDelete: (note: ContactNote) => void }> = ({ note, onDelete }) => {
    const [isHover, setHover] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [noteText, setNoteText] = useState(note.text);
    const [loading, setLoading] = useState(false);
    const save = async () => {
        try {
            setLoading(true);
            await contactNoteRepo.save({ ...note, text: noteText });
            note.text = noteText;
            setEditing(false);
        } finally {
            setLoading(false);
        }
    }
    const handleDelete = async () => {
        await contactNoteRepo.delete(note);
        onDelete(note);
    }

    return isEditing ? (<Box>
        <TextField
            label="Add a note"
            size="small"
            fullWidth
            multiline
            value={noteText}
            variant="filled"
            onChange={e => setNoteText(e.target.value)}
            minRows={3}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
            <Button
                onClick={() => setEditing(false)}
                color="primary"
            >
                Cancel
            </Button>
            <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading || noteText === note.text}
                onClick={save}
            >
                Update Note
            </Button>
        </Box>
    </Box>)
        :
        (<Card sx={{ backgroundColor: '#edf3f0', p: 2, borderRadius: 2 }}>
            <CardContent 
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}>
                <Stack direction="row">
                    <Typography variant="body1" flex={1} whiteSpace="pre-line" >
                        {note.text}
                    </Typography>
                    <Box flexDirection="column" display="flex" justifyContent={'space-around'} sx={{ visibility: isHover ? 'visible' : 'hidden' }}>
                        <Tooltip title="Edit note">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setEditing(true);
                                    setHover(false);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete note">
                            <IconButton size="small" onClick={handleDelete}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>
            </CardContent >
        </Card >)
}
