import { createSignal, onMount, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import Alert from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';
import { Message } from './types/common';

export default function Auth() {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [email, setEmail] = createSignal<string>('');
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });

  onMount(() => {
    const element = document.getElementById('email');
    element?.focus();
  })

  const handleLogin = async (event: Event) => {
    event.preventDefault();
    // マジックリンクを送信
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ email: email() });
      if (error) throw error;
      setMessage({ severity: 'success', text: 'メールを送信しました。メール本文にあるリンクをクリックしてください。' });
    } catch (error) {
      setMessage({ severity: 'error', text: error.error_description || error.message });
    } finally {
      setLoading(false);
    }
  }

  // メールアドレス入力画面を表示（マジックリンク送信用）
  return (
    <div aria-live="polite">
      <Box sx={{ width: "100%", maxWidth: "480px", minWidth: "300px" }}>
        <div style={{ padding: "10px 0 0 0" }}>
          <Typography variant="body1" gutterBottom>
            メールアドレスを入力して送信ボタンをクリックしてください。
          </Typography>
        </div>
        {loading() ? (
          <div style={{ padding: "10px 0 0 0" }}>
            <Typography variant="body1" gutterBottom>
              マジックリンク送信中...
            </Typography>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <Stack spacing={2} direction="column">
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
              <Button variant="contained" type="submit" aria-live="polite">
                メールを送信
              </Button>
              <Show when={message().text !== ''} fallback={<></>}>
                <Alert severity={message().severity}>
                  {message().text}
                </Alert>
              </Show>
            </Stack>
          </form>
        )}
      </Box>
    </div>
  );
};
