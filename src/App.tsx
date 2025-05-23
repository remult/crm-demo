import React, { useMemo, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AccountManagersList } from './AccountManagers/AccountManagersList'
import { CompaniesList } from './Companies/CompaniesList'
import { ContactsPage } from './Contacts/ContactsPage'
import { CompanyShow } from './Companies/CompanyShow'
import { ChatPage } from './Chat/ChatPage'
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

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

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
  const [anchorElDevMenu, setAnchorElDevMenu] = useState<Element | null>(null)

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  )
  const routes = useMemo(
    () => [
      { path: '/', caption: 'Contacts' },
      { path: '/kanban', caption: 'Kanban' },
      { path: `/companies`, caption: 'Companies' },
      { path: `/accountManagers`, caption: 'Account Managers' },
      { path: `/deals`, caption: 'Deals' },
      { path: `/chat`, caption: 'Chat' }
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

        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              <Button
                color="inherit"
                onClick={(e) => setAnchorElDevMenu(e.currentTarget)}
              >
                dev
              </Button>
              <Menu
                id="dev-menu"
                anchorEl={anchorElDevMenu}
                keepMounted
                open={Boolean(anchorElDevMenu)}
                onClose={() => setAnchorElDevMenu(null)}
              >
                <MenuItem>
                  <Button
                    component="a"
                    href="https://github.com/remult/crm-demo/blob/master/src/Companies/Company.entity.ts"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Entity
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    component="a"
                    href="/api/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Admin
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    component="a"
                    href="/api/graphql"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Graphql
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    component="a"
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Swagger
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    component="a"
                    href="https://github.com/remult/crm-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source
                  </Button>
                </MenuItem>
              </Menu>

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
              <Route path="/chat" element={<ChatPage />} />
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
