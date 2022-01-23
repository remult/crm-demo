import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompaniesList } from './Companies/CompaniesList';
import { ContactsPage } from './Contacts/ConactsPage';
import { CompanyShow } from './Companies/CompanyShow';
import { AppBar, Avatar, Box, Button, Card, CssBaseline, GlobalStyles, IconButton, Menu, MenuItem, Stack, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { ContactShow } from './Contacts/ContactShow';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { LocalizationProvider } from '@mui/lab';
import { SignInController } from './SignIn/SignIn.controller';
import { ErrorInfo } from 'remult';
import LockIcon from '@mui/icons-material/Lock';
import { auth, remult } from './common';
import { AccountManager } from './AccountManagers/AccountManager.entity';

function App() {
  const [currentUser, setCurrentUser] = useState<AccountManager>();
  const [state, setState] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<ErrorInfo<SignInController>>();
  const signIn = async () => {
    setErrors(undefined);
    const signIn = new SignInController(remult);
    signIn.username = state.username;
    signIn.password = state.password;
    try {
      auth.setAuthToken(await signIn.signIn());

    }
    catch (err: any) {
      setErrors(err);
    }
  }
  useEffect(() => {
    let unobserve = () => { };
    remult.userChange.observe(() => {
      if (!remult.authenticated())
        setCurrentUser(undefined);
      else
        remult.repo(AccountManager).findId(remult.user.id).then(setCurrentUser);
    }).then(x => unobserve = x);
    return () => {
      unobserve();
    }
  }, []);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


  if (!currentUser)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: { background: "#313264" }
          }}
        />
        <Card sx={{ width: 300, m: 2, flexGrow: 0, height: 'fix-content' }} >
          <Box
            component="form"
            sx={{ p: 1 }}
            noValidate
            autoComplete="off"
          >


            <Stack spacing={4}>
              <Box display="flex" justifyContent="center">
                <Avatar>
                  <LockIcon />
                </Avatar>
              </Box>
              <TextField
                autoFocus
                variant="standard"
                label="Username"
                error={Boolean(errors?.modelState?.username)}
                helperText={errors?.modelState?.username}
                fullWidth
                value={state.username}
                onChange={e => setState({ ...state, username: e.target.value })}
              />
              <TextField
                autoFocus
                type="password"
                variant="standard"
                label="Password"
                error={Boolean(errors?.modelState?.password)}
                helperText={errors?.modelState?.password}
                fullWidth
                value={state.password}
                onChange={e => setState({ ...state, password: e.target.value })}
              />
              <Typography color="error" variant="body1">{!errors?.modelState && errors?.message}</Typography>
              <Button variant="contained" onClick={signIn}>SIGN IN</Button>
            </Stack></Box>
        </Card>
      </Box>)

  return (
    <React.Fragment>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { backgroundColor: "#fafafa" }
        }}
      />

      <LocalizationProvider dateAdapter={DateAdapter}>
        <AppBar position="static" sx={{ mb: 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CRM
            </Typography>
            <Button color="inherit" component={Link} to={`/companies`} >Companies</Button>
            <Button color="inherit" component={Link} to={`/contacts`} >Contacts</Button>
            <Button color="inherit" component={Link} to={`/accountManagers`} >Account Managers</Button>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={currentUser.firstName + " " + currentUser.lastName}>
                <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar alt={currentUser.firstName + " " + currentUser.lastName} src={"/static/images/avatar/2.jpg"} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
              >
                <MenuItem onClick={() => {
                  setAnchorElUser(null);
                  auth.signOut();
                }}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>

              </Menu>
            </Box>
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
      </LocalizationProvider>
    </React.Fragment>
  );
}

export default App;
