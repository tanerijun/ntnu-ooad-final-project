'use client'

import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus'

export function AddTimerButton(): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSave = () => {
    console.log('使用者輸入：', name)
    // TODO: 你可以在這裡呼叫 API 或處理資料
    setOpen(false)
  }

  return (
    <>
      <Button
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        variant="contained"
        onClick={handleOpen}
      >
        Add
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>新增計時紀錄</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="活動名稱"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSave} variant="contained">儲存</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
