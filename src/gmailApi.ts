export type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (error: { type: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

export function requestGmailAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient
    if (!tokenClient) {
      reject(new Error('Google Identity Servicesが読み込まれていないよ'))
      return
    }
    if (!clientId.trim()) {
      reject(new Error('OAuth Client IDを設定してね'))
      return
    }

    const client = tokenClient({
      client_id: clientId,
      scope: GMAIL_SEND_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || '認証に失敗したよ'))
          return
        }
        resolve(response.access_token)
      },
      error_callback: (error) => reject(new Error(`Google認証を開始できなかったよ: ${error.type}`)),
    })
    client.requestAccessToken()
  })
}

export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string }> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Gmailアカウント情報を取得できなかったよ')
  return response.json()
}

export async function sendGmailRaw(accessToken: string, raw: string): Promise<string> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.error?.message || `Gmail送信に失敗したよ (HTTP ${response.status})`)
  }
  const result = await response.json()
  return result.id as string
}
