### **User Login Process**

```
Actors/Objects:
- User
- Browser
- AuthClient
- ApiClient
- AuthController
- AuthService
- User(Model)
- Database

Sequence:

User -> Browser: Enter email and password
Browser -> AuthClient: signInWithPassword({email, password})
AuthClient -> ApiClient: post('/login', {email, password})
ApiClient -> ApiClient: getHeaders()
ApiClient -> ApiClient: buildUrl('/login')
ApiClient -> AuthController: HTTP POST /login

AuthController -> AuthController: validateUsing(loginValidator)
AuthController -> AuthService: authenticateUser(email, password)
AuthService -> User(Model): verifyCredentials(email, password)
User(Model) -> Database: SELECT * FROM users WHERE email = ?
Database -> User(Model): User record
User(Model) -> User(Model): hash.verify(password, hashedPassword)

alt [Valid Credentials]
    User(Model) -> AuthService: User object
    AuthService -> User(Model): accessTokens.create(user)
    User(Model) -> Database: INSERT INTO access_tokens
    Database -> User(Model): Token created
    User(Model) -> AuthService: AccessToken
    AuthService -> AuthController: AccessToken
    AuthController -> ApiClient: {token: "abc123"}
    ApiClient -> AuthClient: {token: "abc123"}
    AuthClient -> Browser: localStorage.setItem('access-token', token)
    Browser -> Browser: Store token in localStorage
    AuthClient -> Browser: {} (success)
    Browser -> User: Redirect to dashboard

else [Invalid Credentials]
    User(Model) -> AuthService: throw Error
    AuthService -> AuthController: Error thrown
    AuthController -> ApiClient: HTTP 401 Unauthorized
    ApiClient -> AuthClient: throw Error
    AuthClient -> Browser: {error: "Authentication failed"}
    Browser -> User: Display error message
end
```

### **Note Creation with Tags**

```
Actors/Objects:
- User
- Browser
- NotesClient
- TagManager
- TagsClient
- ApiClient
- NotesController
- NotesService
- TagsService
- Note(Model)
- Tag(Model)
- Database

Sequence:

User -> Browser: Click "Create Note"
Browser -> NotesClient: create(title, tags)
NotesClient -> ApiClient: post('/notes', {title, content: '', tags})
ApiClient -> NotesController: HTTP POST /notes

NotesController -> NotesController: auth.check()
NotesController -> NotesService: createNote(userId, title, content, tagNames)

NotesService -> NotesService: findOrCreateTags(tagNames)

loop [for each tag in tagNames]
    NotesService -> Tag(Model): findBy('name', tagName)
    Tag(Model) -> Database: SELECT * FROM tags WHERE name = ?

    alt [Tag exists]
        Database -> Tag(Model): Tag record
        Tag(Model) -> NotesService: Existing tag

    else [Tag doesn't exist]
        Database -> Tag(Model): null
        Tag(Model) -> NotesService: null
        NotesService -> Tag(Model): create({name: tagName})
        Tag(Model) -> Database: INSERT INTO tags
        Database -> Tag(Model): New tag created
        Tag(Model) -> NotesService: New tag
    end
end

NotesService -> Note(Model): create({title, content, userId})
Note(Model) -> Database: INSERT INTO notes
Database -> Note(Model): Note created

NotesService -> Note(Model): related('tags').sync(tagIds)
Note(Model) -> Database: INSERT INTO note_tags (note_id, tag_id)
Database -> Note(Model): Associations created

NotesService -> Note(Model): load('tags')
Note(Model) -> Database: SELECT tags for note
Database -> Note(Model): Tags loaded

Note(Model) -> NotesService: Complete note with tags
NotesService -> NotesController: Note object
NotesController -> ApiClient: Note JSON
ApiClient -> NotesClient: Note object
NotesClient -> Browser: Note created

Browser -> TagManager: syncTagsFromNotes(note.tags)
TagManager -> TagsClient: getAll()
TagsClient -> ApiClient: get('/tags')
ApiClient -> TagsController: HTTP GET /tags
TagsController -> TagsService: getUserTags(userId)
TagsService -> Database: Complex query for user tags
Database -> TagsService: Tag list
TagsService -> TagsController: Tags
TagsController -> ApiClient: Tags JSON
ApiClient -> TagsClient: Tags array
TagsClient -> TagManager: Updated tags
TagManager -> TagManager: notifyListeners()
TagManager -> Browser: Dispatch 'tagsUpdated' event

Browser -> User: Display new note in UI
Browser -> User: Update sidebar with new tags
```

