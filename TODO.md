# Event & Reminder Manager — Outcome Checklist

## Full-stack foundation
- [ ] The application is a real full-stack project with a responsive HTML5/CSS3/JavaScript frontend, Node.js backend, Express.js server, and persistent SQLite database; it is not only a static design.
- [ ] The project has a professional GitHub-ready structure, README with technologies, installation/run instructions, API documentation, screenshots section, and `.gitignore`; secrets, passwords, `node_modules`, and runtime database files are excluded.
- [ ] REST APIs validate user inputs on the frontend and backend, use secure parameterized database operations, and return useful error responses.

## Dashboard and event management
- [ ] The dashboard displays total saved events, upcoming birthdays, upcoming events, today’s reminders, completed events, and events happening this month.
- [ ] Users can create events with name, category (Birthday, Anniversary, Festival, Meeting, Exam, Personal, Other), date, time, description, reminder lead time, optional location, and recurring setting, with Save and Cancel controls.
- [ ] Users can edit existing events and delete events with confirmation; search by name and filter by category/date work against persisted API data.
- [ ] Event lists show meaningful empty states, status, location, reminder information, and completed state; no fake hardcoded event data is used as the main functionality.

## Birthdays
- [ ] Users can add, edit, and delete friends’ and family members’ birthdays with names and birth dates.
- [ ] Birthday reads calculate the next annual occurrence, age, days remaining, and recurring yearly presentation from persisted birth dates.

## Calendar and upcoming views
- [ ] A monthly calendar displays saved events, highlights today, marks event dates, supports previous/next month navigation, and lets users select a date to view its events.
- [ ] Upcoming views include next 7 days, next 30 days, birthdays, and special occasions sorted by nearest date.

## Countdown and reminders
- [ ] The nearest upcoming event has a live countdown displaying days, hours, minutes, and seconds and updates automatically every second.
- [ ] Reminder lead times include 10 minutes, 30 minutes, 1 hour, 1 day, and 1 week; today’s reminders appear in-app.
- [ ] The reminder system avoids duplicate notifications through persisted acknowledgement keys and client-side notification guards, supports recurring birthday occurrences, and uses browser notifications when permission is granted.

## Settings and responsive UX
- [ ] Settings allow Light/Dark theme, notification preferences, date format, and clearing completed/old reminders.
- [ ] Navigation includes dashboard, add event, birthdays, calendar, upcoming events, reminders, and settings views with a responsive sidebar/mobile navigation.
- [ ] The interface uses a modern SaaS dashboard layout, rounded cards/buttons, readable typography, inline icons, smooth transitions, and responsive mobile/tablet/desktop behavior.

## Verification
- [ ] Major flows are checked: add/edit/delete event, add birthday, recurring birthday calculation, countdown, calendar navigation/date selection, reminders/notifications, search/filter, persistence, and mobile layout.
