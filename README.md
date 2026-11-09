# webml-google

Gmail向けのプレーンテキストメール作成Webクライアント。HTMLメールを避けたい場面で、本文を `text/plain; charset=UTF-8` として扱うことを目指す。

## 現在の状態

- [x] React + TypeScript + Vite + MUI のUI土台
- [x] 宛先・件名・本文の入力
- [x] 入力内容をプレーンテキストの下書きファイルとして保存
- [ ] Google OAuth
- [ ] Gmail APIを利用した実送信（`text/plain` MIME）
- [ ] PWA（manifest / service worker / installability）
- [ ] GitHub Pagesデプロイ設定の確認

現時点の「下書きTXTを保存」はGmailへの送信ではない。Gmail API連携は未実装。

## Development

```sh
npm install
npm run dev
```

Build:

```sh
npm run build
```

## Deploy

GitHub Actions workflow `.github/workflows/deploy.yml` builds and deploys to Pages. In the repository settings, configure **Pages → Build and deployment → Source: GitHub Actions**.

## Security notes

OAuth client configuration should use the minimum Gmail scope needed. Never commit client secrets or access tokens.