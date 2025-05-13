import * as React from 'react';
import type { Metadata } from 'next';
import ClientNotesDashboardPage from './client-page';

export const metadata: Metadata = {
  title: 'Notes | YourSiteName',
};

export default function Page() {
  return <ClientNotesDashboardPage />;
}