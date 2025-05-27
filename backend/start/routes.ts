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
const UserTaskController = () => import('#controllers/user_task_controller')
const NotesController = () => import('#controllers/notes_controller')
const UploadController = () => import('#controllers/upload_controller')
const TagsController = () => import('#controllers/tags_controller')
const RemindersController = () => import('#controllers/reminders_controller')

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

router
  .group(() => {
    router.get('notes', [NotesController, 'index']).as('notes.index')
    router.get('notes/search', [NotesController, 'search']).as('notes.search')
    router.post('notes', [NotesController, 'store']).as('notes.store')
    router.get('notes/:id', [NotesController, 'show']).as('notes.show')
    router.put('notes/:id', [NotesController, 'update']).as('notes.update')
    router.delete('notes/:id', [NotesController, 'destroy']).as('notes.destroy')

    router.get('tags', [TagsController, 'index']).as('tags.index')
    router.post('tags', [TagsController, 'store']).as('tags.store')
    router.delete('tags/:id', [TagsController, 'destroy']).as('tags.destroy')

    router.get('reminders', [RemindersController, 'index']).as('reminders.index')
    router.post('reminders', [RemindersController, 'store']).as('reminders.store')
    router.get('reminders/pending', [RemindersController, 'getPending']).as('reminders.pending')
    router.get('reminders/:id', [RemindersController, 'show']).as('reminders.show')
    router.put('reminders/:id', [RemindersController, 'update']).as('reminders.update')
    router.delete('reminders/:id', [RemindersController, 'destroy']).as('reminders.destroy')

    router.post('upload/image', [UploadController, 'uploadImage']).as('upload.image')
    router.delete('upload/image', [UploadController, 'deleteImage']).as('upload.delete')
  })
  .use(middleware.auth())

router.get('/health', async () => {
  return {
    status: 'ok',
  }
})
router.put('/timer_sessions/:id', [TimerSessionsController, 'update']).as('timer.session_update')
router.post('/timer_sessions_store', [TimerSessionsController, 'store']).as('timer.session_store')
router.get('/timer_session_show', [TimerSessionsController, 'index']).as('timer.session_show')
router.put('/user_tasks_hide/:subject', [UserTaskController, 'hide']).use(middleware.auth())
router.get('/user_tasks_today', [UserTaskController, 'index']).use(middleware.auth())
router.post('/user_tasks_store', [UserTaskController, 'store']).as('user.task_store')
