# CampusLoop

CampusLoop is a responsive college event hub with separate student and admin experiences.

## Included

- Student and admin login modes
- Event discovery, search, categories, and calendar
- Event details with organizer, capacity, fee, and requirements
- Ticket issuing, pass IDs, reminders, copying, and cancellation
- Admin event creation and deletion
- Student directory management
- Attendance check-in desk
- Participant dashboard with turnout metrics
- Built-in help assistant

## Run locally

Open `index.html` directly, or serve the folder with any static server:

```powershell
npx serve .
```

The app uses browser local storage for demo data and does not require a backend.

## Demo accounts

- Student: `student@college.edu` / `campus123`
- Admin: `admin@college.edu` / `admin123`

## Deploy

This is a static Vercel-ready project. Connect the repository to Vercel with no build command and `.` as the output directory.
