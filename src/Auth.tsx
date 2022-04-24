import { createSignal } from 'solid-js';
import { supabase } from './supabaseClient';
import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import TextField from '@suid/material/TextField';
import Typography from '@suid/material/Typography';

export default function Auth() {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [email, setEmail] = createSignal<string>('');

  const handleLogin = async (event: Event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ email: email() });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      alert(error.error_description || error.message);
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
              <Button
                variant="contained"
                onClick={(event) => {
                  handleLogin(event);
                }}
                aria-live="polite"
              >
                メールを送信
              </Button>
            </Stack>
          </form>
        )}
      </Box>
    </div>
  );
};
