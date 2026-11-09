const CRLF = '\r\n'

function rejectHeaderInjection(value: string, label: string): string {
  if (/[\r\n]/.test(value)) throw new Error(`${label}に改行は入れられないよ`)
  return value.trim()
}

export function parseRecipients(value: string): string[] {
  const addresses = value.split(/[;,]/).map((part) => part.trim()).filter(Boolean)
  if (!addresses.length) throw new Error('宛先を入力してね')
  for (const address of addresses) {
    if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(address)) {
      throw new Error(`メールアドレスを確認してね: ${address}`)
    }
  }
  return addresses
}

function encodeHeader(value: string): string {
  const safe = rejectHeaderInjection(value, 'ヘッダ')
  if (/^[\x20-\x7E]*$/.test(safe)) return safe
  const bytes = new TextEncoder().encode(safe)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return `=?UTF-8?B?${btoa(binary)}?=`
}

function base64UrlUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function createRawMessage({
  from,
  to,
  subject,
  body,
}: {
  from: string
  to: string[]
  subject: string
  body: string
}): string {
  const sender = rejectHeaderInjection(from, 'From')
  const recipients = to.map((address) => rejectHeaderInjection(address, 'To'))
  if (!sender || !recipients.length) throw new Error('送信元と宛先が必要だよ')
  const cleanSubject = rejectHeaderInjection(subject, '件名')
  if (!body) throw new Error('本文を入力してね')

  const domain = sender.split('@')[1]
  if (!domain) throw new Error('送信元メールアドレスを確認してね')

  const headers = [
    `From: ${sender}`,
    `To: ${recipients.join(', ')}`,
    `Subject: ${encodeHeader(cleanSubject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ]
  const bodyBytes = new TextEncoder().encode(body.replace(/\r?\n/g, CRLF))
  let binary = ''
  bodyBytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  const encodedBody = btoa(binary).match(/.{1,76}/g)?.join(CRLF) ?? ''
  return base64UrlUtf8(headers.join(CRLF) + CRLF + CRLF + encodedBody)
}
