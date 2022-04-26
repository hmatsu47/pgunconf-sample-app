import { createSignal, createEffect, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import Box from '@suid/material/Box';
import Button from "@suid/material/Button";
import Auth from './Auth';
import Account from './Account';
import { Session } from '@supabase/supabase-js';
import AppBar from '@suid/material/AppBar';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';

export default () => {
  const [session, setSession] = createSignal<Session | null>(null);

  createEffect(() => {
    setSession(supabase.auth.session());
    // 認証状態が変化したら Session を更新
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  })

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
              <Show when={session()} fallback={<></>}>
                <Button
                  color="inherit"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </Button>
              </Show>
            </Toolbar>
          </AppBar>
        <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
          {!session() ? <Auth /> : <Account key={session()!.user!.id} session={session()!} />}
        </Box>
    </Box>
    </>
  );
};
