# Event & Reminder Manager — Implementation Plan

## Product approach

Build a real, single-user full-stack web application with a vanilla HTML/CSS/JavaScript frontend served by Express and a SQLite database owned by the Node process. The backend exposes validated REST endpoints for events, birthdays, calendar data, reminders, dashboard aggregates, and settings. The browser keeps no primary event data: all creates, edits, deletes, filters, and calendar reads go through the API.

The app will use a small set of cohesive frontend modules rather than a framework: `app.js` owns navigation and API state, `calendar.js` owns monthly rendering, and `countdown.js` owns live countdown cards. Express serves `public/` and handles `/api/*`; SQLite tables cover events, birthdays, reminder logs, and settings. Recurring birthdays are materialized as the next occurrence at read time, preserving the original birth date.

## Design direction

Three possible directions considered:

- **Soft editorial planner** — 0.06 probability. Warm paper tones, serif display type, and diary-like cards.
- **Midnight command center** — 0.07 probability. Deep navy canvas, electric violet/teal accents, high information density, and luminous status chips.
- **Quiet glass calendar** — 0.04 probability. Pale neutrals, frosted surfaces, and restrained monochrome controls.

### Chosen style: Midnight command center

- **Design Movement:** A polished SaaS operations dashboard with a subtle observability/control-room influence.
- **Core Principles:** Clear hierarchy, calm density, actionable status, and no decorative surface without a job.
- **Color Philosophy:** Ink navy creates focus; cool slate layers separate surfaces; violet marks primary action; mint/amber/coral communicate event state without shouting.
- **Layout Paradigm:** Persistent navigation rail plus asymmetric overview canvas: a wide “next up” column balances a compact metrics rail, while list views use roomy stacked rows instead of a dense grid.
- **Signature Elements:** Violet-to-blue gradient eyebrow labels, left-edge event category rails, and a live countdown block with segmented numerals.
- **Interaction Philosophy:** Every action has an immediate visible state change, with compact inline feedback instead of disruptive alerts wherever possible.
- **Animation:** 180–240ms ease-out transitions for panels, button press feedback, shimmer-free skeleton-free loading, and a gentle pulse only for live countdown/notification indicators.
- **Typography System:** Inter/system sans for UI and data; a slightly heavier display weight for page titles. Use high-contrast size jumps (12px labels, 14–15px body, 28–40px titles).
- **Brand Essence:** A calm command center for the dates that keep life moving. Personality: precise, warm, dependable.
- **Brand Voice:** Headlines are direct and human; CTAs are specific. Example lines: “Keep the important dates in view.” and “Add the next thing worth remembering.”
- **Wordmark & Logo:** A compact calendar tile with a single violet spark/dot, paired with the name in a rounded wordmark treatment.
- **Signature Brand Color:** `#8b7cff` — Event Violet.

## Main modules

- `server.js`: Express bootstrap, static serving, error handling, and API route registration.
- `db.js`: SQLite connection, schema creation, seed-free persistence helpers, date/recurrence utilities.
- `routes/events.js`: event CRUD, search/filter, dashboard summaries, calendar payload.
- `routes/birthdays.js`: birthday CRUD plus next-occurrence and age calculations.
- `routes/reminders.js`: due reminders, in-app reminder list, acknowledge/clear operations.
- `routes/settings.js`: theme, date format, notification preferences.
- `public/index.html`: semantic app shell, modal forms, and view containers.
- `public/css/style.css`: responsive midnight command-center visual system.
- `public/js/app.js`: API client, state, routing, dashboard/events/birthdays/reminders/settings interactions.
- `public/js/calendar.js`: month grid and selected-date event details.
- `public/js/countdown.js`: one-second countdown refresh for the nearest upcoming event.
- `public/manus-routes.json`: complete browser route declaration for the single-page app.

## Data model

- `events`: title, category, date, time, description, location, reminder lead time, recurrence, completed state, timestamps.
- `birthdays`: person name, original birth date, notes, timestamps. Every API read computes the next annual occurrence and age.
- `reminder_log`: unique event/occurrence/lead-time keys for duplicate-safe notification acknowledgement.
- `settings`: one row for theme, date format, browser/in-app notification preferences.

## Delivery constraints

No login is required for this single-user submission. The backend validates required fields and enum values, uses parameterized SQLite statements, and returns structured JSON errors. Browser notifications are requested only from a user gesture; in-app notifications remain available regardless of browser permission. The project will run on the configured port through the platform-managed runtime command, and the final checkpoint will include only source, lockfile, documentation, and configuration files (never `node_modules`, `.env`, or the SQLite runtime file).
