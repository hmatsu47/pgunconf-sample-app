import { createEffect, Switch, Match } from 'solid-js';
import { PropsFromApp } from './types/common';
import Account from './Account';
import List from './List';

const Contents = (props: PropsFromApp) => {

  createEffect(() => {
    props.route;
  })

  // プロフィール画面か投稿一覧画面を表示
  return (
    <div aria-live="polite">
      <Switch fallback={<></>}>
        <Match when={props.route! === 'profile'}>
          <Account key={props.session.user!.id} session={props.session} />
        </Match>
        <Match when={props.route! === 'list'}>
          <List key={props.session.user!.id} session={props.session} />
        </Match>
      </Switch>
    </div>
  );
}

export default Contents;
