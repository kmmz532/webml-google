import { useState } from 'react'
import {
  AppBar, Avatar, Box, Button, Chip, Divider, IconButton, Paper,
  Stack, TextField, Toolbar, Typography,
} from '@mui/material'
import {
  Add, ArrowBack, AttachFile, DeleteOutline, HelpOutline,
  MoreVert, Send, Settings, StarBorder,
} from '@mui/icons-material'

export default function App() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState('')

  const handleDraft = () => {
    const draft = `To: ${to}\nSubject: ${subject}\nContent-Type: text/plain; charset=UTF-8\n\n${body}`
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mail-draft.txt'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('プレーンテキストの下書きを保存したよ（まだGmail送信は未接続）')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <Avatar sx={{ bgcolor: '#1967d2', width: 34, height: 34, fontSize: 16 }}>m</Avatar>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, flexGrow: 1 }}>
            webml-google
          </Typography>
          <IconButton aria-label="ヘルプ"><HelpOutline /></IconButton>
          <IconButton aria-label="設定"><Settings /></IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#7e57c2' }}>ぴ</Avatar>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', gap: 2, p: { xs: 1.5, md: 3 }, maxWidth: 1440, mx: 'auto' }}>
        <Box sx={{ width: { xs: 56, sm: 220 }, flexShrink: 0 }}>
          <Button
            variant="contained" startIcon={<Add />}
            sx={{ borderRadius: 4, px: { xs: 1.5, sm: 2.5 }, py: 1.8, minWidth: 0, boxShadow: 1 }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>作成</Box>
          </Button>
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Chip icon={<Send />} label="送信" variant="outlined" sx={{ justifyContent: 'flex-start', px: 1 }} />
            <Chip icon={<StarBorder />} label="スター付き" variant="outlined" sx={{ justifyContent: 'flex-start', px: 1, display: { xs: 'none', sm: 'flex' } }} />
          </Stack>
        </Box>

        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 3, p: { xs: 2, sm: 3 }, minHeight: 580 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <IconButton size="small" aria-label="戻る"><ArrowBack /></IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontSize: 19 }}>新規メッセージ</Typography>
            <IconButton size="small" aria-label="その他"><MoreVert /></IconButton>
          </Stack>
          <Divider />
          <TextField
            fullWidth variant="standard" placeholder="宛先"
            value={to} onChange={(event) => setTo(event.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ py: 1.5 }}
          />
          <Divider />
          <TextField
            fullWidth variant="standard" placeholder="件名"
            value={subject} onChange={(event) => setSubject(event.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ py: 1.5 }}
          />
          <Divider />
          <TextField
            fullWidth multiline minRows={14} variant="standard"
            placeholder="メッセージを入力…"
            value={body} onChange={(event) => setBody(event.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ py: 2, '& textarea': { fontFamily: 'monospace', lineHeight: 1.7 } }}
          />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" endIcon={<Send />} onClick={handleDraft} sx={{ borderRadius: 5, px: 3 }}>
              下書きTXTを保存
            </Button>
            <IconButton aria-label="添付（未実装）" disabled><AttachFile /></IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-label="削除" onClick={() => { setTo(''); setSubject(''); setBody(''); setNotice('入力内容をクリアしたよ') }}>
              <DeleteOutline />
            </IconButton>
          </Stack>
          {notice && <Typography role="status" variant="body2" color="text.secondary" sx={{ mt: 2 }}>{notice}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            現在はUI試作。Gmail APIによる送信はまだ実装していません。
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}