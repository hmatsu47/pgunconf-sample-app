import { createSignal, createEffect, For, Show } from "solid-js";
import { AuthSession } from "@supabase/supabase-js";
import { supabase } from "./commons/supabaseClient";
import { Article, Message } from "./types/common";
import Alert from "@suid/material/Alert";
import Box from "@suid/material/Box";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import EditItem from "./EditItem";
import ViewItem from "./ViewItem";

type Props = {
  session: AuthSession;
  userName: string;
  userAvatarName: string;
  avatars: Map<string, string>;
};

const List = (props: Props) => {
  const [loadingEditor, setLoadingEditor] = createSignal<boolean>(false);
  const [loadingList, setLoadingList] = createSignal<boolean>(false);
  const [article, setArticle] = createSignal<Article | null>(null);
  const [articles, setArticles] = createSignal<Article[]>();
  const [message, setMessage] = createSignal<Message>({
    severity: "info",
    text: "",
  });

  createEffect(() => {
    getArticles();
  });

  const getArticles = async () => {
    // 投稿一覧読み取り（DB から）
    try {
      setLoadingList(true);
      setLoadingEditor(true);

      // @ts-ignore
      const { data, error, status } = await supabase
        .from("articles")
        .select(
          `
          id,
          updated_at,
          title,
          note,
          note_type,
          userid,
          profiles (
            username,
            avatar_url
          )
        `
        )
        .order("updated_at", { ascending: false });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        const listArticles = data.map((obj) => {
          const article: Article = {
            id: obj.id,
            updatedAt: new Date(obj.updated_at),
            title: obj.title,
            note: obj.note ? obj.note : "",
            noteType: obj.note_type,
            userId: obj.userid,
            userName: obj.profiles.username ? obj.profiles.username : "",
            avatarUrl: obj.profiles.avatar_url ? obj.profiles.avatar_url : "",
          };
          return article;
        });
        setArticles(listArticles);
      }
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message || "データ読み込み失敗"
        }`,
      });
    } finally {
      setLoadingEditor(false);
      setLoadingList(false);
    }
  };

  const changeArticle = (article: Article) => {
    // 投稿編集
    setLoadingEditor(true);
    setArticle(article);
    setLoadingEditor(false);
  };

  const resetArticle = () => {
    // 投稿内容をリセット
    setArticle(null);
  };

  const insertOrReplactItemToArticles = (item: Article, isInsert: boolean) => {
    // 一覧に投稿を挿入または置換
    setLoadingEditor(true);
    setLoadingList(true);
    // 置換の場合は置換対象の古い投稿を削除
    let tempList = isInsert
      ? articles()
      : articles()?.filter((article: Article) => {
          return article.id !== item.id;
        });
    // 新しい投稿を一覧の先頭に挿入
    tempList?.unshift(item);
    setArticles(tempList);
    resetArticle();
    setLoadingEditor(false);
    setLoadingList(false);
  };

  const removeItemFromArticles = (id: number) => {
    // 一覧から対象の投稿を削除
    const resultList = articles()?.filter((article: Article) => {
      return article.id !== id;
    });
    setArticles(resultList ? resultList : []);
  };

  const deleteAuthor = async (id: number) => {
    // 投稿者削除（DB から）
    try {
      const { error } = await supabase
        .from("authors")
        .delete()
        .match({ id: id });

      return error;
    } catch (error) {
      return error;
    }
  };

  const deleteArticle = async (id: number) => {
    // 投稿削除（DB から）
    try {
      // まずは投稿者を削除
      const authorError = await deleteAuthor(id);

      if (authorError) {
        throw authorError;
      }
      // 次に投稿を削除
      const { error } = await supabase
        .from("articles")
        .delete()
        .match({ id: id });

      if (error) {
        throw error;
      }
      setLoadingList(true);
      removeItemFromArticles(id);
      if (article() && id === article()!.id) {
        // 編集中の投稿を削除した場合は編集画面をクリアする
        setLoadingEditor(true);
        await resetArticle();
        setLoadingEditor(false);
      }
      setMessage({
        severity: "success",
        text: "投稿を削除しました",
      });
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message
        }`,
      });
    } finally {
      setLoadingList(false);
    }
  };

  const deleteArticleAction = (id: number) => {
    // 投稿の削除（確認）
    if (!confirm("本当に削除しますか？")) {
      return;
    }
    deleteArticle(id);
  };

  // 投稿一覧画面を表示
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: "320px",
        display: "flex",
        justifyContent: "center",
      }}
      aria-live="polite"
    >
      <Stack spacing={2} direction="column">
        <Box sx={{ padding: "10px 0 0 0" }}>
          {loadingEditor() ? (
            <></>
          ) : (
            <EditItem
              session={props.session}
              article={article()}
              userName={props.userName}
              userAvatarName={props.userAvatarName}
              insertOrReplactItemToArticles={(item, isInsert) =>
                insertOrReplactItemToArticles(item, isInsert)
              }
              resetArticle={() => resetArticle()}
              setMessage={setMessage}
            />
          )}
          <Show when={message().text !== ""} fallback={<></>}>
            <Box sx={{ padding: "0 0 10px 0" }}>
              <Alert severity={message().severity}>{message().text}</Alert>
            </Box>
          </Show>
          {loadingList() ? (
            <></>
          ) : (
            <Show
              when={articles() && articles()!.length > 0}
              fallback={
                <Typography variant="body1" gutterBottom>
                  投稿はありません
                </Typography>
              }
            >
              <For each={articles()} fallback={<></>}>
                {(article) => (
                  <ViewItem
                    session={props.session}
                    article={article}
                    avatar={
                      article.avatarUrl !== ""
                        ? props.avatars?.get(article.avatarUrl)
                          ? props.avatars.get(article.avatarUrl)
                          : ""
                        : ""
                    }
                    changeArticle={changeArticle}
                    deleteArticleAction={deleteArticleAction}
                  />
                )}
              </For>
            </Show>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default List;
