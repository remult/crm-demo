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
import { remult } from 'remult'
import { Contact, ContactWithTags } from '../Contacts/Contact.entity'
import { ContactsList } from '../Contacts/ContactsList'
import { Deal } from '../Deals/Deal.entity'
import { useIsDesktop } from '../utils/useIsDesktop'
import { Company } from './Company.entity'
import { CompanyAside } from './CompanyAside'
import { Logo } from './Logo'
import { specialRepo } from '../dev-remult/relations'

export const CompanyShow: React.FC<{}> = () => {
  let params = useParams()
  const [company, setCompany] = useState<Company>()
  const [contacts, setContacts] = useState<ContactWithTags[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = React.useState('1')

  const isDesktop = useIsDesktop()

  useEffect(() => {
    ;(async () => {
      const company = await remult.repo(Company).findId(params.id!)
      setCompany(company)
      setLoading(false)
      if (company) {
        try {
          setLoadingContacts(true)
          setContacts(
            await specialRepo(Contact).find({
              where: { company },
              with: { tags2: true }
            })
          )
          setDeals(await remult.repo(Deal).find({ where: { company } }))
        } finally {
          setLoadingContacts(false)
        }
      }
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
                      contacts={contacts}
                      setContacts={setContacts}
                      defaultCompany={company}
                      loading={loadingContacts}
                    />
                  </TabPanel>
                  <TabPanel value="2">
                    <List>
                      {deals.map((deal, index) => (
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
      <CompanyAside company={company} setCompany={setCompany}></CompanyAside>
    </Stack>
  )
}
