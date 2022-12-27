import { useMediaQuery, useTheme } from '@mui/material'

export function useIsDesktop() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.up('sm'))
}
