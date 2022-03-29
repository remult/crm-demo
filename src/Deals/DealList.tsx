import { Button, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { remult } from "../common"
import { Deal } from "./Deal.entity"
import AddIcon from '@mui/icons-material/Add';
import { DealEdit } from "./DealEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSearchParams } from "react-router-dom";
import CancelIcon from '@mui/icons-material/Cancel';
import { DealStages } from "./DealStage";
import { DealTypes } from "./DealType";


const amRepo = remult.repo(Deal);

export const DealsList: React.FC<{}> = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const filter = {
        search: searchParams.get("search") || '',
        type: searchParams.get("type") || '',
        stage: searchParams.get("stage") || ''
    };
    const patchFilter = (f: Partial<typeof filter>) => {
        setSearchParams({ ...filter, ...f });
    }

    const [deals, setDeals] = useState<Deal[]>([]);
    const loadDeals = useCallback(() => amRepo.find({
        where: {
            name: filter.search ? { $contains: filter.search } : undefined,
            type: filter.type ? filter.type : undefined,
            stage: filter.stage ? filter.stage : undefined
        }, limit: 5
    }).then(setDeals), [filter.search, filter.type, filter.stage]);
    useEffect(() => {
        loadDeals()
    }, [loadDeals]);
    const [editDeal, setEditDeal] = useState<Deal>();
    const deleteDeal = async (deletedDeal: Deal) => {
        await amRepo.delete(deletedDeal);
        setDeals(deals.filter(deal => deletedDeal.id !== deal.id));
    }
    const editDealSaved = (editDeal: Deal) =>
        setDeals(deals.map(deal => deal.id === editDeal.id ? editDeal : deal));

    return <Grid container spacing={2}>
        <Grid item xs={2}>
            <TextField label="Search" variant="filled"
                value={filter.search}
                onChange={e =>
                    patchFilter({ search: e.target.value })
                } />
            <List dense={true}>
                <ListItem>
                    <ListItemText>Type</ListItemText>
                </ListItem>
                {DealTypes.map((s) => (<ListItem
                    key={s}
                    secondaryAction={s.toString() === filter.type &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            patchFilter({ type: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        patchFilter({ type: s });
                    }}>
                        <ListItemText
                            primary={s}
                        />
                    </ListItemButton>
                </ListItem>))}
                <ListItem>
                    <ListItemText>Stage</ListItemText>
                </ListItem>
                {DealStages.map((s) => (<ListItem
                    key={s}

                    secondaryAction={s.toString() === filter.stage &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            patchFilter({ stage: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        patchFilter({ stage: s });
                    }}>
                        <ListItemText

                            primary={s}

                        />
                    </ListItemButton>
                </ListItem>))}
            </List>
        </Grid>
        <Grid item xs={10}>
            <Button
                variant="contained"
                onClick={() => setEditDeal(new Deal())}
                startIcon={<AddIcon />}>
                Add Deal
            </Button>
            <List>
                {deals.map(deal => (
                    <ListItem disablePadding key={deal.id} secondaryAction={
                        <Stack direction="row" spacing={2}>
                            <IconButton edge="end" aria-label="edit"
                                onClick={() => deleteDeal(deal)}>
                                <DeleteIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="edit"
                                onClick={() => setEditDeal(deal)}>
                                <EditIcon />
                            </IconButton>
                        </Stack>
                    }>
                        <ListItemButton >
                            <ListItemText primary={deal.name} />
                        </ListItemButton>
                    </ListItem>
                ))}

            </List>
            {
                editDeal && <DealEdit
                    deal={editDeal}
                    onClose={() => setEditDeal(undefined)}
                    onSaved={(deal) => {
                        editDealSaved(deal)
                    }} />
            }

        </Grid>
    </Grid >
}