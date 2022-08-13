import { createSignal, onMount, Show } from "solid-js";
import { Provider } from "@supabase/supabase-js";
import { setFocus } from "./commons/setFocus";
import { supabase } from "./commons/supabaseClient";
import { Message } from "./types/common";
import Alert from "@suid/material/Alert";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Typography from "@suid/material/Typography";
import SendIcon from "@suid/icons-material/Send";
import GitHubIcon from "./GitHubIcon";

export default function Auth() {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [email, setEmail] = createSignal<string>("");
  const [message, setMessage] = createSignal<Message>({
    severity: "info",
    text: "",
  });

  onMount(() => {
    setFocus("email");
  });

  const handleLogin = async (event: Event) => {
    event.preventDefault();
    // マジックリンクを送信
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ email: email() });
      if (error) throw error;
      setMessage({
        severity: "success",
        text: "メールを送信しました。メール本文にあるリンクをクリックしてください。",
      });
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message || "送信失敗"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOauth = async (provider: Provider) => {
    // 外部の認証画面へ
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ provider: provider });
      if (error) throw error;
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message || "認証失敗"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  // メールアドレス入力画面を表示（マジックリンク送信用）
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "480px",
        minWidth: "300px",
      }}
    >
      <Box sx={{ padding: "10px 0 0 0" }}>
        <Typography variant="body1" gutterBottom>
          メールアドレスを入力して送信ボタンをクリックしてください。
        </Typography>
      </Box>
      {loading() ? (
        <Box sx={{ padding: "10px 0 0 0" }}>
          <Typography variant="body1" gutterBottom>
            マジックリンク送信中...
          </Typography>
        </Box>
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
            <Button
              variant="contained"
              type="submit"
              aria-live="polite"
              endIcon={<SendIcon />}
            >
              メールを送信
            </Button>
            <Typography variant="body1" gutterBottom>
              または、「GitHub でログイン」ボタンをクリックしてください。
            </Typography>
            <Button
              variant="contained"
              aria-live="polite"
              onClick={() => handleLoginOauth("github")}
              endIcon={<GitHubIcon />}
              sx={{
                backgroundColor: "#171515",
                textTransform: "none",
              }}
            >
              GitHub でログイン
            </Button>
            <Show when={message().text !== ""} fallback={<></>}>
              <Alert severity={message().severity}>{message().text}</Alert>
            </Show>
          </Stack>
        </form>
      )}
    </Box>
  );
}