### **Timer Session with Auto-Sync**

```
Actors/Objects:
- User
- Browser
- TimerComponent
- TimerSessionsClient
- ApiClient
- TimerSessionsController
- TimerService
- TimerSession(Model)
- SystemTimer
- Database

Sequence:

User -> Browser: Click "Start Timer"
Browser -> TimerComponent: startTimer(sessionName)
TimerComponent -> TimerSessionsClient: create({user_id, date, subject, duration: 0})
TimerSessionsClient -> ApiClient: post('/timer_sessions_store', data)
ApiClient -> TimerSessionsController: HTTP POST /timer_sessions_store

TimerSessionsController -> TimerService: createTimerSession(data)
TimerService -> TimerSession(Model): create(data)
TimerSession(Model) -> Database: INSERT INTO timer_sessions
Database -> TimerSession(Model): Session created
TimerSession(Model) -> TimerService: TimerSession object
TimerService -> TimerSessionsController: TimerSession
TimerSessionsController -> ApiClient: Session JSON
ApiClient -> TimerSessionsClient: Session object
TimerSessionsClient -> TimerComponent: Session created

TimerComponent -> SystemTimer: setInterval(updateTimer, 1000)
TimerComponent -> SystemTimer: setInterval(autoSync, 30000)

loop [Every second while running]
    SystemTimer -> TimerComponent: tick()
    TimerComponent -> TimerComponent: increment duration
    TimerComponent -> Browser: Update timer display
    Browser -> User: Show updated time
end

loop [Every 30 seconds while running]
    SystemTimer -> TimerComponent: autoSync()
    TimerComponent -> TimerSessionsClient: update(sessionId, {duration})
    TimerSessionsClient -> ApiClient: put('/timer_sessions/{id}', {duration})
    ApiClient -> TimerSessionsController: HTTP PUT /timer_sessions/{id}

    TimerSessionsController -> TimerService: updateTimerSession(id, {duration})
    TimerService -> TimerSession(Model): findOrFail(id)
    TimerSession(Model) -> Database: SELECT * FROM timer_sessions WHERE id = ?
    Database -> TimerSession(Model): Session record
    TimerSession(Model) -> TimerService: Session object
    TimerService -> TimerSession(Model): session.duration = newDuration
    TimerSession(Model) -> TimerSession(Model): save()
    TimerSession(Model) -> Database: UPDATE timer_sessions SET duration = ?
    Database -> TimerSession(Model): Update confirmed
    TimerSession(Model) -> TimerService: Updated session
    TimerService -> TimerSessionsController: Session
    TimerSessionsController -> ApiClient: Success response
    ApiClient -> TimerSessionsClient: Success
    TimerSessionsClient -> TimerComponent: Sync complete
end

User -> Browser: Click "Stop Timer"
Browser -> TimerComponent: stopTimer()
TimerComponent -> SystemTimer: clearInterval(timerInterval)
TimerComponent -> SystemTimer: clearInterval(syncInterval)
TimerComponent -> TimerSessionsClient: update(sessionId, {duration: finalDuration})

note right of TimerSessionsClient: Final sync follows same pattern as auto-sync

TimerSessionsClient -> Browser: Timer stopped
Browser -> User: Show final session time
```

### **Reminder Notification System**

