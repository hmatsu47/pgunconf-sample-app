import { createSignal, createEffect } from 'solid-js';
import { supabase } from './supabaseClient';
import Box from '@suid/material/Box';
import Auth from './Auth';
import Account from './Account';
import { Session } from '@supabase/supabase-js';

export default () => {
  const [session, setSession] = createSignal<Session | null>(null);

  createEffect(() => {
    setSession(supabase.auth.session());

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  })

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <div>
        <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
          {!session() ? <Auth /> : <Account key={session()!.user!.id} session={session()!} />}
        </Box>
    </div>
    </>
  );
};
