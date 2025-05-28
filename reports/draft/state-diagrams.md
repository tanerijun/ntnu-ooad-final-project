### **User Authentication State**

```
States:
- [Initial] → Unauthenticated
- Authenticating
- Authenticated
- Session_Expired
- Logging_Out

Transitions:

[Initial] → Unauthenticated
    trigger: Application starts
    action: Check for stored token

Unauthenticated → Authenticating
    trigger: login(email, password) OR register(userData)
    guard: [valid input provided]
    action: Send credentials to server

Unauthenticated → Authenticated
    trigger: autoLogin()
    guard: [valid token exists in storage]
    action: Validate token with server

Authenticating → Authenticated
    trigger: authSuccess
    action: Store authentication token / Redirect to dashboard

Authenticating → Unauthenticated
    trigger: authFailure
    action: Display error message / Clear any stored tokens

Authenticated → Session_Expired
    trigger: tokenExpired OR apiError(401)
    action: Clear stored token / Show session expired message

Authenticated → Logging_Out
    trigger: logout()
    action: Send logout request to server

Logging_Out → Unauthenticated
    trigger: logoutComplete
    action: Clear authentication token / Clear user data / Redirect to login

Session_Expired → Unauthenticated
    trigger: userAcknowledged OR timeout
    action: Redirect to login page

Internal Transitions:
Authenticated → Authenticated
    trigger: updateProfile() / changePassword() / updateAvatar()
    action: Update user data
```

### **Note Lifecycle State**

```
States:
- [Initial] → New_Note
- Draft
- Saved
- Editing
- Saving
- Deleting
- Deleted

Composite State: Content_Modified
    - Text_Changed
    - Tags_Modified
    - Title_Changed

Transitions:

[Initial] → New_Note
    trigger: createNote()
    action: Initialize empty note / Open editor

New_Note → Draft
    trigger: userStartsTyping
    action: Enable auto-save timer

Draft → Saving
    trigger: saveNote() OR autoSaveTimer
    guard: [content has changes]
    action: Send data to server

Draft → Saved
    trigger: saveNote()
    guard: [no changes pending]
    action: Show "already saved" status

Saving → Saved
    trigger: saveSuccess
    action: Update last saved timestamp / Clear dirty flag

Saving → Draft
    trigger: saveError
    action: Show error message / Retain changes

Saved → Editing
    trigger: userModifiesContent
    action: Set dirty flag / Start auto-save timer

Editing → Saving
    trigger: autoSaveTimer OR explicitSave()
    action: Send changes to server

Saved → Deleting
    trigger: deleteNote()
    guard: [user confirms deletion]
    action: Send delete request

Deleting → Deleted
    trigger: deleteSuccess
    action: Remove from UI / Show success message

Deleting → Saved
    trigger: deleteError
    action: Show error message / Restore note

Internal Transitions:
Editing → Editing
    trigger: textChanged / tagsModified / titleChanged
    action: Update content / Reset auto-save timer

Draft → Draft
    trigger: contentChanged
    action: Reset auto-save timer

Entry Actions:
- New_Note: entry/ focus editor, initialize rich text editor
- Editing: entry/ enable keyboard shortcuts, start auto-save
- Saving: entry/ show saving indicator
- Saved: entry/ show saved indicator, clear auto-save timer

Exit Actions:
- Editing: exit/ save current cursor position
- Deleting: exit/ clean up resources
```

### **Timer Session State**

```
States:
- [Initial] → Idle
- Running
- Paused
- Stopped
- Syncing
- Completed

Composite State: Active_Session
    - Running
    - Paused
    substates: Running → Paused, Paused → Running

Transitions:

[Initial] → Idle
    trigger: sessionCreated
    action: Initialize timer with 0 duration

Idle → Running
    trigger: startTimer()
    action: Start timer clock / Begin auto-sync / Show running indicator

Running → Paused
    trigger: pauseTimer()
    action: Stop timer clock / Maintain current duration

Paused → Running
    trigger: resumeTimer()
    action: Resume timer clock / Continue auto-sync

Running → Syncing
    trigger: autoSyncInterval (every 30 seconds)
    action: Send current duration to server

Syncing → Running
    trigger: syncSuccess
    action: Continue timer / Update last sync time

Syncing → Running
    trigger: syncError
    action: Continue timer / Schedule retry

Running → Stopped
    trigger: stopTimer()
    action: Stop timer clock / Final sync to server

Paused → Stopped
    trigger: stopTimer()
    action: Final sync to server

Stopped → Completed
    trigger: finalSyncSuccess
    action: Update session record / Show completion

Stopped → Running
    trigger: restartTimer()
    action: Reset duration / Start fresh

Any_State → Idle
    trigger: resetTimer()
    action: Clear duration / Stop all timers

Internal Transitions:
Running → Running
    trigger: tick (every second)
    action: Increment duration / Update display

Running → Running
    trigger: subjectChanged
    action: Update session metadata

Entry Actions:
- Running: entry/ start interval timer, enable pause button
- Paused: entry/ show pause indicator, enable resume button
- Syncing: entry/ show sync indicator
- Stopped: entry/ show final duration, calculate session stats

Exit Actions:
- Running: exit/ clear interval timer
- Syncing: exit/ clear sync indicator
- Active_Session: exit/ save session state
```

### **Reminder State**