```
Actors/Objects:
- User
- Browser
- NotificationSystem
- ReminderClient
- ApiClient
- RemindersController
- ReminderService
- Reminder(Model)
- Database
- SystemClock

Sequence:

== Reminder Creation ==
User -> Browser: Create reminder
Browser -> ReminderClient: createReminder({title, description, reminderTime})
ReminderClient -> ReminderClient: transformToSnakeCase(data)
ReminderClient -> ApiClient: post('/reminders', transformedData)
ApiClient -> RemindersController: HTTP POST /reminders

RemindersController -> ReminderService: createReminder(userId, data)
ReminderService -> Reminder(Model): create({...data, user_id, is_completed: false, is_notified: false})
Reminder(Model) -> Database: INSERT INTO reminders
Database -> Reminder(Model): Reminder created
Reminder(Model) -> ReminderService: Reminder object
ReminderService -> RemindersController: Reminder
RemindersController -> ApiClient: Reminder JSON
ApiClient -> ReminderClient: Reminder object
ReminderClient -> Browser: Reminder created
Browser -> User: Show success message

== Notification Polling (Continuous Process) ==
loop [Every 60 seconds]
    SystemClock -> NotificationSystem: polling interval
    NotificationSystem -> ReminderClient: getPendingReminders()
    ReminderClient -> ApiClient: get('/reminders/pending')
    ApiClient -> RemindersController: HTTP GET /reminders/pending

    RemindersController -> ReminderService: getPendingReminders(userId)
    ReminderService -> Reminder(Model): query()
    Reminder(Model) -> Database: SELECT * FROM reminders WHERE user_id = ? AND reminder_time <= NOW() AND is_notified = false AND is_completed = false
    Database -> Reminder(Model): Pending reminders

    ReminderService -> Reminder(Model): update({is_notified: true})
    Reminder(Model) -> Database: UPDATE reminders SET is_notified = true
    Database -> Reminder(Model): Update confirmed

    Reminder(Model) -> ReminderService: Pending reminders list
    ReminderService -> RemindersController: Reminders array
    RemindersController -> ApiClient: Reminders JSON
    ApiClient -> ReminderClient: Reminders array
    ReminderClient -> NotificationSystem: Pending reminders

    alt [Has pending reminders]
        loop [For each pending reminder]
            NotificationSystem -> Browser: showNotification(reminder)
            Browser -> User: Display notification popup
            NotificationSystem -> Browser: updateNotificationBadge()
            Browser -> User: Show notification count
        end

    else [No pending reminders]
        NotificationSystem -> NotificationSystem: Continue polling
    end
end

== User Interaction with Notification ==
User -> Browser: Click notification
Browser -> NotificationSystem: notificationClicked(reminderId)
NotificationSystem -> Browser: navigateToReminders()
Browser -> Browser: Route to reminders page
Browser -> User: Show reminders interface

User -> Browser: Mark reminder as complete
Browser -> ReminderClient: updateReminder(id, {isCompleted: true})
ReminderClient -> ReminderClient: transformToSnakeCase({isCompleted: true})
ReminderClient -> ApiClient: put('/reminders/{id}', {is_completed: true})

note right of ApiClient: Update follows same pattern as creation
```

### **Global Search Process**

```
Actors/Objects:
- User
- Browser
- SearchComponent
- DebounceTimer
- NotesClient
- ApiClient
- NotesController
- NotesService
- Database

Sequence:

User -> Browser: Press Ctrl+K
Browser -> SearchComponent: openSearch()
SearchComponent -> Browser: Show search modal
SearchComponent -> Browser: Focus search input
Browser -> User: Display search interface

User -> Browser: Type search query
Browser -> SearchComponent: onInputChange(query)
SearchComponent -> DebounceTimer: clearTimeout(previousTimer)
SearchComponent -> DebounceTimer: setTimeout(performSearch, 300ms)

alt [User continues typing within 300ms]
    User -> Browser: Type more characters
    Browser -> SearchComponent: onInputChange(newQuery)
    SearchComponent -> DebounceTimer: clearTimeout(previousTimer)
    SearchComponent -> DebounceTimer: setTimeout(performSearch, 300ms)
    note right of DebounceTimer: Timer resets, search delayed

else [User stops typing for 300ms]
    DebounceTimer -> SearchComponent: timeout expired
    SearchComponent -> SearchComponent: performSearch(query)

    alt [Query length > 0]
        SearchComponent -> NotesClient: search(query)
        NotesClient -> ApiClient: get('/notes/search', {params: {q: query}})
        ApiClient -> NotesController: HTTP GET /notes/search?q=query

        NotesController -> NotesService: searchNotes(userId, query)
        NotesService -> NotesService: Build search query
        NotesService -> Database: Complex search query (title, content, tags)

        note right of Database:
        SELECT notes.* FROM notes
        LEFT JOIN note_tags ON notes.id = note_tags.note_id
        LEFT JOIN tags ON note_tags.tag_id = tags.id
        WHERE notes.user_id = ? AND (
            notes.title ILIKE '%query%' OR
            notes.content ILIKE '%query%' OR
            tags.name ILIKE '%query%'
        )

        Database -> NotesService: Search results
        NotesService -> NotesController: Notes array with tags
        NotesController -> ApiClient: Notes JSON
        ApiClient -> NotesClient: Notes array
        NotesClient -> SearchComponent: Search results

        alt [Results found]
            SearchComponent -> Browser: displayResults(results)
            Browser -> SearchComponent: highlightMatches(query)
            SearchComponent -> Browser: Show results list
            Browser -> User: Display search results with highlights

        else [No results found]
            SearchComponent -> Browser: showNoResults()
            Browser -> User: Display "No results found" message
        end

    else [Empty query]
        SearchComponent -> Browser: clearResults()
        Browser -> User: Clear search results
    end
end

== User Selects Result ==
User -> Browser: Click on search result
Browser -> SearchComponent: selectResult(noteId)
SearchComponent -> Browser: navigateToNote(noteId)
Browser -> Browser: Route to note editor
SearchComponent -> Browser: closeSearchModal()
Browser -> User: Show selected note in editor

== User Cancels Search ==
User -> Browser: Press Escape OR click outside
Browser -> SearchComponent: closeSearch()
SearchComponent -> DebounceTimer: clearTimeout(activeTimer)
SearchComponent -> Browser: hideSearchModal()
SearchComponent -> SearchComponent: clearSearchState()
Browser -> User: Hide search interface
```

