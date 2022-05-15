import { createSignal, createEffect, Match, Show, Switch } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import Alert from '@suid/material/Alert';
import AccountCircleIcon from '@suid/icons-material/AccountCircle';
import Box from '@suid/material/Box';
import IconButton from '@suid/material/IconButton';
import LogoutIcon from '@suid/icons-material/Logout';
import ViewListIcon from '@suid/icons-material/ViewList';
import AppBar from '@suid/material/AppBar';
import Stack from '@suid/material/Stack';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';
import Account from './Account';
import Auth from './Auth';
import List from './List';
import { Message } from './types/common';

export default () => {
  const [session, setSession] = createSignal<Session | null>(null);
  const [profiled, setProfiled] = createSignal<boolean>(false);
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });
  const [route, setRoute] = createSignal<string>('');

  createEffect(() => {
    setSession(supabase.auth.session());
    // 認証状態が変化したら Session を更新
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      getProfiled();
    })
  })

  const getProfiled = async () => {
    // プロフィールがあるか？（DB で検索）
    if (!session()) {
      return;
    }
    try {

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session()!.user!.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setProfiled(true);
        if (route() === '') {
          setRoute('list');
        }
      } else {
        setProfiled(false);
        setRoute('profile');
      }
    } catch (error) {
      setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${
          error.error_description ||
          error.message ||
          'プロフィール取得失敗'
        }`
      });
    }
  }
  // タイトルバー＋コンテンツを表示（コンテンツ：未認証のときはメールアドレス入力画面・認証済みのときはプロフィール画面）
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Supabase (RLS) + SolidJS のサンプル
            </Typography>
            <Show
              when={session() && profiled()}
              fallback={<></>}
            >
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="list"
                sx={{ mr: 1 }}
                onClick={() => setRoute('list')}
              >
                <ViewListIcon />
              </IconButton>
            </Show>
            <Show
              when={session()}
              fallback={<></>}
            >
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="profile"
                sx={{ mr: 1 }}
                onClick={() => setRoute('profile')}
              >
                <AccountCircleIcon />
              </IconButton>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="sign out"
                // sx={{ mr: 2 }}
                onClick={() => supabase.auth.signOut()}
              >
                <LogoutIcon />
              </IconButton>
            </Show>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            width: "100%",
            minWidth: "320px",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Stack
            spacing={2}
            direction="column"
            aria-live="polite"
          >
            <Switch fallback={<></>}>
              <Match when={!session()}>
                <Auth />
              </Match>
              <Match when={route() === 'profile'}>
                <Account
                  session={session()!}
                  getProfiled={() => getProfiled()}
                />
              </Match>
              <Match when={route() === 'list'}>
                <List session={session()!} />
              </Match>
            </Switch>
            <Show
              when={message().text !== ''}
              fallback={<></>}
            >
              <Alert severity={message().severity}>
                {message().text}
              </Alert>
            </Show>
          </Stack>
        </Box>
      </Box>
    </>
  );
};
