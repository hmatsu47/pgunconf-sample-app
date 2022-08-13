import { createSignal, createEffect, Match, Show, Switch } from "solid-js";
import { Session } from "@supabase/supabase-js";
import { downloadImage, listImages } from "./commons/downloadImage";
import { supabase } from "./commons/supabaseClient";
import { Message } from "./types/common";
import Alert from "@suid/material/Alert";
import Box from "@suid/material/Box";
import Stack from "@suid/material/Stack";
import Account from "./Account";
import Auth from "./Auth";
import List from "./List";
import TitleBar from "./TitleBar";

export default () => {
  const [session, setSession] = createSignal<Session | null>(null);
  const [avatarLoaded, setAvatarLoaded] = createSignal<boolean>(false);
  const [avatars, setAvatars] = createSignal<Map<string, string>>();
  const [userName, setUserName] = createSignal<string | null>(null);
  const [userAvatarName, setUserAvatarName] = createSignal<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = createSignal<string | null>(null);
  const [message, setMessage] = createSignal<Message>({
    severity: "info",
    text: "",
  });
  const [route, setRoute] = createSignal<string>("");

  createEffect(() => {
    setSession(supabase.auth.session());
    getAvatarImages();
    // 認証状態が変化したら Session を更新
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      getProfiled();
    });
  });

  const getAvatarImages = async () => {
    // アバター画像を取得（ストレージから）
    const imageMap = new Map<string, string>();
    const imageNames = await listImages(setMessage);
    imageNames?.forEach(async (name) => {
      const url = await downloadImage(name, setMessage);
      imageMap.set(name, url ? url : "");
    });
    setAvatars(imageMap);
    setAvatarLoaded(true);
  };

  const getProfiled = async () => {
    // プロフィールがあるか？（DB で検索）
    if (!session()) {
      return;
    }
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", session()!.user!.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      if (!data) {
        // プロフィールなし→プロフィール画面へ
        setRoute("profile");
        return;
      }
      // プロフィールあり
      if (data.avatar_url) {
        // アバターあり→タイトルバーのアバターをセット
        const name: string = data.avatar_url;
        const url: string | undefined = await downloadImage(name, setMessage);
        if (url) {
          setUserAvatarUrl(url);
        }
      }
      setUserAvatarName(data.avatar_url ? data.avatar_url : "");
      setUserName(data.username);
      if (route() === "") {
        setRoute("list");
      }
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message || "プロフィール取得失敗"
        }`,
      });
    }
  };
  // タイトルバー＋コンテンツを表示（コンテンツ：未認証のときはメールアドレス入力画面・認証済みのときは投稿一覧 or プロフィール画面）
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <Box sx={{ flexGrow: 1 }}>
        <TitleBar
          session={session}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          setRoute={setRoute}
        />
        <Box
          sx={{
            width: "100%",
            minWidth: "320px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack spacing={2} direction="column" aria-live="polite">
            <Switch fallback={<></>}>
              <Match when={!session()}>
                <Auth />
              </Match>
              <Match when={route() === "profile" && avatarLoaded()}>
                <Account
                  session={session()!}
                  setUserName={setUserName}
                  setUserAvatarUrl={setUserAvatarUrl}
                  getAvatarImages={() => getAvatarImages()}
                />
              </Match>
              <Match when={route() === "list" && avatarLoaded()}>
                <List
                  session={session()!}
                  userName={userName()!}
                  userAvatarName={userAvatarName()!}
                  avatars={avatars()!}
                />
              </Match>
            </Switch>
            <Show when={message().text !== ""} fallback={<></>}>
              <Alert severity={message().severity}>{message().text}</Alert>
            </Show>
          </Stack>
        </Box>
      </Box>
    </>
  );
};