### **File Upload Process**

```
Actors/Objects:
- User
- Browser
- RichTextEditor
- ImageClient
- ApiClient
- UploadController
- UploadService
- CloudStorage
- Database

Sequence:

User -> Browser: Click image upload button in editor
Browser -> RichTextEditor: triggerImageUpload()
RichTextEditor -> Browser: openFileDialog()
Browser -> User: Show file picker dialog

User -> Browser: Select image file
Browser -> RichTextEditor: onFileSelected(file)
RichTextEditor -> ImageClient: upload(file, compressOptions)

ImageClient -> ImageClient: validateImage(file)

alt [File validation fails]
    ImageClient -> ImageClient: return {error: "Invalid file"}
    ImageClient -> RichTextEditor: {error: "Invalid file type"}
    RichTextEditor -> Browser: showError("Invalid file type")
    Browser -> User: Display error message

else [File validation passes]
    alt [File size > 1MB]
        ImageClient -> ImageClient: compressImage(file, options)
        ImageClient -> Browser: Create canvas element
        Browser -> ImageClient: Canvas context
        ImageClient -> ImageClient: Draw and compress image
        ImageClient -> ImageClient: Convert to blob
        note right of ImageClient: processedFile = compressed version

    else [File size <= 1MB]
        note right of ImageClient: processedFile = original file
    end

    ImageClient -> ApiClient: post('/upload/image', formData)
    ApiClient -> UploadController: HTTP POST /upload/image (multipart)

    UploadController -> UploadController: request.file('image')
    UploadController -> UploadService: uploadImage(imageFile)

    UploadService -> UploadService: validateImageFile(imageFile)
    UploadService -> UploadService: generateUniqueFilename()
    UploadService -> CloudStorage: moveToDisk(filename, 'r2')
    CloudStorage -> UploadService: Upload complete

    UploadService -> CloudStorage: getUrl(filename)
    CloudStorage -> UploadService: R2 URL
    UploadService -> UploadService: transformUrl(r2Url)

    UploadService -> UploadController: {filename, url, originalName, size}
    UploadController -> ApiClient: {success: true, data: uploadResult}
    ApiClient -> ImageClient: Upload response
    ImageClient -> RichTextEditor: {data: {url, filename}}

    RichTextEditor -> RichTextEditor: insertImageIntoEditor(url)
    RichTextEditor -> Browser: Update editor content
    Browser -> User: Show image in editor

    RichTextEditor -> Browser: showSuccessMessage("Image uploaded")
    Browser -> User: Display success notification
end

== Error Handling ==
alt [Upload fails at any point]
    note over ApiClient, CloudStorage: Error occurs
    CloudStorage -> UploadService: Error
    UploadService -> UploadController: throw Error
    UploadController -> UploadController: handleUploadError(error)
    UploadController -> ApiClient: {success: false, error: message}
    ApiClient -> ImageClient: throw Error
    ImageClient -> ImageClient: getErrorMessage(error)
    ImageClient -> RichTextEditor: {error: "Upload failed"}
    RichTextEditor -> Browser: showError(errorMessage)
    Browser -> User: Display error message
end
```
