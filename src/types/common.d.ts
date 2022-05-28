import { AlertColor } from '@suid/material/Alert';

// 投稿
export declare type Article = {
  id: number,
  updatedAt: Date,
  title: string,
  note: string,
  noteType: number,
  userId: string,
  userName: string,
  avatarUrl: string
}
// アラートメッセージ
export declare type Message = {
    severity: AlertColor,
    text: string
}
