import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField
} from '@mui/material'
import { useEffect, useState } from 'react'
import { remult } from 'remult'
import { Company } from './Company.entity'
import AddIcon from '@mui/icons-material/Add'
import { CompanyEdit } from './CompanyEdit'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSearchParams } from 'react-router-dom'
import { CompanySize } from './CompanySize'
import CancelIcon from '@mui/icons-material/Cancel'
import { sectors } from './Sectors'
import { Link } from 'react-router-dom'
import InfiniteLoader from 'react-window-infinite-loader'
import { FixedSizeList } from 'react-window'
import { getValueList, Paginator } from 'remult'
import { useIsDesktop } from '../utils/useIsDesktop'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

const amRepo = remult.repo(Company)

export const CompaniesList: React.FC<{}> = () => {
  let [searchParams, setSearchParams] = useSearchParams()
  const filter = {
    search: searchParams.get('search') || '',
    size: searchParams.get('size') || '',
    sector: searchParams.get('sector') || ''
  }
  const [openDrawer, setOpenDrawer] = useState(false)
  const patchFilter = (f: Partial<typeof filter>) => {
    setSearchParams({ ...filter, ...f })
    setOpenDrawer(false)
  }

  const [companies, setCompanies] = useState<{
    companies: Company[]
    paginator?: Paginator<Company>
  }>({
    companies: []
  })

  useEffect(() => {
    ;(async () => {
      const paginator = await amRepo
        .query({
          where: {
            name: { $contains: filter.search },
            size: filter.size
              ? getValueList(CompanySize).find(
                  (item) => item.id === +filter.size
                )
              : undefined,
            sector: filter.sector ? filter.sector : undefined
          },
          pageSize: 50
        })
        .paginator()
      setCompanies({ companies: paginator.items, paginator: paginator })
    })()
  }, [filter.search, filter.size, filter.sector])

  const itemCount = companies.paginator
    ? companies.paginator.hasNextPage
      ? companies.companies.length + 1
      : companies.companies.length
    : 0

  const loadMoreItems = async () => {
    if (companies.paginator) {
      const newPaginator = await companies.paginator.nextPage()
      setCompanies({
        companies: [...companies.companies, ...newPaginator.items],
        paginator: newPaginator
      })
    }
  }

  const isItemLoaded = (index: number) =>
    !!companies.paginator &&
    (!companies.paginator.hasNextPage || index < companies.companies.length)

  const [editCompany, setEditCompany] = useState<Company>()
  const deleteCompany = async (deletedCompany: Company) => {
    await amRepo.delete(deletedCompany)
    setCompanies({
      companies: companies.companies.filter(
        (company) => deletedCompany.id !== company.id
      ),
      paginator: companies.paginator
    })
  }
  const editCompanySaved = (editCompany: Company) =>
    setCompanies({
      companies: companies.companies.map((company) =>
        company.id === editCompany.id ? editCompany : company
      ),
      paginator: companies.paginator
    })

  const isDesktop = useIsDesktop()
  const FilterElement = () => (
    <List dense={true}>
      <ListItem>
        <ListItemText>SIZE</ListItemText>
      </ListItem>
      {getValueList(CompanySize).map((s: CompanySize) => (
        <ListItem
          key={s.id}
          secondaryAction={
            s.id.toString() === filter.size && (
              <IconButton
                edge="end"
                aria-label="cancel"
                onClick={() => {
                  patchFilter({ size: '' })
                }}
              >
                <CancelIcon />
              </IconButton>
            )
          }
        >
          <ListItemButton
            onClick={() => {
              patchFilter({ size: s.id.toString() })
            }}
          >
            <ListItemText primary={s.caption} />
          </ListItemButton>
        </ListItem>
      ))}
      <ListItem>
        <ListItemText>SECTOR</ListItemText>
      </ListItem>
      {sectors.map((s) => (
        <ListItem
          key={s}
          secondaryAction={
            s.toString() === filter.sector && (
              <IconButton
                edge="end"
                aria-label="cancel"
                onClick={() => {
                  patchFilter({ sector: '' })
                }}
              >
                <CancelIcon />
              </IconButton>
            )
          }
        >
          <ListItemButton
            onClick={() => {
              patchFilter({ sector: s })
            }}
          >
            <ListItemText primary={s} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
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
        <Grid item sm={2}>
          <FilterElement />
        </Grid>
      )}
      <Grid item xs={12} sm={10}>
        <Box display="flex" justifyContent="space-between">
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
          <div>
            {isDesktop ? (
              <Button
                variant="contained"
                onClick={() => setEditCompany(new Company())}
                startIcon={<AddIcon />}
              >
                Add Company
              </Button>
            ) : (
              <Button
                onClick={() => setEditCompany(new Company())}
                variant="contained"
              >
                <AddIcon />
              </Button>
            )}
          </div>
        </Box>
        <List>
          {companies.paginator ? (
            <InfiniteLoader
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
                  width={'100%'}
                >
                  {({ index, style }) => {
                    if (!isItemLoaded(index)) {
                      return <div style={style}>Loading...</div>
                    } else {
                      const company = companies.companies[index]
                      return (
                        <div style={style}>
                          <ListItem
                            disablePadding
                            key={company.id}
                            secondaryAction={
                              <Stack direction="row" spacing={2}>
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => deleteCompany(company)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => setEditCompany(company)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemButton
                              component={Link}
                              to={`/companies/${company.id}`}
                            >
                              <ListItemText primary={company.name} />
                            </ListItemButton>
                          </ListItem>
                        </div>
                      )
                    }
                  }}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          ) : null}
        </List>
        {editCompany && (
          <CompanyEdit
            company={editCompany}
            onClose={() => setEditCompany(undefined)}
            onSaved={(company) => {
              editCompanySaved(company)
            }}
          />
        )}
      </Grid>
    </Grid>
  )
}
