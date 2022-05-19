import { createEffect, createSignal } from 'solid-js';
import { downloadImage } from './commons/downloadImage';
import { supabase } from './commons/supabaseClient';
import { Message } from './types/common';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import Box from '@suid/material/Box';
import UploadIcon from '@suid/icons-material/Upload';
import useTheme from '@suid/material/styles/useTheme';

type Props = {
  url: string,
  size: string,
  onUpload: (url: string) => void,
  setMessage: (message: Message) => void,
  getAvatarImages: () => void
}

export default (props: Props | null) => {
  const [avatarUrl, setAvatarUrl] = createSignal<string>('');
  const [uploading, setUploading] = createSignal<boolean>(false);

  createEffect(async () => {
    if (!props) {
      return;
    }
    // 画像 URL が指定されていたらアバター画像をダウンロード
    if (props.url) {
      const url = await downloadImage(props.url, props.setMessage);
      if (!url) {
        return;
      }
      setAvatarUrl(url);
    }
  })

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

      let { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      if (!props) {
        return;
      }
      await props.getAvatarImages();
      await props.onUpload(filePath);
    } catch (error) {
      if (!props) {
        return;
      }
      props.setMessage({
        severity: 'error',
        text: `エラーが発生しました : ${
          error.error_description ||
          error.message ||
          'アップロード失敗'
        }`
      });
    } finally {
      setUploading(false);
    }
  }

  const theme = useTheme();
  // アバター画像とアップロードコントロールを表示
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        width: props!.size,
        display: "flex",
        justifyContent: "center"
      }}
      aria-live="polite"
    >
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
          <Typography variant="body1">
            No image
          </Typography>
        </Box>
      ) : (
        <img
          src={avatarUrl()}
          alt={'Avatar'}
          class="avatar image"
          style={{ height: props!.size, width: props!.size }}
        />
      )}
      {uploading() ? (
        <Box>
          <Typography
            variant="body1"
            gutterBottom
          >
            アップロード中...
          </Typography>
        </Box>
      ) : (
        <label for="contained-button-file">
          <span style="display:none">
            <input
              type="file"
              id="contained-button-file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading()}
            />
          </span>
          <Button
            variant="contained"
            component="span"
            sx={{ width: "100%" }}
            endIcon={<UploadIcon />}
          >
            アップロード
          </Button>
        </label>
      )}
    </Stack>
  )
}
