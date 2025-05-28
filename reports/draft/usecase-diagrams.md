### **Actors:**

1. **Student** (Primary Actor) - The main user of the study helper application
2. **System Timer** (Secondary Actor) - Automated timer synchronization system
3. **Notification System** (Secondary Actor) - Handles reminder notifications

### **System Boundary:**

OOAD Study Helper Application

### **Use Cases with Relationships:**

```
Actors:
- Student
- System Timer
- Notification System

System: [OOAD Study Helper Application]

Use Cases and Relationships:

1. Authentication Module:
   Student --> (Register Account)
   Student --> (Login to System)
   Student --> (Logout from System)
   Student --> (Update Profile)
   Student --> (Change Password)
   Student --> (Upload Avatar)

2. Notes Management Module:
   Student --> (Create Note)
   Student --> (View Notes List)
   Student --> (Edit Note)
   Student --> (Delete Note)
   Student --> (Search Notes)
   Student --> (Manage Tags)

   (Create Note) extends (Add Tags to Note)
   (Edit Note) extends (Modify Tags)
   (Create Note) includes (Use Rich Text Editor)
   (Edit Note) includes (Use Rich Text Editor)

3. Study Timer Module:
   Student --> (Create Timer Session)
   Student --> (Start Timer)
   Student --> (Stop Timer)
   Student --> (View Daily Study Time)
   Student --> (View Timer Sessions)
   Student --> (Update Timer Session)
   Student --> (Delete Timer Session)
   Student --> (Hide Task Subject)

   System Timer --> (Auto Sync Timer Data)
   (Start Timer) includes (Auto Sync Timer Data)
   (View Daily Study Time) includes (Aggregate Timer Sessions)

4. Reminders Module:
   Student --> (Create Reminder)
   Student --> (View Calendar)
   Student --> (View Upcoming Reminders)
   Student --> (View Today's Reminders)
   Student --> (Mark Reminder Complete)
   Student --> (Edit Reminder)
   Student --> (Delete Reminder)

   Notification System --> (Send Reminder Notifications)
   Notification System --> (Poll for Due Reminders)
   (View Upcoming Reminders) extends (View Overdue Reminders)
   (View Upcoming Reminders) extends (View Completed Reminders)

5. Statistics & Analytics Module:
   Student --> (View Study Statistics)
   Student --> (View Notes Analytics)
   Student --> (View Tag Distribution)
   Student --> (View Monthly Activity)
   Student --> (View Study Goal Progress)

   (View Study Statistics) includes (Analyze Timer Data)
   (View Notes Analytics) includes (Analyze Note Content)
   (View Tag Distribution) includes (Analyze Tag Usage)

6. Search & Navigation Module:
   Student --> (Global Search)
   Student --> (Navigate by Tags)
   Student --> (Quick Note Access)

   (Global Search) includes (Search Notes)
   (Global Search) includes (Search by Tags)
   (Navigate by Tags) includes (Filter Notes by Tag)

7. File Management Module:
   Student --> (Upload Images)
   Student --> (Delete Images)

   (Use Rich Text Editor) includes (Upload Images)

Relationships:
- extends: Indicates optional or conditional behavior
- includes: Indicates required sub-functionality
- Actor associations: Direct interactions between actors and use cases
```

### **Use Case Specifications:**

**UC-01: Login to System**

- **Actor:** Student
- **Preconditions:** User has registered account
- **Main Flow:**
  1. Student enters email and password
  2. System validates credentials
  3. System stores authentication token
  4. System redirects to dashboard
- **Alternative Flow:** Auto-login if token exists
- **Postconditions:** Student is authenticated

**UC-02: Create Note**

- **Actor:** Student
- **Preconditions:** Student is logged in
- **Main Flow:**
  1. Student clicks create note
  2. Student enters title and tags
  3. Student uses rich text editor for content
  4. System creates tags if they don't exist
  5. System saves note
- **Includes:** Use Rich Text Editor
- **Postconditions:** Note is created and saved

**UC-03: Start Timer**

- **Actor:** Student, System Timer
- **Preconditions:** Student is logged in
- **Main Flow:**
  1. Student creates/selects timer session
  2. Student starts timer
  3. System Timer auto-syncs data at intervals
  4. Student can view real-time progress
- **Includes:** Auto Sync Timer Data
- **Postconditions:** Timer session is active and tracked

**UC-04: Create Reminder**

- **Actor:** Student
- **Preconditions:** Student is logged in
- **Main Flow:**
  1. Student opens reminder creation
  2. Student enters title, description, date, time
  3. System schedules reminder
  4. System sets notification flags
- **Postconditions:** Reminder is scheduled

**UC-05: Send Reminder Notifications**

- **Actor:** Notification System
- **Preconditions:** Reminders exist and are due
- **Main Flow:**
  1. System polls for due reminders
  2. System identifies unnotified reminders
  3. System sends notifications
  4. System marks reminders as notified
- **Postconditions:** Due reminders are notified

**UC-06: Global Search**

- **Actor:** Student
- **Trigger:** Ctrl+K keyboard shortcut
- **Includes:** Search Notes, Search by Tags
- **Features:** Debounced search, real-time results

**UC-07: View Study Statistics**

- **Actor:** Student
- **Includes:** Analyze Timer Data, Analyze Note Content, Analyze Tag Usage
- **Features:** Charts, progress tracking, analytics
