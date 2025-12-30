[README.md](https://github.com/user-attachments/files/24363207/README.md)
# Marinos Away Log V2

横浜F・マリノスの**公式試合データ**を取り込み、ユーザーが「観戦した試合の記録」と「費用（交通費・チケット代など）」を蓄積できるアプリです。  
観戦した試合の**結果（勝敗など）**と**費用（合計・平均・内訳）**を集計・可視化することを最終ゴールにしています。

> このリポジトリは `web-db-user` スキャフォールド（Vite + Express + tRPC + Drizzle）をベースにしています。

---

## Features

### できること（現状）
- 公式試合データの同期（tRPC: `matches.fetchOfficial`）
- 公式試合一覧の表示（`/matches`）
- 試合詳細ページ（観戦ログの追加・編集・削除）※ `userMatches` で管理
- 観戦費用記録（交通費/チケット代/飲食代/その他）
- フィルタリング（期間/対戦相手/Home-Away など）
- **観戦試合の戦績集計**（勝・分・敗・未確定）
- **費用集計**（合計、1試合あたり平均、年別フィルタ）
- **Statsページ**（`/stats`）- 観戦数/勝分敗/費用の集計画面

### これからやること（Post-MVP）
- 費用カテゴリ内訳の可視化
- グラフ/チャート（勝率推移、月別支出など）
- 共有/エクスポート機能

---

## Tech Stack

- **Frontend**: React + Vite（`client/`）
- **Routing**: wouter
- **Backend**: Express + tRPC（`server/`）
- **DB**: MySQL + Drizzle ORM（`drizzle/`）
- **Testing**: Vitest

---

## Project Structure

```
client/          # UI (Vite + React)
server/          # Express + tRPC + scraping
drizzle/         # Drizzle schema & migrations
shared/          # shared types / utilities
todo.md          # project plan
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm（`packageManager` は `pnpm` を想定）
- MySQL（ローカル or マネージド）

### 1) Install
```bash
pnpm install
```

### 2) Configure environment variables
ルートに `.env` を作成します。

必須:
- `DATABASE_URL`：MySQL接続文字列（Drizzle用）
- `JWT_SECRET`：Cookie/認証用（開発では適当な文字列でOK）

任意（必要に応じて）:
- `OWNER_OPEN_ID`, `OAUTH_SERVER_URL`
- `VITE_APP_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`

例:
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
JWT_SECRET="dev-secret"
NODE_ENV="development"
```

### 3) Apply DB migrations
```bash
pnpm db:push
```

### 4) Run dev server
```bash
pnpm dev
```

起動後、ログに表示されたURL（例: `http://localhost:3000/`）を開いてください。  
※ `server/_core/index.ts` が空いているポートを自動で選びます。

---

## Useful Commands

```bash
pnpm dev      # dev server (Express + Vite)
pnpm build    # build (client + server bundle)
pnpm start    # run production build
pnpm test     # run tests (vitest)
pnpm check    # typecheck
pnpm format   # prettier
pnpm db:push  # drizzle generate + migrate
```

---

## Data Sync / Scraping

- 同期エンドポイント: `matches.fetchOfficial`
- DB参照: `matches.listOfficial`
- スクレイパー実装: `server/` 配下（例: `unified-scraper.ts`, `jleague-scraper.ts`）

基本方針:
1. 公式サイトの構造変化に強い **JSON-LD優先**
2. 取れない場合は HTML セレクタのフォールバック
3. 失敗は `syncLog`（またはログ）で追跡できるようにする

---

## Troubleshooting

### Port already in use
開発中に `EADDRINUSE` が出る場合は、既存プロセスを停止してから再起動してください。

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep node
kill <PID>
```

### DB connection
`DATABASE_URL` が未設定だと `db:push` が失敗します。  
MySQL の接続先・権限・DB名を確認してください。

---

## License
MIT（`package.json` の `license` を参照）
