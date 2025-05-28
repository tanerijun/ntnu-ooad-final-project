# OOAD Study Helper

A study productivity application created for NTNU OOAD (Object-Oriented Analysis and Design) course final project.

## Main Features

- **Authentication System**: User registration, login, profile management
- **Notes Management**: Rich text editor with text formatting, image upload, tagging system
- **Study Timer**: Real-time timer sessions with auto-sync
- **Reminders**: Calendar-based reminder system with notifications
- **Statistics**: Study analytics and progress tracking
- **Global Search**: Efficient search across notes and tags

## Tech Stack

- Programming Language: TypeScript
- Database: PostgreSQL
- Frontend Framework: React
- Backend Framework: AdonisJS

## File Organization

```
ooad-final/
├── README.md                     # This file - project setup guide
├── backend/                      # AdonisJS Backend Application
│   ├── app/
│   │   ├── controllers/          # HTTP Controllers (Presentation Layer)
│   │   │   ├── auth_controller.ts
│   │   │   ├── notes_controller.ts
│   │   │   ├── tags_controller.ts
│   │   │   ├── timer_sessions_controller.ts
│   │   │   ├── reminders_controller.ts
│   │   │   ├── upload_controller.ts
│   │   │   └── user_task_controller.ts
│   │   ├── models/               # Domain Models (Data Layer)
│   │   │   ├── user.ts
│   │   │   ├── note.ts
│   │   │   ├── tag.ts
│   │   │   ├── timer_session.ts
│   │   │   ├── reminder.ts
│   │   │   └── user_task.ts
│   │   ├── services/             # Business Logic Layer
│   │   │   ├── base_service.ts   # Abstract base class
│   │   │   ├── auth_service.ts
│   │   │   ├── notes_service.ts
│   │   │   ├── tags_service.ts
│   │   │   ├── timer_service.ts
│   │   │   ├── reminder_service.ts
│   │   │   └── upload_service.ts
│   │   ├── validators/           # Request validation schemas
│   │   ├── middleware/           # HTTP middleware
│   │   └── exceptions/           # Custom exception handlers
│   ├── database/
│   │   ├── migrations/           # Database schema migrations
│   │   └── seeders/              # Database seed files
│   ├── config/                   # Application configuration
│   ├── start/                    # Application startup files
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── adonisrc.ts               # AdonisJS configuration
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── app/                  # Next.js app router pages
│   │   ├── components/           # React UI components
│   │   ├── lib/                  # Client libraries and utilities
│   │   │   ├── api/
│   │   │   │   └── client.ts     # Base API client (Facade pattern)
│   │   │   ├── auth/
│   │   │   │   └── client.ts     # Authentication client
│   │   │   ├── notes/
│   │   │   │   └── client.ts     # Notes API client
│   │   │   ├── tags/
│   │   │   │   ├── client.ts     # Tags API client
│   │   │   │   └── storage.ts    # Tag manager (Singleton pattern)
│   │   │   ├── timer/
│   │   │   │   └── client.ts     # Timer sessions client
│   │   │   ├── reminder/
│   │   │   │   └── client.ts     # Reminders client
│   │   │   └── image/
│   │   │       └── client.ts     # Image upload client
│   │   ├── types/                # TypeScript type definitions
│   │   ├── hooks/                # Custom React hooks
│   │   ├── contexts/             # React context providers
│   │   └── styles/               # CSS and styling files
│   ├── public/                   # Static assets
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── next.config.mjs           # Next.js configuration
│   └── tsconfig.json             # TypeScript configuration
└── docs/                         # Project documentation (optional)
    ├── use-cases.md
    ├── sequence-diagrams.md
    ├── state-diagrams.md
    └── design-patterns.md
```

## Prerequisites

- Node.js (v20 or later)
- npm (v9 or later)

## Local Development

1. Create a `.env` file in both `backend/` and `frontend/` directories and fill it based on the `.env.example` files. **For professor or TA, use the provided .env files attached with the project report.**

2. Install dependencies (recommended to run 2 terminal instances):

   - For backend: `cd backend && npm install`
   - For frontend: `cd frontend && npm install`

3. Run the development servers:
   - For backend: `cd backend && npm run dev`
   - For frontend: `cd frontend && npm run dev`
