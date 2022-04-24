import { createSignal, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import Alert, { AlertColor } from '@suid/material/Alert';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';

type Message = {
  severity: AlertColor,
  text: string
}

export default function Auth() {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [email, setEmail] = createSignal<string>('');
  const [message, setMessage] = createSignal<Message>({ severity: 'info', text: '' });

  const handleLogin = async (event: Event) => {
    event.preventDefault();

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

  return (
    <div aria-live="polite">
      <Box sx={{ width: "100%", maxWidth: "480px", minWidth: "300px" }}>
        <Typography variant="h5" component="div" gutterBottom>
          Supabase (RLS) + SolidJS のサンプル
        </Typography>
        <Typography variant="body1" gutterBottom>
          メールアドレスを入力して送信ボタンをクリックしてください。
          その後、届いたメールのリンクをクリックしてください。
        </Typography>
        {loading() ? (
          <Typography variant="body1" gutterBottom>
            マジックリンク送信中...
          </Typography>
        ) : (
          <form onSubmit={handleLogin}>
            <Stack spacing={2} direction="column">
              <TextField
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
