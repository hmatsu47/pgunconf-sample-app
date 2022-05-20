## 第 33 回 PostgreSQL アンカンファレンス＠オンライン向けのサンプルアプリを作る

- https://pgunconf.connpass.com/event/243796/ の発表ネタ
  - [こっち](https://github.com/hmatsu47/profile-app)で行くつもりだったけど会が延期になったので準備期間に余裕ができた
- Supabase
  - https://supabase.com/
- SolidJS
  - https://www.solidjs.com/
- Material-UI（SUID）
  - https://suid.io/
- メールアドレスでログインユーザを識別
  - Magic Link を使う
- GitHub ログイン機能を追加
  - 識別はメールアドレスで行っているので Magic Link を使ってログインしたユーザと同じメールアドレスの場合は同一ユーザとみなす
  - 設定方法
    - https://www.supabase.jp/docs/guides/auth/auth-github
- RLS を使って以下の 3 種類の情報を登録・表示・編集・削除
  - 1 : ログインユーザ本人のみ登録・表示・編集・削除が可能
  - 2 : ログインユーザ以外も表示が可能
  - 3 : ログインユーザ以外も表示・編集が可能
- テーブル定義など
  - [db-create.sql](db-create.sql)
- RLS が機能しているところを見せるデモなので、一覧表示ではあえて毎回 DB から全行再読み込みするスタイルを取っている

### 初期設定

```sh:初期設定
npx degit solidjs/templates/ts pgunconf-sample-app
cd pgunconf-sample-app
npm i
npm install @supabase/supabase-js
npm install @suid/material
npm install @suid/icons-material
npm install @suid/types
```

（`@suid/types`は不要だが念のため）

- `.env`ファイル（`pgunconf-sample-app`直下に置く）

```text:.env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- なお SolidJS の標準的な手順では Vite を使うため ~~Supabase の Docs（Quickstart: SolidJS）のとおりに`process.env.XXX`で環境変数を読むことはできない~~
  - `import.meta.env.XXX`を使う
  - Issue を立てたら親切な方が PR を出してくださいました→ 2022/5/20 修正済み

```sh:開発環境で起動
npm run dev
```

### 紹介・解説記事など

- **[SolidJS で Material-UI（SUID）を試してみた](https://zenn.dev/hmatsu47/articles/solidjs-suid-sample)**
- **[SolidJS で Supabase の Row Level Security を試してみた](https://qiita.com/hmatsu47/items/b6ba2d2994e1632c13ea)**
