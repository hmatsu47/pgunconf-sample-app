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
- RLS を使って以下の 3 種類の情報を登録・表示・編集・削除
  - 1 : ログインユーザ本人のみ登録・表示・編集・削除が可能
  - 2 : ログインユーザ以外も表示が可能
  - 3 : ログインユーザ以外も表示・編集が可能
- テーブル定義など
  - [db-create.sql](db-create.sql)

### 初期設定

```sh:初期設定
npx degit solidjs/templates/ts pgunconf-sample-app
cd pgunconf-sample-app
npm i
npm install @supabase/supabase-js
npm install @suid/material
npm install @suid/icons-material
```

- `.env`ファイル（`pgunconf-sample-app`直下に置く）

```text:.env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

- なお SolidJS の標準的な手順では Vite を使うため Supabase の Docs（Quickstart: SolidJS）のとおりに`process.env.XXX`で環境変数を読むことはできない
  - `import.meta.env.XXX`を使う