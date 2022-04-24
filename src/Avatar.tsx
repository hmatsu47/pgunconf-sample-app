import { createEffect, createSignal } from 'solid-js';
import { supabase } from './supabaseClient';
// import VisuallyHidden from '@reach/visually-hidden';
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
    if (props.url) downloadImage(props.url);
  })

  const downloadImage = async (path: string) => {
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
    try {
      setUploading(true);

      const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      if (files.length === 0) {
        throw new Error('You must select an image to upload.');
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

  return (
    <div style={{ width: props!.size }} aria-live="polite">
      <img
        src={avatarUrl() !== '' ? avatarUrl() : `https://place-hold.it/${props!.size}x${props!.size}`}
        alt={avatarUrl() !== '' ? 'Avatar' : 'No image'}
        className="avatar image"
        style={{ height: props!.size, width: props!.size }}
      />
      {uploading() ? (
        'Uploading...'
      ) : (
        <>
          <label className="button primary block" htmlFor="single">
            Upload
          </label>
          <span style="display:none">
            <input
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading()}
            />
          </span>
        </>
      )}
    </div>
  )
}
