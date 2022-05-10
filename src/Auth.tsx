import { createSignal, onMount, Show } from 'solid-js';
import { supabase } from './commons/supabaseClient';
import Alert from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import SendIcon from '@suid/icons-material/Send';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { Message } from './types/common';
import { setFocus } from './commons/setFocus';

export default function Auth() {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [email, setEmail] = createSignal<string>('');
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });

  onMount(() => {
    setFocus('email');
  })

  const handleLogin = async (event: Event) => {
    event.preventDefault();
    // マジックリンクを送信
    try {
      setLoading(true);
      const { error } = await supabase
        .auth
        .signIn({ email: email() });
      if (error) throw error;
      setMessage({
        severity: 'success',
        text: 'メールを送信しました。メール本文にあるリンクをクリックしてください。'
      });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${error.error_description || error.message}`
      });
    } finally {
      setLoading(false);
    }
  }

  const handleLoginGithub = async () => {
    // GitHub の認証画面へ
    try {
      setLoading(true);
      const { error } = await supabase
        .auth
        .signIn({ provider: 'github' });
      if (error) throw error;
    } catch (error) {
      setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${error.error_description || error.message}`
      });
    } finally {
      setLoading(false);
    }
  }

  // メールアドレス入力画面を表示（マジックリンク送信用）
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "480px",
        minWidth: "300px"
      }}
    >
      <Box sx={{ padding: "10px 0 0 0" }}>
        <Typography
          variant="body1"
          gutterBottom
        >
          メールアドレスを入力して送信ボタンをクリックしてください。
        </Typography>
      </Box>
      {loading() ? (
        <Box sx={{ padding: "10px 0 0 0" }}>
          <Typography
            variant="body1"
            gutterBottom
          >
            マジックリンク送信中...
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleLogin}>
          <Stack
            spacing={2}
            direction="column"
          >
            <TextField
              required
              id="email"
              label="メールアドレス"
              helperText="メールアドレスを入力してください"
              value={email()}
              onChange={(event, value) => {
                setEmail(value);
              }}
            />
            <Button
              variant="contained"
              type="submit"
              aria-live="polite"
              endIcon={<SendIcon />}
            >
              メールを送信
            </Button>
            <Button
              variant="contained"
              aria-live="polite"
              onClick={() => handleLoginGithub()}
              sx={{ backgroundColor: "black" }}
            >
              GitHub でログイン
            </Button>
            <Show
              when={message().text !== ''}
              fallback={<></>}
            >
              <Alert severity={message().severity}>
                {message().text}
              </Alert>
            </Show>
          </Stack>
        </form>
      )}
    </Box>
  );
};
