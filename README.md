## 第 33 回 PostgreSQL アンカンファレンス＠オンライン向けのサンプルアプリを作る

- https://pgunconf.connpass.com/event/243796/ の発表ネタ
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
- ただいま作成中（ゴールデンウィークの個人研究？）