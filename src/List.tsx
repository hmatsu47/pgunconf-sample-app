import { createSignal, createEffect, For, Show } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import Alert from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import DeleteIcon from '@suid/icons-material/Delete';
import EditIcon from '@suid/icons-material/Edit';
import IconButton from '@suid/material/IconButton';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import Item from './Item';
import { Article, Message } from './types/common';

type Props = {
  session: Session
}

const List = (props: Props) => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [article, setArticle] = createSignal<Article | null>(null);
  const [articles, setArticles] = createSignal<Article[]>();
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });

  createEffect(() => {
    getArticles();
  })

  const getArticles = async () => {
    // 投稿一覧読み取り（DB から）
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from('articles')
        .select(`
          id,
          updated_at,
          title,
          note,
          note_type,
          userid,
          profiles (username)
        `)
        .order(`updated_at`, { ascending: false });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        const listArticles = data.map(obj => {
          const article: Article = {
            id: obj.id,
            updatedAt: new Date(obj.updated_at),
            title: obj.title,
            note: (obj.note ? obj.note : ''),
            noteType: obj.note_type,
            userId: obj.userid,
            userName: (obj.profiles.username ? obj.profiles.username : '')
          };
          return article;
        })
        setArticles(listArticles);
        resetArticle();
      }
    } catch (error) {
      setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${error.error_description || error.message}`
      });
    } finally {
      setLoading(false);
    }
  }

  const resetArticle = () => {
    setArticle(null);
  }

  const deleteArticle = async (id: number) => {
    // 投稿削除（DB から）
    try {

      const { error } = await supabase
        .from('articles')
        .delete({ returning: 'minimal' })
        .match({ id: id });

      if (error) {
        throw error;
      }
      getArticles();
      setMessage({
        severity: 'success',
        text: '投稿を削除しました'
      });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${error.error_description || error.message}`
      });
    }
  }

  const deleteArticleAction = (id: number) => {
    // 投稿の削除（確認）
    if (!confirm('本当に削除しますか？')) {
      return;
    }
    deleteArticle(id);
  }

  // 投稿一覧画面を表示
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: "320px",
        display: "flex",
        justifyContent: "center"
      }}
      aria-live="polite"
    >
      <Stack
        spacing={2}
        direction="column"
      >
        <Box sx={{ padding: "10px 0 0 0" }}>
          {loading() ? (
            <Typography
              variant="body1"
              gutterBottom
            >
              読み込み中...
            </Typography>
          ) : (
            <>
              <Item
                session={props.session}
                article={article()}
                getArticles={() => getArticles()}
                resetArticle={() => resetArticle()}
                setMessage={(message: Message) => setMessage(message)}
              />
            </>
          )}
          <Show
            when={message().text !== ''}
            fallback={<></>}
          >
            <Box sx={{ padding: "0 0 10px 0" }}>
              <Alert severity={message().severity}>
                {message().text}
              </Alert>
            </Box>
          </Show>
          {loading() ? (
            <>
            </>
          ) : (
            <>
              <Show
                when={articles() && articles()!.length > 0}
                fallback={
                  <Typography variant="body1" gutterBottom>
                    投稿はありません
                  </Typography>
                }
              >
                <For
                  each={articles()}
                  fallback={<></>}
                >
                  {(article) => 
                    <Box sx={{ paddingBottom: "4px" }}>
                      <Card
                        variant="outlined"
                        sx={{ minWidth: 300 }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            gutterBottom
                          >
                            {article.updatedAt.toLocaleString('ja-JP')}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {article.userName}
                          </Typography>
                          <Typography
                            variant="h6"
                            gutterBottom
                          >
                            {article.title}
                          </Typography>
                          <For
                            each={article.note?.split('\n')}
                            fallback={<></>}
                          >
                            {(line) =>
                              <Typography
                                variant="body1"
                                gutterBottom
                              >
                                {line}
                              </Typography>
                            }
                          </For>
                          <CardActions>
                            <IconButton
                              aria-label="edit"
                              onClick={() => setArticle(article)}
                              disabled={
                                article.userId !== props.session.user!.id && article.noteType !== 3
                              }
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              onClick={() => deleteArticleAction(article.id!)}
                              disabled={
                                article.userId !== props.session.user!.id
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </CardContent>
                      </Card>
                    </Box>
                  }
                </For>
              </Show>
            </>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default List;
