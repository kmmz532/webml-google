import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1967d2' },
    background: { default: '#f6f8fc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Google Sans", "Noto Sans JP", Roboto, Arial, sans-serif',
  },
  shape: { borderRadius: 14 },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)