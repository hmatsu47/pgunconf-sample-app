import { createEffect, Match, Switch } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import Account from './Account';
import List from './List';

type Props = {
  session: Session,
  route: string,
  getProfiled: () => void
}

const Contents = (props: Props) => {

  createEffect(() => {
    props.route;
  })

  // プロフィール画面か投稿一覧画面を表示
  return (
    <div aria-live="polite">
      <Switch fallback={<></>}>
        <Match when={props.route === 'profile'}>
          <Account session={props.session} getProfiled={() => props.getProfiled()}/>
        </Match>
        <Match when={props.route === 'list'}>
          <List session={props.session} />
        </Match>
      </Switch>
    </div>
  );
}

export default Contents;
