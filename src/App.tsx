import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompaniesList } from './Companies/CompaniesList';
import { ContactsPage } from './Contacts/ConactsPage';
import { CompanyShow } from './Companies/CompanyShow';
import { AppBar, Box, Button, CssBaseline, GlobalStyles, Toolbar, Typography } from '@mui/material';
import { ContactShow } from './Contacts/ContactShow';


function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { backgroundColor: "#fafafa" }
        }}
      />

      <AppBar position="static" sx={{ mb: 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CRM
          </Typography>
          <Button color="inherit" component={Link} to={`/companies`} >Companies</Button>
          <Button color="inherit" component={Link} to={`/contacts`} >Contacts</Button>
          <Button color="inherit" component={Link} to={`/accountManagers`} >Account Managers</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 1 }}>
        <Routes>
          <Route path="/" element={<AccountManagersList />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/companies/:id" element={<CompanyShow />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/accountManagers" element={<AccountManagersList />} />
          <Route path="/contacts/:id" element={<ContactShow />} />

        </Routes>
      </Box>
    </React.Fragment>
  );
}

export default App;
