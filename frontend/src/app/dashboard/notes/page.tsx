import * as React from 'react';
import type { Metadata } from 'next';
import ClientNotesDashboardPage from './client-page';

import { config } from '@/config';

export const metadata: Metadata = {
  title: `Notes | ${config.site.name}`,
};

export default function Page() {
  return <ClientNotesDashboardPage />;
}