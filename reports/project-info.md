# OOAD Study Helper

Created as a final project for the Object-Oriented Analysis and Design course at National Taiwan Normal University.

The project is a full stack study productivity application that helps users manage their study materials, track their study time, and analyze their study habits.

## Tech Stack

- Programming Language: TypeScript
- Database: PostgreSQL
- Frontend Framework: React
- Backend Framework: AdonisJS

## Features

- Auth:
  - Login
    - Store authentication token in browser cache
    - If user has authentication token, automatically log user in
    - else: ask user for email and password
      - Save authentication token in browser cache
  - Register
    - Ask for user’s data (name, email, password)
    - Save authentication in browser cache
    - Redirect user to login page
    - Authentication token found in browser cache → Auto login
  - Logout
    - Delete authentication token
    - Redirect to login page
- Statistics:
  - Fetch data (user, notes, timers, reminders) from DB
  - Perform analysis
  - Render charts for visualization
    - Show notes analysis
    - Show tags analysis
    - Show study goal progress
    - Show monthly study activity
    - Show tag distribution
    - Show note content analytics
    - Show recently updated notes for quick access
- Notes:
  - Show list of notes: show title, content preview, tags, last updated time
  - Create note:
    - Ask for title, tags, and note content
      - For each tag in tags: create tag if not yet available
      - User writes note content using “rich text editor”
        - “Rich text editor” supports the following operations:
          - Writing text with different formatting: bold, italic, underline, strikethrough
          - Writing text with different semantics: headers, body, quotes
          - Writing text with different alignments: left, center, right, justify
          - Inserting image
          - Undo (Ctrl + Z)
          - Redo (Ctrl + Shift + Z)
        - “Rich text editor” supports keyboard shortcut for easier editing
          - Press help button in editor toolbar for more info
  - Update note: same as “Create note”, but modify existing record in DB instead of creating a new one
  - Delete note: delete note from DB
- Timer:
  - Show daily study time (synced real-time with running timers)
    - Aggregate the total time of all timer sessions
  - Show daily timer sessions (synced real-time with running timers)
  - Create timer session
    - Ask for timer session name
  - Run timer
    - Automatically sync timer with DB every predetermined interval
  - Update timer session
    - Change timer session name
  - Delete timer session
    - Remove timer session from DB
- Reminders:
  - Show calendar
  - Show upcoming reminders
  - Show today’s reminders
  - Reminder UI
    - Different UI for upcoming reminder, overdue reminder, completed reminder
  - Create reminder:
    - Ask for title, description, date, time
  - Update reminder:
    - Checkbox to indicate completion
    - Allow updating title, description, date, time
  - Delete reminder:
    - Remove reminder from DB
- Notification:
  - Constantly poll server for ongoing reminders
  - Show reminder title and description
  - Shortcut to reminders page
- Search:
  - Support opening search from anywhere using keyboard shortcut (Ctrl + K)
  - Automatic search when user stop typing
    - Implemented debouncing to avoid spamming the backend
  - Click on search result redirects to note edit page
- Account:
  - Allow changing profile picture
  - Update name
  - Update email
  - Update password
- Tags:
  - Located in sidebar
  - Allow quick note filtering using tags
  - Allow creating tags
  - Creating new note from tag page automatically pre-fill tags field in form with the current tag

## Completion Degree

The project is 100% complete, with all features implemented as described above. The application has been tested and is ready for use.

## Comments: Challenging Parts

### Real-time Timer Synchronization

One challenging aspect was implementing auto-sync timer functionality that maintains data consistency across multiple browser sessions while handling network failures gracefully.

**The Problem:** Users needed real-time timer updates that persist to the database without overwhelming the server or causing UI lag. The system had to handle concurrent sessions, duplicate subject validation, and cascade operations when users renamed timer subjects.

**Our Solution:** We implemented a 30-second auto-sync interval instead of syncing every second, reducing server load by 30x while maintaining acceptable data loss windows. The backend uses optimistic concurrency control with complex validation logic to prevent duplicate subjects and maintain referential integrity.

### Global Tag State Management

Managing tag synchronization across multiple UI components without causing performance issues or state inconsistencies.

**The Problem:** Tags needed to be accessible from multiple components (sidebar, note editor, search) while staying synchronized with the database. Changes in one component had to reflect immediately in all others without excessive API calls.

**Our Solution:** We implemented the Singleton pattern with the Observer pattern for the TagManager class. This provides centralized state management with event-driven updates to subscribed components.

### Rich Text Editor with Image Upload

Integrating image upload functionality within a rich text editor while maintaining performance and handling large files.

**The Problem:** Users needed to upload images directly in the note editor, but large images would slow down the interface and consume excessive bandwidth. The system also needed to handle upload failures gracefully.

**Our Solution:** We implemented client-side image compression before upload, with automatic resizing and quality adjustment based on file size. The system validates file types and sizes before processing.

### Search with Debouncing and Complex Queries

Implementing responsive search that queries across notes, content, and tags without overwhelming the database.

**The Problem:** Users expected real-time search results as they typed, but searching across multiple tables with LIKE operations on every keystroke would create performance issues and excessive database load.

**My Solution:** I implemented 300ms debouncing on the frontend and optimized database queries using proper indexing and query structure. The search combines results from notes titles, content, and associated tags.

### Reminder Notification System

Creating a polling-based notification system that checks for due reminders without creating excessive server load.

**The Problem:** The application needed to notify users of due reminders in real-time, but implementing WebSocket infrastructure seemed overkill for this use case. Polling every second would create unnecessary load.

**My Solution:** I implemented smart polling that checks for due reminders every 60 seconds, automatically marks them as notified to prevent duplicate notifications, and uses browser notifications API for user alerts.
