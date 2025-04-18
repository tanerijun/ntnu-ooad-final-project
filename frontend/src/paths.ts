export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    statistics: '/dashboard',
    account: '/dashboard/account',
    notes: '/dashboard/notes',
    timer: '/dashboard/timer',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
