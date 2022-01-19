import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Card, CardContent, Stack, Tab, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { remult } from "../common";
import { Contact } from "../Contacts/Contact.entity";
import { ContactsList } from "../Contacts/ContactsList";
import { Company } from "./Company.entity";
import { CompanyAside } from "./CompanyAside";
import { Logo } from "./Logo";

export const CompanyShow: React.FC<{}> = () => {
    let params = useParams();
    const [company, setCompany] = useState<Company>();
    const [contacts, setContacts] = useState<Contact[]>([]);

    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = React.useState('1');

    useEffect(() => {
        (async () => {
            const company = await remult.repo(Company).findId(params.id!);
            setCompany(company);
            if (company) {
                setContacts(await remult.repo(Contact).find({ where: { company } }));
            }
            setLoading(false)
        })();
    }, [params.id]);
    if (loading)
        return <span>Loading</span>;
    if (!company)
        return <span>not found</span>;
    return <Box display="flex">
        <Box flex="1">
            <Card>
                <CardContent>
                    <Stack>
                        <Stack direction="row">
                        <Logo url={company.logo} title={company.name} sizeInPixels={42}/>
                            <Stack sx={{ ml: 1 }} alignItems='flex-start'>
                                <Typography variant="h5">
                                    {company.name}
                                </Typography>
                                <Typography variant="body1">
                                    {company.sector}, {company.size?.caption}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={currentTab}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={(_, v) => setCurrentTab(v)} aria-label="lab API tabs example">
                                        <Tab label="Contacts" value="1" />
                                        <Tab label="Deals" value="2" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">
                                    <ContactsList contacts={contacts} setContacts={setContacts} defaultCompany={company} />
                                </TabPanel>
                                <TabPanel value="2">Item Two</TabPanel>
                            </TabContext>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
        <CompanyAside company={company} setCompany={setCompany}></CompanyAside>
    </Box>
}

