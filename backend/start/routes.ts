/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import env from '#start/env'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const TimerSessionsController = () => import('#controllers/timer_sessions_controller')

router.post('register', [AuthController, 'register']).as('auth.register')
router.post('login', [AuthController, 'login']).as('auth.login')
router.delete('logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
router.get('me', [AuthController, 'me']).as('auth.me')
router
  .put('profile', [AuthController, 'updateProfile'])
  .as('auth.updateProfile')
  .use(middleware.auth())
router
  .put('password', [AuthController, 'updatePassword'])
  .as('auth.updatePassword')
  .use(middleware.auth())
router
  .post('avatar', [AuthController, 'updateAvatar'])
  .as('auth.updateAvatar')
  .use(middleware.auth())

router.get('/', async () => {
  return {
    hello: env.get('DB_HOST'),
  }
})

router.get('/note', async () => {
  return {
    note: 'testnote',
  }
})

router.get('/health', async () => {
  return {
    status: 'ok',
  }
})

router.get('/timer_session_show', [TimerSessionsController, 'index']).as('timer.session_show')
router
  .group(() => {
    router.get('/timer', async (ctx) => {
      const { default: SessionsController } = await import('#controllers/sessions_controller')
      return new SessionsController().index(ctx)
    })

    router.post('/', async (ctx) => {
      const { default: SessionsController } = await import('#controllers/sessions_controller')
      return new SessionsController().store(ctx)
    })
  })
  .prefix('/api')
