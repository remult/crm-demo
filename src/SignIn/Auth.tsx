import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CssBaseline,
  GlobalStyles,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { remult, UserInfo } from 'remult'
import App from '../App'
import { AccountManager } from '../AccountManagers/AccountManager.entity'

function Auth() {
  const [signInUsername, setSignInUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentUser, _setCurrentUser] = useState<UserInfo>()
  const [error, setError] = useState<string>()

  const setCurrentUser = (user: UserInfo | undefined) => {
    remult.user = user
    _setCurrentUser(user)
  }
  const signIn = async () => {
    setError(undefined)
    const result = await fetch('/api/signIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: signInUsername })
    })
    if (result.ok) {
      setCurrentUser(await result.json())
      setSignInUsername('')
      setPassword('')
    } else setError(await result.json())
  }
  const signOut = async () => {
    await fetch('/api/signOut', {
      method: 'POST'
    })
    setCurrentUser(undefined)
  }
  useEffect(() => {
    let tryCounter = 0
    function getCurrentUser() {
      fetch('/api/currentUser')
        .then((r) => r.json())
        .then(async (currentUserFromServer) => {
          if (currentUserFromServer) setCurrentUser(currentUserFromServer)
          else setSignInUsername(await AccountManager.getValidUserName())
        })
        .catch(async () => {
          if (tryCounter++ < 10) // retry if dev server is not yet ready
            setTimeout(() => {
              getCurrentUser()
            }, 500)
          else setSignInUsername(await AccountManager.getValidUserName())
        })
    }
    getCurrentUser()
  }, [])
  if (!currentUser)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100vh' }}
      >
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: { background: '#313264' }
          }}
        />
        <Card sx={{ width: 300, m: 2, flexGrow: 0, height: 'fix-content' }}>
          <Box component="form" sx={{ p: 1 }} noValidate autoComplete="off">
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
                fullWidth
                value={signInUsername}
                onChange={(e) => setSignInUsername(e.target.value)}
              />
              <TextField
                type="password"
                variant="standard"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Typography color="error" variant="body1">
                {error}
              </Typography>
              <Button variant="contained" onClick={signIn}>
                SIGN IN
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
    )
  return <App signOut={signOut} />
}
export default Auth
