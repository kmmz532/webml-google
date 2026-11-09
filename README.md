# webml-google

Gmail向けのプレーンテキストメール作成Webクライアント。HTMLメールを避けたい場面で、本文を `text/plain; charset=UTF-8` として扱う。

## Features

- [x] モバイルファーストのメール作成UI
- [x] 宛先・件名・本文の入力とブラウザ内自動保存
- [x] TXT形式で下書きエクスポート
- [x] Google Identity Services OAuth接続（`gmail.send` scope）
- [x] Gmail API経由のプレーンテキスト送信
- [x] RFC 5322形式を意識したヘッダとMIME bodyの生成
- [ ] Gmail上の下書き作成・返信・スレッド対応
- [ ] PWA（manifest / service worker / installability）

## Development

```sh
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` の `VITE_GOOGLE_CLIENT_ID` にGoogle Cloud Consoleで作成したWeb OAuth Client IDを設定する。これは公開されるClient IDであり、**Client Secretはフロントエンドに絶対に置かない**。

Google Cloud Console側で以下を設定する:

1. Gmail APIを有効化
2. OAuth consent screenを設定
3. OAuth Clientを「Web application」で作成
4. Authorized JavaScript originsにローカル開発元（例: `http://localhost:5173`）と公開元（例: `https://kmmz.jp`）を登録

本アプリはブラウザでGISのToken Modelを使い、必要時に `gmail.send` だけ許可を求める。Access tokenはReact state上に一時保持し、localStorageには保存しない。送信時は確認ダイアログを表示する。

Build:

```sh
npm run build
```

## Deploy

GitHub Actions workflow `.github/workflows/deploy.yml` builds and deploys to Pages. Repository settings should use **Pages → Build and deployment → Source: GitHub Actions**.

## Message format

送信メッセージはRFC 5322形式の基本ヘッダ、UTF-8 plain text MIME bodyを生成し、Gmail APIの `messages.send` に渡すbase64url形式へ変換する。Gmail側で送信処理・配送を行う。

現在は新規送信のみ。返信に必要な `In-Reply-To` / `References` / `threadId` を扱う返信機能はまだ未実装で、RFC全体に対する完全適合を主張するものではない。宛先パーサーも現在は単純なメールアドレス形式に限定。

## Security

Never commit OAuth Client Secrets or access tokens. The OAuth Client ID is public configuration; it is not a secret.
