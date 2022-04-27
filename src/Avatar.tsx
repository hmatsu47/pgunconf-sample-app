import { createEffect, createSignal } from 'solid-js';
import { supabase } from './supabaseClient';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import Box from '@suid/material/Box';
import useTheme from '@suid/material/styles/useTheme';

type Props = {
  url: string,
  size: string,
  onUpload: (url: string) => void
}

export default (props: Props | null) => {
  const [avatarUrl, setAvatarUrl] = createSignal<string>('');
  const [uploading, setUploading] = createSignal<boolean>(false);

  createEffect(() => {
    if (!props) {
      return;
    }
    // 画像 URL が指定されていたらアバター画像をダウンロード
    if (props.url) downloadImage(props.url);
  })

  const downloadImage = async (path: string) => {
    // アバター画像をダウンロード（ストレージから）
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('アバター画像のダウンロードに失敗しました : ', error.message);
    }
  }

  const uploadAvatar = async (event: Event) => {
    // アバター画像をアップロード
    try {
      setUploading(true);

      const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      if (files.length === 0) {
        throw new Error('アップロードする画像を正しく選択してください');
      }

      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      if (!props) {
        return;
      }
      props.onUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  const theme = useTheme();
  // アバター画像とアップロードコントロールを表示
  return (
    <div style={{ width: props!.size }} aria-live="polite">
      <Stack direction="column" spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
        {avatarUrl() === '' ? (
          <Box
            sx={{
              height: props!.size,
              width: props!.size,
              backgroundColor: theme.palette.grey[100],
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            No image
          </Box>
        ) : (
          <img
            src={avatarUrl()}
            alt={'Avatar'}
            className="avatar image"
            style={{ height: props!.size, width: props!.size }}
          />
        )}
        {uploading() ? (
            <div>
            <Typography variant="body1" gutterBottom>
              アップロード中...
            </Typography>
          </div>
        ) : (
          <label htmlFor="contained-button-file">
            <span style="display:none">
              <input
                type="file"
                id="contained-button-file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading()}
              />
            </span>
            <Button variant="contained" component="span" style="width: 100%">
              アップロード
            </Button>
          </label>
        )}
      </Stack>
    </div>
  )
}
