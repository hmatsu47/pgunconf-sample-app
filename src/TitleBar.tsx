import { Accessor, Setter, Show } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { supabase } from './commons/supabaseClient';
import AppBar from '@suid/material/AppBar';
import Avatar from '@suid/material/Avatar';
import Box from '@suid/material/Box';
import IconButton from '@suid/material/IconButton';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';
import AccountCircleIcon from '@suid/icons-material/AccountCircle';
import LogoutIcon from '@suid/icons-material/Logout';
import ViewListIcon from '@suid/icons-material/ViewList';

type Props = {
  session: Accessor<Session | null>,
  userName: Accessor<string | null>,
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
          when={props.session() && props.userName()}
          fallback={<></>}
        >
          <Box title="list">
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
          </Box>
        </Show>
        <Show
          when={props.session()}
          fallback={<></>}
        >
          <Box title={props.userName()! || 'profile'}>
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
                  alt={props.userName()!}
                />
              </Show>
            </IconButton>
          </Box>
          <Box title="sign out">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="sign out"
              onClick={() => supabase.auth.signOut()}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Show>
      </Toolbar>
    </AppBar>
  );
}

export default TitleBar;
