export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up' },
  dashboard: {
    statistics: '/dashboard',
    account: '/dashboard/account',
    notes: {
      index: '/dashboard/notes',
      details: (id: number) => `/dashboard/notes/${id}/edit`,
    },
    timer: '/dashboard/timer',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
