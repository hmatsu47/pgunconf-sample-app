import { createEffect, createSignal, onMount } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import Button from '@suid/material/Button';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import TextField from '@suid/material/TextField';
import ToggleButton from '@suid/material/ToggleButton';
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup';
import Typography from '@suid/material/Typography';
import Box from '@suid/material/Box';
import { Article, Message } from './types/common';

type Props = {
  session: Session,
  article: Article | null,
  getArticles: () => void,
  setMessage: (message: Message) => void
}
type Updates = {
  title: string,
  note: string,
  note_type: number,
  updated_at: Date,
  userid: string
}

export default (props: Props) => {
  const [newArticle, setNewArticle] = createSignal<boolean>(true);
  const [title, setTitle] = createSignal<string>('');
  const [note, setNote] = createSignal<string>('');
  const [noteType, setNoteType] = createSignal<number>(1);

  onMount(() => {
    const element = document.getElementById('title');
    element?.focus();
  })

  createEffect(() => {
    setArticle();
  })

  const setArticle = async () => {
    if (!props.article) {
      return;
    }
    // 投稿内容をセット
    setNewArticle(false);
    setTitle(props.article.title);
    setNote(props.article.note ? props.article.note : '');
    setNoteType(props.article.noteType);
  }

  const clearArticle = async () => {
    // タイトルと本文をクリア
    setNewArticle(true);
    setTitle('');
    setNote('');
    setNoteType(1);
  }

  const insertArticle = async (updates: Updates) => {
    // 投稿登録（DB へ）
    try {

      const { error } = await supabase
        .from('articles')
        .insert(updates, { returning: 'minimal' });

      if (error) {
        throw error;
      }
      props.getArticles();
      props.setMessage({ severity: 'success', text: `投稿を登録しました。` });
    } catch (error) {
      props.setMessage({ severity: 'error', text: `エラーが発生しました : ${error.error_description || error.message}` });
    }
  }

  const updateArticle = async (updates: Updates) => {
    // 投稿更新（DB へ）
    try {

      const { error } = await supabase
        .from('articles')
        .update(updates, { returning: 'minimal' })
        .match({ id: props.article!.id });

      if (error) {
        throw error;
      }
      props.getArticles();
      props.setMessage({ severity: 'success', text: `投稿を更新しました。` });
    } catch (error) {
      props.setMessage({ severity: 'error', text: `エラーが発生しました : ${error.error_description || error.message}` });
    }
  }

  const updateArticleAction = async () => {
    // 投稿登録または更新
    const updates = {
      title: title(),
      note: note(),
      note_type: noteType(),
      updated_at: new Date(),
      userid: supabase.auth.user()!.id
    };
    if (newArticle()) {
      // 新規登録
      insertArticle(updates);
    } else {
      // 更新
      updateArticle(updates);
    }
  }

  return (
    <Box sx={{ paddingBottom: "10px" }}>
      <Card sx={{ minWidth: 300 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {newArticle() ? '新規投稿' : '投稿編集'}
          </Typography>
          <TextField
            required
            id="title"
            label="Title"
            helperText="タイトルを入力してください"
            type="text"
            value={title()}
            onChange={(event, value) => {
              setTitle(value);
            }}
            style="width: 100%"
          />
          <Typography variant="subtitle2" gutterBottom>
            本文 :
          </Typography>
          <textarea
            id="note"
            aria-label="Note"
            onchange={(event) => {
              setNote(event.currentTarget.value);
            }}
            style="width: 100%; height: 9.0em; font-size: 1rem; line-height: 1.8em"
          >
            {note()}
          </textarea>
            <div style="padding: 10px 0 10px 0">
              <Typography variant="subtitle2" sx={{ verticalAlign: "center" }}>
                他のユーザに許可する操作 :
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={noteType().toString()}
                exclusive
                onChange={(event, newType) => {
                  setNoteType(Number(newType));
                }}
                disabled={!newArticle() && props.session.user!.id !== props.article!.userId}
              >
                <ToggleButton value="1">許可しない</ToggleButton>
                <ToggleButton value="2">読み取りのみ</ToggleButton>
                <ToggleButton value="3">読み取りと編集</ToggleButton>
              </ToggleButtonGroup>
            </div>
          <CardActions>
            <Button
              variant="outlined"
              aria-live="polite"
              onClick={() => clearArticle()}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              aria-live="polite"
              onClick={() => updateArticleAction()}
            >
              {newArticle() ? '登録' : '更新'}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </Box>
  );
}
