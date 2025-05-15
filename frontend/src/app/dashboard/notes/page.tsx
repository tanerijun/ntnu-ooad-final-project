import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';

import ClientNotesDashboardPage from './client-page';

export const metadata: Metadata = {
  title: `Notes | ${config.site.name}`,
};

export default function Page() {
  return <ClientNotesDashboardPage />;
}
