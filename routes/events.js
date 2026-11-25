import { Router } from 'express';
import {
  CATEGORIES,
  REMINDER_OPTIONS,
  db,
  differenceInDays,
  eventDateTime,
  isoToday,
  isValidISODate,
  isValidTime,
  sanitizeEvent
} from '../db.js';

const router = Router();

function validateEvent(input) {
  const errors = {};
  const title = String(input.title ?? '').trim();
  const category = String(input.category ?? 'Personal');
  const eventDate = String(input.event_date ?? '');
  const eventTime = String(input.event_time ?? '09:00');
  const reminder = Number(input.reminder_minutes ?? 1440);
  if (!title || title.length > 120) errors.title = 'Enter an event name up to 120 characters.';
  if (!CATEGORIES.includes(category)) errors.category = 'Choose a valid event category.';
  if (!isValidISODate(eventDate)) errors.event_date = 'Enter a valid event date.';
  if (!isValidTime(eventTime)) errors.event_time = 'Enter a valid event time.';
  if (!REMINDER_OPTIONS.some((option) => option.value === reminder)) errors.reminder_minutes = 'Choose a supported reminder lead time.';
  return { errors, value: {
    title,
    category,
    event_date: eventDate,
    event_time: eventTime,
    description: String(input.description ?? '').trim().slice(0, 1000),
    location: String(input.location ?? '').trim().slice(0, 180),
    reminder_minutes: reminder,
    recurring: Boolean(input.recurring),
    completed: Boolean(input.completed)
  } };
}

function nextEventDate(event) {
  if (!event.recurring) return event.event_date;
  const today = isoToday();
  const [, month, day] = event.event_date.split('-');
  const thisYear = `${today.slice(0, 4)}-${month}-${day}`;
  return thisYear >= today ? thisYear : `${Number(today.slice(0, 4)) + 1}-${month}-${day}`;
}

function eventWithComputed(row) {
  const event = sanitizeEvent(row);
  const displayDate = nextEventDate(event);
  return {
    ...event,
    display_date: displayDate,
    days_remaining: differenceInDays(isoToday(), displayDate),
    iso_datetime: `${displayDate}T${event.event_time || '00:00'}:00`
  };
}

router.get('/', (req, res) => {
  const search = String(req.query.search ?? '').trim();
  const category = String(req.query.category ?? '').trim();
  const from = String(req.query.from ?? '').trim();
  const to = String(req.query.to ?? '').trim();
  const conditions = [];
  const params = {};
  if (search) { conditions.push('(title LIKE @search OR description LIKE @search OR location LIKE @search)'); params.search = `%${search}%`; }
  if (category && CATEGORIES.includes(category)) { conditions.push('category = @category'); params.category = category; }
  if (from && isValidISODate(from)) { conditions.push('event_date >= @from'); params.from = from; }
  if (to && isValidISODate(to)) { conditions.push('event_date <= @to'); params.to = to; }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM events ${where} ORDER BY event_date ASC, event_time ASC, id DESC`).all(params);
  res.json({ events: rows.map(eventWithComputed), categories: CATEGORIES, reminder_options: REMINDER_OPTIONS });
});

router.post('/', (req, res) => {
  const { errors, value } = validateEvent(req.body ?? {});
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
  const result = db.prepare(`INSERT INTO events
    (title, category, event_date, event_time, description, location, reminder_minutes, recurring, completed)
    VALUES (@title, @category, @event_date, @event_time, @description, @location, @reminder_minutes, @recurring, @completed)`).run({ ...value, recurring: value.recurring ? 1 : 0, completed: value.completed ? 1 : 0 });
  res.status(201).json({ event: eventWithComputed(db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  const { errors, value } = validateEvent({ ...existing, ...req.body });
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
  db.prepare(`UPDATE events SET title=@title, category=@category, event_date=@event_date, event_time=@event_time,
    description=@description, location=@location, reminder_minutes=@reminder_minutes, recurring=@recurring,
    completed=@completed, updated_at=CURRENT_TIMESTAMP WHERE id=@id`).run({ ...value, id, recurring: value.recurring ? 1 : 0, completed: value.completed ? 1 : 0 });
  res.json({ event: eventWithComputed(db.prepare('SELECT * FROM events WHERE id = ?').get(id)) });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ error: 'Event not found.' });
  res.status(204).end();
});

router.get('/dashboard', (_req, res) => {
  const today = isoToday();
  const monthPrefix = today.slice(0, 7);
  const total = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
  const completed = db.prepare('SELECT COUNT(*) AS count FROM events WHERE completed = 1').get().count;
  const month = db.prepare('SELECT * FROM events WHERE completed = 0').all().map(eventWithComputed).filter((event) => event.display_date.startsWith(monthPrefix)).length;
  const upcomingRows = db.prepare('SELECT * FROM events WHERE completed = 0 ORDER BY event_date ASC, event_time ASC LIMIT 25').all();
  const upcoming = upcomingRows.map(eventWithComputed).filter((event) => event.days_remaining >= 0).slice(0, 5);
  const birthdayCount = db.prepare("SELECT COUNT(*) AS count FROM events WHERE category = 'Birthday' AND completed = 0").get().count;
  const todayReminders = db.prepare(`SELECT * FROM events WHERE completed = 0 AND event_date = ? ORDER BY event_time ASC`).all(today).map(eventWithComputed);
  res.json({ metrics: { total, completed, month, birthdayCount, todayReminders: todayReminders.length }, upcoming, todayReminders });
});

router.get('/calendar', (req, res) => {
  const month = String(req.query.month ?? isoToday().slice(0, 7));
  if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'Month must use YYYY-MM format.' });
  const rows = db.prepare("SELECT * FROM events WHERE substr(event_date, 1, 7) = ? OR recurring = 1 ORDER BY event_date ASC, event_time ASC").all(month);
  res.json({ month, events: rows.map(eventWithComputed).filter((event) => event.display_date.startsWith(month)) });
});

export { eventWithComputed };
export default router;
