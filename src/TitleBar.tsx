import { Accessor, Setter, Show } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import Avatar from '@suid/material/Avatar';
import AccountCircleIcon from '@suid/icons-material/AccountCircle';
import IconButton from '@suid/material/IconButton';
import LogoutIcon from '@suid/icons-material/Logout';
import ViewListIcon from '@suid/icons-material/ViewList';
import AppBar from '@suid/material/AppBar';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';

type Props = {
  session: Accessor<Session | null>,
  profiled: Accessor<boolean>,
  userAvatarUrl: Accessor<string | null>,
  setRoute: Setter<string>
}

const TitleBar = (props: Props) => {
  return (
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
          when={props.session() && props.profiled()}
          fallback={<></>}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="list"
            sx={{ mr: 1 }}
            onClick={() => props.setRoute('list')}
          >
            <ViewListIcon />
          </IconButton>
        </Show>
        <Show
          when={props.session()}
          fallback={<></>}
        >
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="profile"
            sx={{ mr: 1 }}
            onClick={() => props.setRoute('profile')}
          >
            <Show
              when={props.userAvatarUrl()}
              fallback={<AccountCircleIcon />}
            >
              <Avatar
                src={props.userAvatarUrl()!}
                sx={{
                  width: 32,
                  height: 32
                }}
              />
            </Show>
          </IconButton>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="sign out"
            onClick={() => supabase.auth.signOut()}
          >
            <LogoutIcon />
          </IconButton>
        </Show>
      </Toolbar>
    </AppBar>
  );
}

export default TitleBar;
