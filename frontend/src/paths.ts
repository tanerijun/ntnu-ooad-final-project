export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up' },
  dashboard: {
    statistics: '/dashboard',
    account: '/dashboard/account',
    notes: '/dashboard/notes',
    timer: '/dashboard/timer',
    settings: '/dashboard/settings',
    topic: '/dashboard/topic'
  },
  errors: { notFound: '/errors/not-found' },
} as const;
