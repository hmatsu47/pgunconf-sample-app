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
    <div style={{ width: "100%", padding: '50px 0 100px 0' }}>
      <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
        {!session() ? <Auth /> : <Account key={session()!.user!.id} session={session()!} />}
      </Box>
    </div>
  );
};
