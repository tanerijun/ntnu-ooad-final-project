'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { logger } from '@/lib/default-logger';
import { timerSessionsClient } from '@/lib/timer/client';
import { useUser } from '@/hooks/use-user';

export function AddTimerButton({ onSuccess }: { onSuccess: () => void }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  //得到使用者資料
  const { user } = useUser();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = async () => {
    if (!user) {
      setError('使用者未登入');
      return;
    }

    const subject = name.trim();
    if (!subject) {
      setError('請輸入科目名稱');
      return;
    }

    try {
      const result = await timerSessionsClient.addUserTaskSetting(Number(user.id), name, true);
      if (result.success) {
        handleClose();
        setName('');
        onSuccess && onSuccess(); // 新增成功後呼叫刷新函式（如有）
      } else {
        setError('新增失敗，請檢查資料是否重複或網路連線');
      }
    } catch (err) {
      setError('新增失敗，請檢查網路連線');
      logger.error('API 錯誤:', err);
    }
  };

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // 小小延遲 100ms 比較安全

      return () => {
        clearTimeout(timer);
      }; // 記得清掉 timer，避免 memory leak
    }
  }, [open]);

  return (
    <>
      <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpen}>
        Add
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>新增計時紀錄</DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <TextField
            inputRef={inputRef}
            margin="dense"
            label="活動名稱"
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name} // 輸入為空時禁用按鈕
          >
            儲存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
