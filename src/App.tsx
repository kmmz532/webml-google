import { useEffect, useState } from 'react'
import { createRawMessage, parseRecipients } from './gmail'
import { getGmailProfile, requestGmailAccessToken, sendGmailRaw } from './gmailApi'
import {
  AppBar, Box, Button, Divider, IconButton, Paper, Stack, TextField,
  Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import {
  DeleteOutline, MoreVert, SaveAlt,
} from '@mui/icons-material'

const DRAFT_STORAGE_KEY = 'webml-google:draft:v1'

type Draft = { to: string; subject: string; body: string }

function loadDraft(): Draft {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (saved) return { to: '', subject: '', body: '', ...JSON.parse(saved) }
  } catch {
    // Ignore unavailable or malformed local storage.
  }
  return { to: '', subject: '', body: '' }
}

export default function App() {
  const [initialDraft] = useState(loadDraft)
  const [to, setTo] = useState(initialDraft.to)
  const [subject, setSubject] = useState(initialDraft.subject)
  const [body, setBody] = useState(initialDraft.body)
  const [notice, setNotice] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [sending, setSending] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ to, subject, body }))
    } catch {
      setNotice('ブラウザへの自動保存ができなかったよ')
    }
  }, [to, subject, body])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDraft = () => {
    const draft = `宛先: ${to}\n件名: ${subject}\n\n${body}`
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mail-draft.txt'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('プレーンテキストの下書きを保存したよ')
  }

  const connectGmail = async () => {
    try {
      const token = await requestGmailAccessToken(clientId ?? '')
      const profile = await getGmailProfile(token)
      setAccessToken(token)
      setAccountEmail(profile.emailAddress)
      setNotice(`${profile.emailAddress} と接続したよ`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Google認証に失敗したよ')
    }
  }

  const sendMail = async () => {
    if (!accessToken || !accountEmail) {
      setNotice('先にGmailへ接続してね')
      return
    }
    if (!window.confirm(`この内容を ${to} に送信する？`)) return
    setSending(true)
    try {
      const raw = createRawMessage({ from: accountEmail, to: parseRecipients(to), subject, body })
      await sendGmailRaw(accessToken, raw)
      setTo('')
      setSubject('')
      setBody('')
      setNotice('メールを送信したよ')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '送信に失敗したよ')
    } finally {
      setSending(false)
    }
  }

  const clearDraft = () => {
    setTo('')
    setSubject('')
    setBody('')
    setNotice('入力内容をクリアしたよ')
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#f6f8fc', pb: { xs: 10, sm: 3 } }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: '#f6f8fc', color: 'text.primary', borderBottom: '1px solid #e7eaf0' }}
      >
        <Toolbar sx={{ minHeight: { xs: 58, sm: 68 }, px: { xs: 1, sm: 2 }, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
              新規メッセージ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              webml-google · テキストメール
            </Typography>
          </Box>
          <Button size="small" onClick={connectGmail} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            {accountEmail || 'Gmail接続'}
          </Button>
          <IconButton aria-label="下書きTXTを保存" onClick={handleDraft}>
            <SaveAlt />
          </IconButton>
          <IconButton aria-label="その他の操作">
            <MoreVert />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', px: { xs: 1, sm: 2 }, pt: { xs: 1, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            border: { xs: 'none', sm: '1px solid #e5e8ef' },
            borderRadius: { xs: 2.5, sm: 3 },
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="宛先"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            InputProps={{ disableUnderline: true }}
            inputProps={{ 'aria-label': '宛先' }}
            sx={{
              px: { xs: 2, sm: 2.5 }, py: 1.7,
              '& input': { fontSize: 16 },
            }}
          />
          <Divider />
          <TextField
            fullWidth
            variant="standard"
            placeholder="件名"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            InputProps={{ disableUnderline: true }}
            inputProps={{ 'aria-label': '件名' }}
            sx={{
              px: { xs: 2, sm: 2.5 }, py: 1.7,
              '& input': { fontSize: 16 },
            }}
          />
          <Divider />
          <TextField
            fullWidth
            multiline
            minRows={isMobile ? 16 : 20}
            variant="standard"
            placeholder="メッセージを入力…"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            InputProps={{ disableUnderline: true }}
            inputProps={{ 'aria-label': '本文' }}
            sx={{
              px: { xs: 2, sm: 2.5 }, py: 2,
              '& textarea': {
                fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
                fontSize: 16,
                lineHeight: 1.8,
              },
            }}
          />
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, gap: 1 }}
          >
            <Button
              variant="contained"
              onClick={handleDraft}
              startIcon={<SaveAlt />}
              sx={{
                borderRadius: 6,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1.15,
                minHeight: 46,
                boxShadow: 'none',
              }}
            >
              下書きTXTを保存
            </Button>
            <Button variant="outlined" onClick={sendMail} disabled={sending || !accessToken} sx={{ minHeight: 46, borderRadius: 6, textTransform: 'none' }}>
              {sending ? '送信中…' : '送信'}
            </Button>\n            <IconButton aria-label="入力内容を削除" onClick={clearDraft} sx={{ width: 46, height: 46 }}>
              <DeleteOutline />
            </IconButton>
          </Stack>
        </Paper>

        {notice && (
          <Typography role="status" variant="body2" color="text.secondary" sx={{ px: 1, pt: 1.5 }}>
            {notice}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1, pt: 1.5, lineHeight: 1.6 }}>
          {clientId ? 'Gmail OAuth接続を利用できるよ。' : 'Gmail接続には VITE_GOOGLE_CLIENT_ID の設定が必要。'} 下書きはブラウザに自動保存。
        </Typography>
      </Box>

      {isMobile && (
        <Box
          sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            px: 2, pt: 1.25, pb: 'max(10px, env(safe-area-inset-bottom))',
            bgcolor: 'rgba(246,248,252,0.96)',
            borderTop: '1px solid #e7eaf0',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={handleDraft}
            startIcon={<SaveAlt />}
            sx={{ borderRadius: 6, minHeight: 48, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            プレーンテキストで保存
          </Button>
        </Box>
      )}
    </Box>
  )
}
