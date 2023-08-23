import { TabContext, TabList, TabPanel } from '@mui/lab'
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tab,
  Typography
} from '@mui/material'
import { formatDistance } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ContactsList } from '../Contacts/ContactsList'
import { useIsDesktop } from '../utils/useIsDesktop'
import { Company } from './Company.entity'
import { CompanyAside } from './CompanyAside'
import { Logo } from './Logo'
import { InstanceTypeWithRelations, specialRepo } from '../dev-remult/relations'

export const CompanyShow: React.FC<{}> = () => {
  let params = useParams()
  const [company, setCompany] = useState<
    InstanceTypeWithRelations<
      typeof Company,
      {
        deals: true
        contacts: {
          with: {
            company2: true
            tags2: {
              with: {
                tag2: true
              }
            }
          }
        }
      }
    >
  >()

  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = React.useState('1')

  const isDesktop = useIsDesktop()

  useEffect(() => {
    ;(async () => {
      const company = await specialRepo(Company).findId(params.id!, {
        with: {
          deals: true,
          contacts: {
            with: {
              tags2: { with: { tag2: true } },
              company2: true
            }
          }
        }
      })
      setCompany(company)
      setLoading(false)
    })()
  }, [params.id])
  if (loading) return <span>Loading</span>
  if (!company) return <span>not found</span>
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }}>
      <Box flex="1">
        <Card>
          <CardContent>
            <Stack>
              <Stack direction="row">
                <Logo
                  url={company.logo}
                  title={company.name}
                  sizeInPixels={42}
                />
                <Stack sx={{ ml: 1 }} alignItems="flex-start">
                  <Typography variant="h5">{company.name}</Typography>
                  <Typography variant="body1">
                    {company.sector}, {company.size?.caption}
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={currentTab}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                      onChange={(_, v) => setCurrentTab(v)}
                      aria-label="lab API tabs example"
                    >
                      <Tab label="Contacts" value="1" />
                      <Tab label="Deals" value="2" />
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    <ContactsList
                      contacts={company.contacts}
                      setContacts={(contacts) =>
                        setCompany({ ...company, contacts })
                      }
                      defaultCompany={company}
                      loading={false}
                    />
                  </TabPanel>
                  <TabPanel value="2">
                    <List>
                      {company.deals.map((deal, index) => (
                        <ListItem disablePadding key={deal.id}>
                          <ListItemButton>
                            <ListItemText
                              primary={`${deal.name}`}
                              secondary={
                                <>
                                  {deal.stage} {deal.amount / 1000}
                                  {'K, '}
                                  {deal.type}
                                </>
                              }
                            />
                            {isDesktop && (
                              <ListItemSecondaryAction>
                                <Typography
                                  variant="body1"
                                  color="textSecondary"
                                >
                                  last activity{' '}
                                  {deal.updatedAt
                                    ? formatDistance(deal.updatedAt, new Date())
                                    : ''}{' '}
                                  ago
                                </Typography>
                              </ListItemSecondaryAction>
                            )}
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </TabPanel>
                </TabContext>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <CompanyAside
        company={company}
        setCompany={(updatedCompany) =>
          setCompany((company) => ({
            ...company!,
            ...updatedCompany
          }))
        }
      ></CompanyAside>
    </Stack>
  )
}
