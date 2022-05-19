import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { Session } from '@supabase/supabase-js';
import { NoteType } from './commons/NoteType';
import { Article } from './types/common';
import Avatar from '@suid/material/Avatar';
import Box from '@suid/material/Box';
import Card from '@suid/material/Card';
import CardActions from '@suid/material/CardActions';
import CardContent from '@suid/material/CardContent';
import DeleteIcon from '@suid/icons-material/Delete';
import EditIcon from '@suid/icons-material/Edit';
import ExpandLessIcon from '@suid/icons-material/ExpandLess';
import ExpandMoreIcon from '@suid/icons-material/ExpandMore';
import IconButton from '@suid/material/IconButton';
import PersonIcon from '@suid/icons-material/Person';
import Stack from '@suid/material/Stack';
import Typography from '@suid/material/Typography';
import './Item.css';

type Props = {
  session: Session,
  article: Article,
  avatar?: string,
  setArticle: (article: Article) => void,
  deleteArticleAction: (id: number) => void
}

const ViewItem = (props: Props) => {
  const [expand, setExpand] = createSignal<boolean>(false);

  const toggleExpand = () => {
    setExpand(!expand());
  }

  // 投稿カードを表示
  return (
    <Box sx={{ paddingBottom: "4px" }}>
      <Card
        id="itemCard"
        variant="outlined"
      >
        <CardContent>
          <Stack
            spacing={1}
            direction="row"
          >
            <CardActions sx={{ padding: 0 }}>
              <IconButton
                onClick={() => toggleExpand()}
                sx={{ padding: 0 }}
              >
                <Switch fallback={<></>}>
                  <Match when={!expand()}>
                    <ExpandMoreIcon aria-label="expand more"/>
                  </Match>
                  <Match when={expand()}>
                    <ExpandLessIcon aria-label="expand less"/>
                  </Match>
                </Switch>
              </IconButton>
            </CardActions>
            <Typography
              variant="h6"
              gutterBottom
            >
              {props.article.title}
            </Typography>
            <Show
              when={props.avatar && props.avatar !== ''}
              fallback={
                <Avatar
                  alt={props.article.userName}
                  sx={{
                    width: 28,
                    height: 28
                  }}
                >
                  <PersonIcon />
                </Avatar>
              }
            >
              <Avatar
                alt={props.article.userName}
                src={props.avatar}
                sx={{
                  width: 28,
                  height: 28
                }}
              />
            </Show>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
              sx={{ paddingTop: "1px" }}
            >
              {props.article.userName}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
              sx={{ paddingTop: "1px" }}
            >
              {props.article.updatedAt.toLocaleString('ja-JP')}
            </Typography>
          </Stack>
          <Show
            when={expand()}
            fallback={<></>}
          >
            <For
              each={props.article.note?.split('\n')}
              fallback={<></>}
            >
              {(line) =>
                <Typography
                  variant="body1"
                  gutterBottom
                >
                  {line}
                </Typography>
              }
            </For>
          </Show>
          <CardActions sx={{ padding: 0 }}>
            <IconButton
              aria-label="edit"
              onClick={() => props.setArticle(props.article)}
              disabled={
                props.article.userId !== props.session.user!.id && props.article.noteType !== NoteType.Writable
              }
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => props.deleteArticleAction(props.article.id!)}
              disabled={
                props.article.userId !== props.session.user!.id
              }
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ViewItem;
