### **User Authentication Flow**

```
Start
  |
  v
[Check if authentication token exists in browser cache]
  |
  v
<Token exists?>
  |                    |
  | Yes                | No
  v                    v
[Auto-login user]      [Display login form]
  |                    |
  v                    v
[Redirect to          [User enters email and password]
 dashboard]            |
  |                    v
  |                   [Submit login form]
  |                    |
  |                    v
  |                   <Valid credentials?>
  |                    |                    |
  |                    | Yes                | No
  |                    v                    v
  |                   [Generate auth token] [Display error message]
  |                    |                    |
  |                    v                    v
  |                   [Store token in      [Return to login form]
  |                    browser cache]       |
  |                    |                    |
  |                    v                    |
  |                   [Redirect to         |
  |                    dashboard] ---------|
  |                    |
  |                    |
  v                    v
[User successfully authenticated]
  |
  v
End
```

---

### **Note Creation and Management**

```
Start
  |
  v
[User clicks "Create Note"]
  |
  v
[Display note creation form]
  |
  v
[User enters title (optional)]
  |
  v
[User enters tags (optional)]
  |
  v
[User opens rich text editor]
  |
  v
<User wants to add image?>
  |                    |
  | Yes                | No
  v                    |
[User uploads image]   |
  |                    |
  v                    |
<Image valid?>         |
  |          |         |
  | Yes      | No      |
  v          v         |
[Insert     [Show      |
 image]     error] ----|
  |          |         |
  |          v         |
  |        [Return     |
  |         to editor] |
  |          |         |
  v          |         |
[User types content] <-|
  |                    |
  v                    |
[User applies formatting (bold, italic, etc.)] <-|
  |
  v
<More editing needed?>
  |                    |
  | Yes                | No
  v                    v
[Continue editing] ----[User saves note]
                        |
                        v
                       [Validate note data]
                        |
                        v
                       <Tags exist?>
                        |                    |
                        | No                 | Yes
                        v                    |
                       [Create new tags]     |
                        |                    |
                        v                    |
                       [Save note to        |
                        database] <---------|
                        |
                        v
                       [Update UI with new note]
                        |
                        v
                       [Show success message]
                        |
                        v
                       End
```

---

### **Timer Session Management**

```
Start
  |
  v
[Load today's tasks from database]
  |
  v
[Display task dashboard]
  |
  v
<User action?>
  |
  |-- Create New Session --|
  |                        |
  |-- Start Existing ----  |
  |   Session           |  |
  |                     |  |
  |-- Update Session ---|  |
                        |  |
                        v  v
[User selects action]
  |
  v
<Action type?>
  |                    |                    |
  | Create             | Start              | Update
  v                    v                    v
[Enter session name]   [Select session]     [Select session to edit]
  |                    |                    |
  v                    v                    v
[Create timer session] [Start timer]       [Modify session name/settings]
  |                    |                    |
  v                    v                    v
[Add to task list]     [Begin countdown]    [Update in database]
  |                    |                    |
  |                    v                    |
  |                   <Timer running?>      |
  |                    |         |         |
  |                    | Yes     | No      |
  |                    v         |         |
  |                   [Auto-sync |         |
  |                    every     |         |
  |                    interval] |         |
  |                    |         |         |
  |                    v         |         |
  |                   <User stops|         |
  |                    timer?>   |         |
  |                    |    |    |         |
  |                    | No | Yes|         |
  |                    v    v    |         |
  |                   [Continue [Stop      |
  |                    running] timer]     |
  |                    |    |    |         |
  |                    |    v    |         |
  |                    |   [Save|         |
  |                    |    final|         |
  |                    |    duration]      |
  |                    |    |    |         |
  v                    v    v    v         v
[Update daily study time display]
  |
  v
[Refresh task list]
  |
  v
<Continue using timer?>
  |                    |
  | Yes                | No
  v                    v
[Return to dashboard]  End
  |
  v
End (loop back to dashboard)
```

---

### **Reminder Management and Notification**

