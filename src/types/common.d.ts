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
  session: Session
}
// 記事
export declare type Article = {
    id?: number,
    updateAt: Date,
    title: string,
    note?: string,
    noteType: number,
    userId: string
}
