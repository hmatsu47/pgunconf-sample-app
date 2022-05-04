import { createEffect, createSignal } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import Button from '@suid/material/Button';
import CancelIcon from '@suid/icons-material/Cancel';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import SaveIcon from '@suid/icons-material/Save';
import TextField from '@suid/material/TextField';
import ToggleButton from '@suid/material/ToggleButton';
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup';
import Typography from '@suid/material/Typography';
import Box from '@suid/material/Box';
import { Article, Message } from './types/common';
import { setFocus } from './commons/setFocus';

type Props = {
  session: Session,
  article: Article | null,
  getArticles: () => void,
  resetArticle: () => void,
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
  const [loading, setLoading] = createSignal<boolean>(false);
  const [newArticle, setNewArticle] = createSignal<boolean>(true);
  const [title, setTitle] = createSignal<string>('');
  const [note, setNote] = createSignal<string>('');
  const [noteType, setNoteType] = createSignal<number>(1);

  createEffect(() => {
    setArticle();
    setFocus('title');
  })

  const setArticle = async () => {
    if (!props.article) {
      return;
    }
    // 投稿内容をセット
    setLoading(true);
    setNewArticle(false);
    setTitle(props.article.title);
    setNote(props.article.note ? props.article.note : '');
    setNoteType(props.article.noteType);
    setLoading(false);
  }

  const resetArticle = () => {
    // 投稿内容をリセット
    setLoading(true);
    setNewArticle(true);
    setTitle('');
    setNote('');
    setNoteType(1);
    props.resetArticle();
  }

  const addOrUpdateArticle = async (updates: Updates, isInsert: boolean) => {
    // 投稿登録・更新（DB へ）
    try {
      setLoading(true);

      const { error } = await (isInsert ? (
        supabase
          .from('articles')
          .insert(updates, { returning: 'minimal' })
        ) : (
        supabase
          .from('articles')
          .update(updates, { returning: 'minimal' })
          .match({ id: props.article!.id }))
        );

      if (error) {
        throw error;
      }
      props.getArticles();
      props.setMessage({
        severity: 'success',
        text: `投稿を${newArticle() ? '登録' : '更新'}しました。`
      });
    } catch (error) {
      props.setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${error.error_description || error.message}`
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
      userid: supabase.auth.user()!.id
    };
    addOrUpdateArticle(updates, newArticle());
  }

  return (
    <Box sx={{ paddingBottom: "10px" }}>
      <Card
        elevation={5}
        sx={{ minWidth: 300 }}
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
          <textarea
            id="note"
            aria-label="Note"
            placeholder="本文を入力してください"
            onchange={(event) => {
              setNote(event.currentTarget.value);
            }}
            style="width: 100%; height: 9.0em; font-size: 1rem; line-height: 1.8em"
          >
            {note()}
          </textarea>
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
              disabled={!newArticle() && props.session.user!.id !== props.article!.userId}
            >
              <ToggleButton value="1">
                許可しない
              </ToggleButton>
              <ToggleButton value="2">
                読み取りのみ
              </ToggleButton>
              <ToggleButton value="3">
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
