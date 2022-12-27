import React, { useMemo, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AccountManagersList } from './AccountManagers/AccountManagersList'
import { CompaniesList } from './Companies/CompaniesList'
import { ContactsPage } from './Contacts/ContactsPage'
import { CompanyShow } from './Companies/CompanyShow'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  createTheme,
  CssBaseline,
  Drawer,
  GlobalStyles,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import { ContactShow } from './Contacts/ContactShow'
import DateAdapter from '@mui/lab/AdapterDateFns'
import { LocalizationProvider } from '@mui/lab'
import { remult } from 'remult'
import { DealsList } from './Deals/DealList'
import { DealsKanban } from './Deals/DealsKanban'
import { AdminPage } from './admin/AdminPage'
import MenuIcon from '@mui/icons-material/Menu'
import ReactTable from './admin/ReactTable'
import { PlayForm } from './admin/form'
import { useIsDesktop } from './utils/useIsDesktop'

const theme = createTheme()

function App({ signOut }: { signOut: VoidFunction }) {
  const isDesktop = useIsDesktop()
  const [openDrawer, setOpenDrawer] = useState(false)

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  )
  const routes = useMemo(
    () => [
      { path: '/', caption: 'Contacts' },
      { path: '/kanban', caption: 'Kanban' },
      { path: `/companies`, caption: 'Companies' },
      { path: `/accountManagers`, caption: 'Account Managers' },
      { path: `/deals`, caption: 'Deals' }
    ],
    []
  )
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: { backgroundColor: '#fafafa' }
          }}
        />

        <LocalizationProvider dateAdapter={DateAdapter}>
          <Drawer
            anchor="left"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
          >
            <List>
              {routes.map((route) => (
                <ListItem key={route.path} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={route.path}
                    onClick={() => setOpenDrawer(false)}
                  >
                    <ListItemText primary={route.caption} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>
          <AppBar position="static" sx={{ mb: 1 }}>
            <Toolbar>
              {!isDesktop && (
                <IconButton
                  aria-label="menu"
                  color="inherit"
                  onClick={() => setOpenDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                CRM
              </Typography>

              {isDesktop &&
                routes.map((route) => (
                  <Button
                    color="inherit"
                    key={route.path}
                    component={Link}
                    to={route.path}
                  >
                    {route.caption}
                  </Button>
                ))}

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title={remult.user!.name!}>
                  <IconButton
                    onClick={(e) => setAnchorElUser(e.currentTarget)}
                    sx={{ p: 0 }}
                  >
                    <Avatar alt={remult.user?.name} src={remult.user!.avatar} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={() => setAnchorElUser(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorElUser(null)
                      signOut()
                    }}
                  >
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
              <Route
                path="/accountManagers"
                element={<AccountManagersList />}
              />
              <Route path="/contacts/:id" element={<ContactShow />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/react-table" element={<ReactTable />} />
              <Route path="/form" element={<PlayForm />} />
            </Routes>
          </Box>
        </LocalizationProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}

export default App
