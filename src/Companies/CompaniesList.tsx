import { Button, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { remult } from "../common"
import { Company } from "./Company.entity"
import AddIcon from '@mui/icons-material/Add';
import { CompanyEdit } from "./CompanyEdit";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSearchParams } from "react-router-dom";
import { CompanySize } from "./CompanySize";
import CancelIcon from '@mui/icons-material/Cancel';
import { sectors } from "./Sectors";
import { Link } from 'react-router-dom';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList } from "react-window";
import { Paginator } from "remult";


const amRepo = remult.repo(Company);

export const CompaniesList: React.FC<{}> = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const filter = {
        search: searchParams.get("search") || '',
        size: searchParams.get("size") || '',
        sector: searchParams.get("sector") || ''
    };
    const patchFilter = (f: Partial<typeof filter>) => {
        setSearchParams({ ...filter, ...f });
    }

    const [companies, setCompanies] = useState<{ companies: Company[], paginator?: Paginator<Company> }>({
        companies: []
    });

    useEffect(() => {
        (async () => {
            const paginator = await amRepo.query({
                where: {
                    name: { $contains: filter.search },
                    size: filter.size ? CompanySize.helper.byId(filter.size) : undefined,
                    sector: filter.sector ? filter.sector : undefined
                }, pageSize: 50
            }).paginator();
            setCompanies({ companies: paginator.items, paginator: paginator });
        })();
    }, [filter.search, filter.size, filter.sector]);

    const itemCount = companies.paginator ? (companies.paginator.hasNextPage ? companies.companies.length + 1 : companies.companies.length) : 0;

    const loadMoreItems = async () => {
        if (companies.paginator) {
            const newPaginator = await companies.paginator.nextPage();
            setCompanies({ companies: [...companies.companies, ...newPaginator.items], paginator: newPaginator });
        }
    }

    const isItemLoaded = (index: number) => !!companies.paginator && (!companies.paginator.hasNextPage || index < companies.companies.length);

    const [editCompany, setEditCompany] = useState<Company>();
    const deleteCompany = async (deletedCompany: Company) => {
        await amRepo.delete(deletedCompany);
        setCompanies({ companies: companies.companies.filter(company => deletedCompany.id != company.id), paginator: companies.paginator });
    }
    const editCompanySaved = (editCompany: Company) =>
        setCompanies({ companies: companies.companies.map(company => company.id === editCompany.id ? editCompany : company), paginator: companies.paginator });

    return <Grid container spacing={2}>
        <Grid item xs={2}>
            <TextField label="Search" variant="filled"
                value={filter.search}
                onChange={e =>
                    patchFilter({ search: e.target.value })
                } />
            <List dense={true}>
                <ListItem>
                    <ListItemText>SIZE</ListItemText>
                </ListItem>
                {CompanySize.helper.getOptions().map((s: CompanySize) => (<ListItem
                    key={s.id}

                    secondaryAction={s.id.toString() == filter.size &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            patchFilter({ size: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        patchFilter({ size: s.id.toString() });
                    }}>
                        <ListItemText
                            primary={s.caption}
                        />
                    </ListItemButton>
                </ListItem>))}
                <ListItem>
                    <ListItemText>SECTOR</ListItemText>
                </ListItem>
                {sectors.map((s) => (<ListItem
                    key={s}

                    secondaryAction={s.toString() == filter.sector &&
                        <IconButton edge="end" aria-label="cancel" onClick={() => {
                            patchFilter({ sector: '' })
                        }}>
                            <CancelIcon />
                        </IconButton>
                    }>
                    <ListItemButton onClick={() => {
                        patchFilter({ sector: s });
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
                onClick={() => setEditCompany(new Company())}
                startIcon={<AddIcon />}>
                Add Company
            </Button>
            <List>
                {companies.paginator ? (<
                    InfiniteLoader
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                >
                    {({ onItemsRendered, ref }) => (
                        <FixedSizeList
                            className="List"
                            height={1000}
                            itemCount={itemCount}
                            itemSize={50}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                            width={"100%"}
                        >
                            {({ index, style }) => {
                                if (!isItemLoaded(index)) {
                                    return <div style={style}>Loading...</div>
                                }
                                else {
                                    const company = companies.companies[index];
                                    return <div style={style}><ListItem disablePadding key={company.id} secondaryAction={
                                        <Stack direction="row" spacing={2}>
                                            <IconButton edge="end" aria-label="edit"
                                                onClick={() => deleteCompany(company)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="edit"
                                                onClick={() => setEditCompany(company)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Stack>
                                    }>
                                        <ListItemButton component={Link} to={`/companies/${company.id}`}>
                                            <ListItemText primary={company.name} />
                                        </ListItemButton>
                                    </ListItem></div>
                                }
                            }}
                        </FixedSizeList>
                    )}
                </InfiniteLoader>) : null}
            </List>
            {
                editCompany && <CompanyEdit
                    company={editCompany}
                    onClose={() => setEditCompany(undefined)}
                    onSaved={(company) => {
                        editCompanySaved(company)
                    }} />
            }

        </Grid>
    </Grid >
}