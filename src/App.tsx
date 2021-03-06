import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AccountManagersList } from './AccountManagers/AccountManagersList';
import { CompaniesList } from './Companies/CompaniesList';
import { ContactsPage } from './Contacts/ContactsPage';
import { CompanyShow } from './Companies/CompanyShow';
import { AppBar, Avatar, Box, Button, Card, createTheme, CssBaseline, Drawer, GlobalStyles, IconButton, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Stack, TextField, ThemeProvider, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ContactShow } from './Contacts/ContactShow';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { LocalizationProvider } from '@mui/lab';
import { SignInController } from './SignIn/SignIn.controller';
import { ErrorInfo } from 'remult';
import LockIcon from '@mui/icons-material/Lock';
import { remult, setAuthToken } from './common';
import { AccountManager } from './AccountManagers/AccountManager.entity';
import { DealsList } from './Deals/DealList';
import { DealsKanban } from './Deals/DealsKanban';
import { AdminPage } from './admin/AdminPage';
import MenuIcon from '@mui/icons-material/Menu';
import ReactTable from './admin/ReactTable';
import { PlayForm } from './admin/form';
import { useIsDesktop } from './utils/useIsDesktop';

const theme = createTheme();

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
      setAuthToken(await signIn.signIn());

    }
    catch (err: any) {
      setErrors(err);
    }
  }
  useEffect(() => {
    SignInController.getValidUserName().then(username => setState({ username, password: '123' }));
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

  const isDesktop = useIsDesktop();
  const [openDrawer, setOpenDrawer] = useState(false);

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const routes = useMemo(() => [
    { path: '/', caption: 'Contacts' },
    { path: '/kanban', caption: "Kanban" },
    { path: `/companies`, caption: 'Companies' },
    { path: `/accountManagers`, caption: 'Account Managers' },
    { path: `/deals`, caption: 'Deals' }


  ], [])


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
      <ThemeProvider theme={theme}>

        <CssBaseline />
        <GlobalStyles
          styles={{
            body: { backgroundColor: "#fafafa" }
          }}
        />

        <LocalizationProvider dateAdapter={DateAdapter}>
          <Drawer
            anchor='left'
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
          >
            <List>{routes.map(route => (
              <ListItem key={route.path} disablePadding>
                <ListItemButton component={Link} to={route.path} onClick={() => setOpenDrawer(false)} >
                  <ListItemText primary={route.caption} />
                </ListItemButton>
              </ListItem>
            ))}

            </List>
          </Drawer>
          <AppBar position="static" sx={{ mb: 1 }}>
            <Toolbar>
              {!isDesktop && <IconButton aria-label="menu" color='inherit'
                onClick={() => setOpenDrawer(true)}>
                <MenuIcon />
              </IconButton>}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                CRM
              </Typography>

              {isDesktop && routes.map(route => (
                <Button color="inherit" key={route.path} component={Link} to={route.path} >{route.caption}</Button>
              ))}


              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title={currentUser.firstName + " " + currentUser.lastName}>
                  <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                    <Avatar alt={currentUser.firstName + " " + currentUser.lastName} src={currentUser.avatar} />
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
                    setAuthToken(null);
                  }}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>

                </Menu>
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ p: 1 }}>
            <Routes>
              <Route path="/" element={<ContactsPage />} />
              <Route path="/kanban" element={<DealsKanban />} />
              <Route path="/companies" element={<CompaniesList />} />
              <Route path="/companies/:id" element={<CompanyShow />} />
              <Route path="/deals" element={<DealsList />} />
              <Route path="/accountManagers" element={<AccountManagersList />} />
              <Route path="/contacts/:id" element={<ContactShow />} />
              <Route path='/admin' element={<AdminPage />} />
              <Route path='/react-table' element={<ReactTable />} />
              <Route path='/form' element={<PlayForm />} />

            </Routes>
          </Box>
        </LocalizationProvider>
      </ThemeProvider>
    </React.Fragment >
  );
}

export default App;
