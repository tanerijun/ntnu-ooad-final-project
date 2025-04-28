// src/app/dashboard/timer/page.tsx

import { config } from '@/config';
import TimerPage from './timer-page'; // 👈 等一下要新增這個檔案

export const metadata = { title: `Timer | ${config.site.name}` };

export default function Page() {
  return <TimerPage />;
}
