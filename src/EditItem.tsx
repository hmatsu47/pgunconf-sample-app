import { createEffect, createSignal, Setter } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { NoteType } from './commons/NoteType';
import { setFocus } from './commons/setFocus';
import { supabase } from './commons/supabaseClient';
import { Article, Message } from './types/common';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import TextField from '@suid/material/TextField';
import ToggleButton from '@suid/material/ToggleButton';
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup';
import Typography from '@suid/material/Typography';
import CancelIcon from '@suid/icons-material/Cancel';
import SaveIcon from '@suid/icons-material/Save';
import './Item.css';

type Props = {
  session: Session,
  article: Article | null,
  userName: string,
  userAvatarName: string,
  insertOrReplactItemToArticles: (item: Article, isInsert: boolean) => void,
  resetArticle: () => void,
  setMessage: Setter<Message>
}
type Updates = {
  title: string,
  note: string,
  note_type: number,
  updated_at: Date,
  userid: string
}
type Author = {
  id: number,
  updated_at: Date,
  userid: string
}

export default (props: Props) => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [newArticle, setNewArticle] = createSignal<boolean>(true);
  const [title, setTitle] = createSignal<string>('');
  const [note, setNote] = createSignal<string>('');
  const [noteType, setNoteType] = createSignal<number>(NoteType.Unpermitted);
  const [userName, setUserName] = createSignal<string>('');
  const [avatarUrl, setAvatarUrl] = createSignal<string>('');

  createEffect(() => {
    setArticle();
    setFocus('title');
  })

  const setArticle = async () => {
    if (!props.article) {
      setUserName(props.userName);
      setAvatarUrl(props.userAvatarName);
      return;
    }
    // 投稿内容をセット
    setLoading(true);
    setNewArticle(false);
    setTitle(props.article.title);
    setNote(props.article.note ? props.article.note : '');
    setNoteType(props.article.noteType);
    setUserName(props.article.userName);
    setAvatarUrl(props.article.avatarUrl);
    setLoading(false);
  }

  const resetArticle = async () => {
    // 投稿内容をリセット
    setLoading(true);
    setNewArticle(true);
    setTitle('');
    setNote('');
    setNoteType(1);
    setUserName(props.userName);
    setAvatarUrl(props.userAvatarName);
    setLoading(false);
    setFocus('title');
    if(!props.article) {
      return;
    }
    props.resetArticle();
  }

  const addOrUpdateArticle = async (updates: Updates, isInsert: boolean) => {
    // 投稿登録・更新（DB へ）
    try {
      if (title() === '') {
        props.setMessage({
          severity: 'error',
          text: 'タイトルを入力してください。'
        });
        setFocus('title');
        return;
      }
      setLoading(true);
      // 投稿自体を登録・更新
      const { data, error } = await (isInsert ? (
        supabase
          .from('articles')
          .insert(updates)
        ) : (
        supabase
          .from('articles')
          .update(updates)
          .match({ id: props.article!.id }))
        );

      if (error) {
        throw error;
      }
      if (isInsert) {
        // 新規投稿→投稿者を登録
        const author: Author = {
          id: data![0]?.id!,
          updated_at: new Date(data![0]?.updated_at),
          userid: props.session.user!.id
        };
        const { error } = await supabase
          .from('authors')
          .insert(author, {
            returning: 'minimal',
          }
        );
  
        if (error) {
          throw error;
        }
      }
      // 画面の一覧を更新
      const article: Article = {
        id: data![0]?.id!,
        updatedAt: new Date(data![0]?.updated_at),
        title: data![0]?.title,
        note: (data![0]?.note ? data![0]?.note : ''),
        noteType: data![0]?.note_type,
        userId: data![0]?.userid,
        userName: userName(),
        avatarUrl: (avatarUrl() ? avatarUrl()! : '')
      }
      props.insertOrReplactItemToArticles(article, isInsert);
      props.setMessage({
        severity: 'success',
        text: `投稿を${newArticle() ? '登録' : '更新'}しました。`
      });
    } catch (error) {
      props.setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${
          error.error_description ||
          error.message ||
          newArticle() ? '登録失敗' : '更新失敗'
        }`
      });
    } finally {
      setLoading(false);
    }
  }

  const addOrUpdateArticleAction = async () => {
    // 投稿登録または更新
    const updates = {
      title: title(),
      note: note(),
      note_type: noteType(),
      updated_at: new Date(),
      userid: newArticle() ? supabase.auth.user()!.id : props.article!.userId
    };
    addOrUpdateArticle(updates, newArticle());
  }

  return (
    <Box sx={{ paddingBottom: "10px" }}>
      <Card
        id="itemCard"
        elevation={5}
      >
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
          >
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
            sx={{ width: "100%" }}
          />
          <Typography
            variant="subtitle2"
            gutterBottom
          >
            本文 :
          </Typography>
          {loading() ? (
            <textarea
              id="note"
              aria-label="Note"
              placeholder="本文を入力してください"
              disabled={true}
            >
            </textarea>
          ) : (
            <textarea
              id="note"
              aria-label="Note"
              placeholder="本文を入力してください"
              onchange={(event) => {
                setNote(event.currentTarget.value);
              }}
            >
              {note()}
            </textarea>
          )}
          <Box sx={{ padding: "10px 0 10px 0" }}>
            <Typography
              variant="subtitle2"
              sx={{ verticalAlign: "center" }}
            >
              他のユーザに許可する操作 :
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={noteType().toString()}
              exclusive
              onChange={(event, newType) => {
                setNoteType(Number(newType));
              }}
              disabled={loading() || !newArticle() && props.session.user!.id !== props.article!.userId}
            >
              <ToggleButton value={NoteType.Unpermitted.toString()}>
                許可しない
              </ToggleButton>
              <ToggleButton value={NoteType.Readable.toString()}>
                読み取りのみ
              </ToggleButton>
              <ToggleButton value={NoteType.Writable.toString()}>
                読み取りと編集
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <CardActions>
            <Button
              variant="outlined"
              aria-live="polite"
              onClick={() => resetArticle()}
              endIcon={<CancelIcon />}
              disabled={loading()}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              aria-live="polite"
              onClick={() => addOrUpdateArticleAction()}
              endIcon={<SaveIcon />}
              disabled={loading()}
            >
              {newArticle() ? '登録' : '更新'}
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </Box>
  );
}
