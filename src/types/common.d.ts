import { Session } from '@supabase/supabase-js';
import { AlertColor } from '@suid/material/Alert';

// アラートメッセージ
export declare type Message = {
    severity: AlertColor,
    text: string
}
// App から引き継ぐ Props
type PropsFromApp = {
  key: string,
  session: Session,
  route?: string
}
// 投稿
export declare type Article = {
    id?: number,
    updatedAt: Date,
    title: string,
    note?: string,
    noteType: number,
    userId: string,
    userName?: string
}