```
|| Start (Parallel Processes) ||
  |                           |
  | User Process              | System Process
  v                           v
[User Management]             [Notification Polling]
  |                           |
  v                           v
<User action?>                [Check for due reminders]
  |                           |
  |-- Create --|              v
  |-- View ----|              <Reminders due?>
  |-- Edit ----|               |              |
  |-- Delete --|               | Yes          | No
  |            |               v              v
  |            |              [Get unnotified [Wait interval]
  |            |               due reminders]  |
  |            |               |              |
  |            |               v              |
  |            |              [Send          |
  |            |               notifications]|
  |            |               |              |
  |            |               v              |
  |            |              [Mark as       |
  |            |               notified]     |
  |            |               |              |
  |            |               v              |
  |            |              [Continue      |
  |            |               polling] -----|
  |            |
  v            v
<Action type?>
  |                    |                    |                    |
  | Create             | View               | Edit               | Delete
  v                    v                    v                    v
[Show creation form]   [Display reminders] [Show edit form]    [Confirm deletion]
  |                    |                    |                    |
  v                    v                    v                    v
[Enter title,          [Filter by status:] [Modify reminder    [Delete from
 description,           - Upcoming          data]              database]
 date, time]           - Overdue           |                    |
  |                    - Completed]         v                    v
  v                    |                   [Update in database] [Update UI]
[Set completion        v                    |                    |
 status = false]       [Show in calendar    v                    |
  |                     and list views]    [Refresh display]    |
  v                    |                    |                    |
[Set notified          |                    |                    |
 status = false]       |                    |                    |
  |                    |                    |                    |
  v                    |                    |                    |
[Save to database]     |                    |                    |
  |                    |                    |                    |
  v                    v                    v                    v
[Update UI display] <--|---------------------|--------------------
  |
  v
<Continue managing?>
  |                    |
  | Yes                | No
  v                    v
[Return to            End
 reminder interface]
  |
  v
End (loop back)

Note: User Process and System Process run concurrently
```

---

### **Global Search Process**

```
Start
  |
  v
<User triggers search?>
  |                              |
  | Ctrl+K shortcut              | Click search
  v                              v
[Open search modal]              [Focus search bar]
  |                              |
  v                              |
[Focus on search input] <--------|
  |
  v
[User types search query]
  |
  v
<Query length > 0?>
  |                    |
  | Yes                | No
  v                    v
[Start debounce timer] [Clear results]
  |                    |
  v                    |
<Timer expires?>       |
  |           |        |
  | Yes       | No     |
  v           v        |
[Send search [Reset    |
 request]    timer]    |
  |           |        |
  v           |        |
[Search in:] |        |
- Note titles|        |
- Note content        |
- Tag names] |        |
  |           |        |
  v           |        |
<Results     |        |
 found?>     |        |
  |     |    |        |
  | Yes | No |        |
  v     v    |        |
[Display [Show     |
 results] "No      |
  |       results"] |
  v       |    |        |
[Highlight      |        |
 matching text] |        |
  |       |    |        |
  v       v    v        v
[Show results list] <----|
  |
  v
<User selects result?>
  |                    |
  | Yes                | No
  v                    v
[Navigate to note]     <Continue typing?>
  |                    |                    |
  v                    | Yes                | No
[Close search modal]   v                    v
  |                    [Update query] ----> [Close search]
  v                      |                    |
End                      v                    v
                        [Restart debounce]   End
                         |
                         v
                        [Continue search process]
```

---

### **File Upload Process**

```
Start
  |
  v
[User selects image file]
  |
  v
[Validate file type]
  |
  v
<Valid image type?>
  |                    |
  | Yes                | No
  v                    v
[Check file size]      [Show error: Invalid file type]
  |                    |
  v                    v
<Size < 10MB?>         [Return to file selection]
  |                    |
  | Yes                | No
  v                    v
<File > 1MB?>          [Show error: File too large]
  |         |          |
  | Yes     | No       v
  v         |          [Return to file selection]
[Compress  |
 image]    |
  |         |
  v         |
[Generate  |
 unique    |
 filename] |
  |         |
  v         v
[Upload to cloud storage]
  |
  v
<Upload successful?>
  |                    |
  | Yes                | No
  v                    v
[Generate public URL]  [Show upload error]
  |                    |
  v                    v
[Store metadata in     [Retry upload?]
 database]             |           |
  |                    | Yes       | No
  v                    v           v
[Return file info      [Retry] ----[Cancel upload]
 to client]            |           |
  |                    |           v
  v                    |          End
[Insert into editor]   |
  |                    |
  v                    |
[Show success message]|
  |                    |
  v                    |
End                   End
```
