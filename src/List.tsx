import { createSignal, createEffect, For, Match, Show, Switch } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import Alert from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import EditItem from './EditItem';
import ViewItem from './ViewItem';
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

  const resetArticle = async () => {
    // 投稿内容をリセット
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
      if (article() && id === article()!.id) {
        // 編集中の投稿を削除した場合は編集画面をクリアする
        resetArticle();
      }
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
            <>
            </>
          ) : (
            <>
              <EditItem
                session={props.session}
                article={article()}
                getArticles={() => getArticles()}
                resetArticle={() => resetArticle()}
                setMessage={(message: Message) => setMessage(message)}
              />
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
                    <ViewItem
                      session={props.session}
                      article={article}
                      setArticle={setArticle}
                      deleteArticleAction={deleteArticleAction}
                    />
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
