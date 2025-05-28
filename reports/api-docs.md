## Auth

```
POST /register    - User registration
POST /login       - User login
DELETE /logout    - User logout
GET /me           - Get current user
PUT /profile      - Update user profile
PUT /password     - Update password
```

## Notes

```
GET /notes           - Get all user notes
POST /notes          - Create new note
GET /notes/search    - Search notes
GET /notes/:id       - Get specific note
PUT /notes/:id       - Update note
DELETE /notes/:id    - Delete note
```

## Timer

```
GET /timer_session_show       - Get timer sessions
POST /timer_sessions_store    - Create timer session
PUT /timer_sessions/:id       - Update timer session
GET /user_tasks_today         - Get today's tasks
PUT /user_tasks_hide/:subject - Hide task subject
POST /user_tasks_store        - Create task setting
```

## Tags

```
GET /tags           - Get user tags
POST /tags          - Create tag
DELETE /tags/:id    - Delete tag
```

## Reminders

```
GET /reminders         - Get reminders
POST /reminders        - Create reminder
PUT /reminders/:id     - Update reminder
DELETE /reminders/:id  - Delete reminder
GET /reminders/pending - Get pending reminders
```

## Image Upload

```
POST /upload/image   - Upload image
DELETE /upload/image - Delete image
```