```
States:
- [Initial] → Scheduled
- Pending
- Notified
- Overdue
- Completed
- Dismissed
- Expired

Transitions:

[Initial] → Scheduled
    trigger: reminderCreated(dateTime)
    action: Store in database / Schedule notification

Scheduled → Pending
    trigger: reminderTimeReached
    guard: [current time >= reminder time]
    action: Mark as pending / Add to notification queue

Pending → Notified
    trigger: notificationSent
    action: Mark as notified / Show in notification UI

Notified → Completed
    trigger: markCompleted()
    action: Set completion flag / Remove from active list

Notified → Dismissed
    trigger: dismissReminder()
    action: Mark as dismissed / Hide from notifications

Scheduled → Overdue
    trigger: timeElapsed
    guard: [current time > reminder time + grace period]
    action: Mark as overdue / Change UI color to red

Overdue → Completed
    trigger: markCompleted()
    action: Set completion flag / Clear overdue status

Overdue → Notified
    trigger: userViewsReminder
    action: Mark as notified / Show overdue indicator

Any_Active_State → Scheduled
    trigger: editReminder(newDateTime)
    guard: [new time > current time]
    action: Update reminder time / Reschedule

Any_State → Expired
    trigger: autoCleanup
    guard: [reminder age > retention period]
    action: Archive or delete reminder

Completed → Scheduled
    trigger: markIncomplete()
    action: Clear completion flag / Reactivate reminder

Internal Transitions:
Scheduled → Scheduled
    trigger: editDetails()
    action: Update title, description

Any_State → Any_State
    trigger: updateReminder()
    action: Modify reminder properties

Entry Actions:
- Scheduled: entry/ calculate time until due, set notification timer
- Pending: entry/ add to notification queue
- Notified: entry/ show notification badge
- Overdue: entry/ change UI to overdue styling
- Completed: entry/ update completion timestamp

Exit Actions:
- Scheduled: exit/ cancel notification timer
- Pending: exit/ remove from queue if not processed
- Notified: exit/ clear notification badge

Concurrent Regions:
Notification_Status: {Not_Notified, Notified}
Completion_Status: {Incomplete, Complete}
Visibility_Status: {Visible, Dismissed, Archived}
```

### **Tag Management State**

```
States:
- [Initial] → Non_Existent
- Creating
- Active
- Unused
- Deleting
- Deleted

Transitions:

[Initial] → Non_Existent
    trigger: system startup
    action: Initialize tag repository

Non_Existent → Creating
    trigger: createTag(name)
    guard: [tag name not exists]
    action: Validate tag name / Send create request

Creating → Active
    trigger: createSuccess
    action: Add to tag list / Update UI

Creating → Non_Existent
    trigger: createError
    action: Show error message / Revert creation

Active → Unused
    trigger: lastNoteUntagged
    guard: [no notes have this tag]
    action: Mark as unused / Update display

Unused → Active
    trigger: tagAssignedToNote
    action: Mark as active / Update display

Active → Deleting
    trigger: deleteTag()
    guard: [user confirms deletion]
    action: Send delete request / Remove from notes

Unused → Deleting
    trigger: deleteTag()
    action: Send delete request

Deleting → Deleted
    trigger: deleteSuccess
    action: Remove from UI / Clean up references

Deleting → Active
    trigger: deleteError
    action: Show error message / Restore tag

Non_Existent → Active
    trigger: tagFoundInNote
    action: Auto-create tag / Add to repository

Internal Transitions:
Active → Active
    trigger: renameTag()
    action: Update tag name / Sync with server

Active → Active
    trigger: noteTagged / noteUntagged
    action: Update usage count

Entry Actions:
- Creating: entry/ show loading indicator
- Active: entry/ enable tag operations, show in sidebar
- Unused: entry/ dim tag appearance
- Deleting: entry/ show deletion progress

Exit Actions:
- Active: exit/ save current state
- Deleting: exit/ clean up UI references
```

### **Application Search State**

```
States:
- [Initial] → Search_Closed
- Search_Open
- Typing
- Debouncing
- Searching
- Results_Displayed
- No_Results

Transitions:

[Initial] → Search_Closed
    trigger: applicationStart
    action: Initialize search components

Search_Closed → Search_Open
    trigger: Ctrl+K OR clickSearchIcon()
    action: Open search modal / Focus input field

Search_Open → Typing
    trigger: userStartsTyping
    action: Clear previous results / Start input capture

Typing → Debouncing
    trigger: keyPressed
    action: Reset debounce timer (300ms)

Debouncing → Searching
    trigger: debounceTimerExpired
    guard: [query length > 0]
    action: Send search request to server

Debouncing → Search_Open
    trigger: queryCleared
    action: Clear results / Reset search state

Searching → Results_Displayed
    trigger: searchResultsReceived
    guard: [results count > 0]
    action: Display results / Highlight matches

Searching → No_Results
    trigger: searchResultsReceived
    guard: [results count = 0]
    action: Display "no results" message

Results_Displayed → Search_Closed
    trigger: resultSelected OR escapePressed
    action: Navigate to selected item / Close modal

No_Results → Typing
    trigger: userModifiesQuery
    action: Clear no results message / Resume typing

Any_Open_State → Search_Closed
    trigger: escapePressed OR clickOutside
    action: Close search modal / Clear state

Results_Displayed → Debouncing
    trigger: queryModified
    action: Reset debounce timer / Prepare new search

Internal Transitions:
Typing → Typing
    trigger: characterTyped
    action: Update query display

Results_Displayed → Results_Displayed
    trigger: navigateResults(up/down)
    action: Highlight next/previous result

Entry Actions:
- Search_Open: entry/ focus input, show search UI
- Searching: entry/ show loading spinner
- Results_Displayed: entry/ highlight first result
- No_Results: entry/ show empty state message

Exit Actions:
- Search_Open: exit/ clear input field
- Searching: exit/ cancel pending requests
- Results_Displayed: exit/ clear result highlights
```
