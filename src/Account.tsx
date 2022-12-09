import { createSignal, createEffect, Accessor, Show, Setter } from "solid-js";
import { AuthSession } from "@supabase/supabase-js";
import { downloadImage } from "./commons/downloadImage";
import { setFocus } from "./commons/setFocus";
import { supabase } from "./commons/supabaseClient";
import { Message } from "./types/common";
import Alert from "@suid/material/Alert";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Typography from "@suid/material/Typography";
import SaveIcon from "@suid/icons-material/Save";
import EditAvatar from "./EditAvatar";

type Props = {
  session: AuthSession;
  setUserName: Setter<string | null>;
  setUserAvatarUrl: Setter<string | null>;
  getAvatarImages: () => void;
};
type UpdateParams = {
  username: Accessor<string>;
  website: Accessor<string>;
  avatarUrl: string;
};

const Account = (props: Props) => {
  const [loading, setLoading] = createSignal<boolean>(true);
  const [updating, setUpdating] = createSignal<boolean>(false);
  const [username, setUsername] = createSignal<string>("");
  const [website, setWebsite] = createSignal<string>("");
  const [avatarUrl, setAvatarUrl] = createSignal<string>("");
  const [secretNote, setSecretNote] = createSignal<string>("");
  const [message, setMessage] = createSignal<Message>({
    severity: "info",
    text: "",
  });

  createEffect(() => {
    getProfile();
  });

  createEffect(() => {
    if (!loading()) {
      setFocus("username");
    }
  });

  const getPrivate = async () => {
    // プロフィール秘密情報読み取り（DB から）
    const { user } = props.session;
    // @ts-ignore
    const { data, error, status } = await supabase
      .from("decrypted_privates")
      .select(`decrypted_secret_note, note_id`)
      .eq("userid", user.id)
      .single();

    if (error && status !== 406) {
      throw error;
    }
    return data;
  };

  const getProfile = async () => {
    // プロフィール読み取り（DB から）
    try {
      setLoading(true);
      const { user } = props.session;

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }

      const note = await getPrivate();

      if (note) {
        // @ts-ignore
        setSecretNote(note.decrypted_secret_note);
      } else {
        setSecretNote("");
      }
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrivate = async () => {
    // プロフィール秘密情報更新（DB へ）
    const { user } = props.session;
    // UPSERT は使わない
    const note = await getPrivate();

    const data = {
      userid: user.id,
      secret_note: secretNote(),
      updated_at: new Date(),
    };
    const { error } = await supabase.from("privates").insert(data);
    if (error) {
      throw error;
    }
    // 実は削除はできない（API は受け付けるが…）
    if (note) {
      const { error } = await supabase
        .from("privates")
        .delete()
        // @ts-ignore
        .eq("note_id", note.note_id);
      if (error) {
        throw error;
      }
    }
  };

  const updateProfile = async (
    e: UpdateParams | { submitter: HTMLElement }
  ) => {
    // プロフィール更新（DB へ）
    try {
      setUpdating(true);
      setLoading(true);
      const { user } = props.session;

      const updates = {
        id: user.id,
        username: username(),
        website: website(),
        avatar_url: avatarUrl(),
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      await updatePrivate();

      setMessage({
        severity: "success",
        text: "プロフィールを更新しました。",
      });
      if (avatarUrl()) {
        const url: string | undefined = await downloadImage(
          avatarUrl(),
          setMessage
        );
        if (url) {
          props.setUserAvatarUrl(url);
        }
      }
      props.setUserName(username());
    } catch (error) {
      setMessage({
        severity: "error",
        text: `エラーが発生しました : ${
          error.error_description || error.message || "更新失敗"
        }`,
      });
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  // プロフィール画面を表示
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: "320px",
        maxWidth: "420px",
        display: "flex",
        justifyContent: "center",
      }}
      aria-live="polite"
    >
      <Stack spacing={2} direction="column">
        <Box sx={{ padding: "10px 0 0 0" }}>
          {loading() ? (
            <Typography variant="body1" gutterBottom>
              {updating() ? "保存中..." : ""}
            </Typography>
          ) : (
            <>
              <Stack direction="row">
                <EditAvatar
                  url={avatarUrl()}
                  size={"150px"}
                  onUpload={(url: string) => {
                    setAvatarUrl(url);
                    updateProfile({
                      username,
                      website,
                      avatarUrl: url,
                    });
                  }}
                  setMessage={setMessage}
                  getAvatarImages={props.getAvatarImages}
                />
                <Typography
                  variant="body1"
                  sx={{
                    padding: "54px 0 0 0",
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">Email:</Typography>
                    <Typography variant="body2">
                      {props.session.user!.email}
                    </Typography>
                  </Box>
                </Typography>
              </Stack>
              <form onSubmit={updateProfile}>
                <Box sx={{ padding: "20px 0 0 0" }}>
                  <TextField
                    required
                    id="username"
                    label="Name"
                    helperText="お名前（またはニックネームなど）を3文字以上で入力してください"
                    type="text"
                    value={username()}
                    onChange={(event, value) => {
                      setUsername(value);
                    }}
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box sx={{ padding: "20px 0 0 0" }}>
                  <TextField
                    id="website"
                    label="WebサイトURL"
                    helperText="お持ちのWebサイト・ホームページなどのURLを入力してください"
                    type="url"
                    value={website()}
                    onChange={(event, value) => {
                      setWebsite(value);
                    }}
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box sx={{ padding: "20px 0 0 0" }}>
                  <TextField
                    id="secret"
                    label="秘密の情報"
                    helperText="秘密の情報があれば入力してください"
                    type="text"
                    value={secretNote()}
                    onChange={(event, value) => {
                      setSecretNote(value);
                    }}
                    sx={{ width: "100%" }}
                  />
                </Box>
                <Box sx={{ padding: "10px 0 0 0" }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading()}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                    aria-live="polite"
                    endIcon={<SaveIcon />}
                  >
                    プロフィール更新
                  </Button>
                </Box>
                <Box sx={{ padding: "10px 0 0 0" }}>
                  <Show when={message().text !== ""} fallback={<></>}>
                    <Alert severity={message().severity}>
                      {message().text}
                    </Alert>
                  </Show>
                </Box>
              </form>
            </>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Account;
