import Box from '@suid/material/Box';
import Typography from '@suid/material/Typography';
import { PropsFromApp } from './types/common';

const List = (props: PropsFromApp) => {

  // 投稿一覧画面を表示
  return (
    <div aria-live="polite">
      <Box sx={{ width: "100%", minWidth: "320px", display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "10px 0 0 0" }}>
          <Typography variant="body1" gutterBottom>
            ただいま作成中
          </Typography>
        </div>
      </Box>
    </div>
  );
}

export default List;
