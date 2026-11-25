import { Router } from 'express';
import { db, eventDateTime, isoToday } from '../db.js';
import { eventWithComputed } from './events.js';

const router = Router();

function reminderFromEvent(event) {
  const eventMoment = eventDateTime(event);
  const reminderMoment = new Date(eventMoment.getTime() - event.reminder_minutes * 60000);
  return {
    ...eventWithComputed(event),
    reminder_at: reminderMoment.toISOString(),
    reminder_label: event.reminder_minutes === 0 ? 'At event time' : `${event.reminder_minutes >= 1440 ? `${event.reminder_minutes / 1440} day` : event.reminder_minutes >= 60 ? `${event.reminder_minutes / 60} hour` : `${event.reminder_minutes} min`} before`,
    notification_key: `${event.id}:${event.event_date}:${event.reminder_minutes}`
  };
}

router.get('/', (req, res) => {
  const date = String(req.query.date ?? isoToday());
  const rows = db.prepare('SELECT * FROM events WHERE completed = 0 AND event_date >= ? ORDER BY event_date ASC, event_time ASC').all(date);
  const now = Date.now();
  const reminders = rows.map(reminderFromEvent).filter((item) => {
    const eventTime = new Date(item.iso_datetime).getTime();
    const reminderTime = new Date(item.reminder_at).getTime();
    return item.event_date === date || (reminderTime <= now && eventTime >= now);
  });
  const logged = db.prepare('SELECT event_key, reminder_key FROM reminder_log').all();
  const loggedKeys = new Set(logged.map((row) => `${row.event_key}:${row.reminder_key}`));
  res.json({ reminders: reminders.map((item) => ({ ...item, acknowledged: loggedKeys.has(`${item.id}:${item.notification_key}`) })) });
});

router.post('/acknowledge', (req, res) => {
  const eventKey = String(req.body?.event_key ?? '').trim();
  const reminderKey = String(req.body?.reminder_key ?? '').trim();
  if (!eventKey || !reminderKey) return res.status(400).json({ error: 'Event and reminder keys are required.' });
  db.prepare('INSERT OR IGNORE INTO reminder_log (event_key, reminder_key) VALUES (?, ?)').run(eventKey, reminderKey);
  res.status(201).json({ acknowledged: true });
});

router.delete('/old', (_req, res) => {
  const today = isoToday();
  const eventResult = db.prepare('DELETE FROM events WHERE completed = 1 OR event_date < ?').run(today);
  const reminderResult = db.prepare('DELETE FROM reminder_log WHERE acknowledged_at < datetime(\'now\', \'-30 days\')').run();
  res.json({ deleted_events: eventResult.changes, deleted_reminders: reminderResult.changes });
});

export default router;
