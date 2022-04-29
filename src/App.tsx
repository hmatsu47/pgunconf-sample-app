import { createSignal, createEffect, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import Alert from '@suid/material/Alert';
import AccountCircle from '@suid/icons-material/AccountCircle';
import Box from '@suid/material/Box';
import IconButton from '@suid/material/IconButton';
import Logout from '@suid/icons-material/Logout';
import ViewList from '@suid/icons-material/ViewList';
import Auth from './Auth';
import Contents from './Contents';
import { Session } from '@supabase/supabase-js';
import AppBar from '@suid/material/AppBar';
import Stack from '@suid/material/Stack';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';
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

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session()!.user!.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setProfiled(true);
        setRoute('list');
      } else {
        setProfiled(false);
        setRoute('profile');
      }
    } catch (error) {
      setMessage({ severity: 'error', text: error.error_description || error.message });
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
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Supabase (RLS) + SolidJS のサンプル
              </Typography>
              <Show when={session() && profiled()} fallback={<></>}>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="list"
                  sx={{ mr: 2 }}
                  onClick={() => setRoute('list')}
                >
                  <ViewList />
                </IconButton>
              </Show>
              <Show when={session()} fallback={<></>}>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="profile"
                  sx={{ mr: 2 }}
                  onClick={() => setRoute('profile')}
                >
                  <AccountCircle />
                </IconButton>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="sign out"
                  sx={{ mr: 2 }}
                  onClick={() => supabase.auth.signOut()}
                >
                  <Logout />
                </IconButton>
              </Show>
            </Toolbar>
          </AppBar>
        <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
          <Stack spacing={2} direction="column">
            {!session() ? <Auth /> : <Contents key={session()!.user!.id} session={session()!} route={route()} />}
            <Show when={message().text !== ''} fallback={<></>}>
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
