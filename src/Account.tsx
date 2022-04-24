import { Session } from '@supabase/supabase-js';
import { createSignal, createEffect, Accessor } from 'solid-js';
import { supabase } from './supabaseClient';
import Avatar from './Avatar';

type Props = {
  key: string,
  session: Session
}
type UpdateParams = {
  username: Accessor<string>,
  website: Accessor<string>,
  avatarUrl: string
}

const Account = (props: Props) => {
  const [loading, setLoading] = createSignal<boolean>(true);
  const [username, setUsername] = createSignal<string>('');
  const [website, setWebsite] = createSignal<string>('');
  const [avatarUrl, setAvatarUrl] = createSignal<string>('');

  createEffect(() => {
    props.session;
    getProfile();
  })

  const getProfile = async () => {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user!.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const updateProfile = async (e: UpdateParams | { submitter: HTMLElement; }) => {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      const updates = {
        id: user!.id,
        username: username(),
        website: website(),
        avatar_url: avatarUrl(),
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div aria-live="polite">
      {loading() ? (
        'Saving ...'
      ) : (
        <>
          <div className="form-widget">
            <Avatar
              url={avatarUrl()}
              size={"150px"}
              onUpload={(url: string) => {
                setAvatarUrl(url);
                updateProfile({ username, website, avatarUrl: url });
              }}
            />
          </div>
          <form onSubmit={updateProfile} className="form-widget">
            <div>Email: {props.session.user!.email}</div>
            <div>
              <label htmlFor="username">Name</label>
              <input
                id="username"
                type="text"
                value={username()}
                onChange={(e) => {
                  if (!(e.target instanceof HTMLInputElement)) {
                    return;
                  }
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div>
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                value={website()}
                onChange={(e) => {
                  if (!(e.target instanceof HTMLInputElement)) {
                    return;
                  }
                  setWebsite(e.target.value);
                }}
              />
            </div>
            <div>
              <button className="button block primary" disabled={loading()}>
                Update profile
              </button>
            </div>
          </form>
        </>
      )}
      <button type="button" className="button block" onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
}

export default Account;
