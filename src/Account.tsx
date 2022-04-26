import { Session } from '@supabase/supabase-js';
import { createSignal, createEffect, Accessor, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import Alert from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import Avatar from './Avatar';
import { Message } from './types/common';

type Props = {
  key: string,
  session: Session
}
type UpdateParams = {
  username: Accessor<string>,
  website: Accessor<string>,
  avatarUrl: string
}

const Account = (props: Props) => {
  const [loading, setLoading] = createSignal<boolean>(true);
  const [updating, setUpdating] = createSignal<boolean>(false);
  const [username, setUsername] = createSignal<string>('');
  const [website, setWebsite] = createSignal<string>('');
  const [avatarUrl, setAvatarUrl] = createSignal<string>('');
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });

  createEffect(() => {
    props.session;
    getProfile();
  })

  const getProfile = async () => {
    // プロフィール読み取り（DB から）
    try {
      setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user!.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      setMessage({ severity: 'error', text: error.error_description || error.message });
    } finally {
      setLoading(false);
    }
  }

  const updateProfile = async (e: UpdateParams | { submitter: HTMLElement; }) => {
    // プロフィール更新（DB へ）
    try {
      setUpdating(true);
      setLoading(true);
      const user = supabase.auth.user();

      const updates = {
        id: user!.id,
        username: username(),
        website: website(),
        avatar_url: avatarUrl(),
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
      setMessage({ severity: 'success', text: 'プロフィールを更新しました。' });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }

  // プロフィール画面を表示
  return (
    <div aria-live="polite">
      <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
        <Stack spacing={2} direction="column">
          <div style={{ padding: "10px 0 0 0" }}>
            {loading() ? (
              <Typography variant="body1" gutterBottom>
                {updating() ? '保存中...' : '読み込み中...'}
              </Typography>
            ) : (
              <>
                <Avatar
                  url={avatarUrl()}
                  size={"150px"}
                  onUpload={(url: string) => {
                    setAvatarUrl(url);
                    updateProfile({ username, website, avatarUrl: url });
                  }}
                />
                <form onSubmit={updateProfile}>
                  <Typography variant="body1" gutterBottom style={{ padding: "10px 0 0 0" }}>
                    Email: {props.session.user!.email}
                  </Typography>
                  <div style={{ padding: "10px 0 0 0" }}>
                    <TextField
                      id="username"
                      label="Name"
                      helperText="お名前（またはニックネームなど）を3文字以上で入力してください"
                      type="text"
                      value={username()}
                      onChange={(event, value) => {
                        setUsername(value);
                      }}
                      style="width: 100%"
                    />
                  </div>
                  <div style={{ padding: "10px 0 0 0" }}>
                    <TextField
                      id="website"
                      label="WebサイトURL"
                      helperText="お持ちのWebサイト・ホームページなどのURLを入力してください"
                      type="url"
                      value={website()}
                      onChange={(event, value) => {
                        setWebsite(value);
                      }}
                      style="width: 100%"
                    />
                  </div>
                  <div style={{ padding: "10px 0 0 0" }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading()}
                      style={{display: "flex", justifyContent: "center"}}
                      aria-live="polite"
                      sx={{width: "100%"}}
                    >
                      プロフィール更新
                    </Button>
                  </div>
                  <div style={{ padding: "10px 0 0 0" }}>
                    <Show when={message().text !== ''} fallback={<></>}>
                      <Alert severity={message().severity}>
                        {message().text}
                      </Alert>
                    </Show>
                  </div>
                </form>
              </>
            )}
          </div>
        </Stack>
      </Box>
    </div>
  );
}

export default Account;
