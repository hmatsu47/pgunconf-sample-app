import { createEffect, createSignal } from 'solid-js';
import { supabase } from './supabaseClient';
import Button from '@suid/material/Button';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';

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
      console.log('Error downloading image: ', error.message);
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

  // アバター画像とアップロードコントロールを表示
  return (
    <div style={{ width: props!.size }} aria-live="polite">
      <img
        src={avatarUrl() !== '' ? avatarUrl() : `https://place-hold.it/${props!.size}x${props!.size}`}
        alt={avatarUrl() !== '' ? 'Avatar' : 'No image'}
        className="avatar image"
        style={{ height: props!.size, width: props!.size }}
      />
        {uploading() ? (
          <div>
          <Typography variant="body1" gutterBottom>
            アップロード中...
          </Typography>
        </div>
      ) : (
        <Stack direction="row" spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
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
            <Button variant="contained" component="span">
              アップロード
            </Button>
          </label>
        </Stack>
      )}
    </div>
  )
}
