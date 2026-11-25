import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'events.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Personal',
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL DEFAULT '09:00',
    description TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    reminder_minutes INTEGER NOT NULL DEFAULT 1440,
    recurring INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reminder_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_key TEXT NOT NULL,
    reminder_key TEXT NOT NULL,
    acknowledged_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_key, reminder_key)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    theme TEXT NOT NULL DEFAULT 'dark',
    date_format TEXT NOT NULL DEFAULT 'MMM D, YYYY',
    browser_notifications INTEGER NOT NULL DEFAULT 1,
    in_app_notifications INTEGER NOT NULL DEFAULT 1
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

export const CATEGORIES = ['Birthday', 'Anniversary', 'Festival', 'Meeting', 'Exam', 'Personal', 'Other'];
export const REMINDER_OPTIONS = [
  { value: 10, label: '10 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' },
  { value: 0, label: 'At event time' }
];

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function differenceInDays(from, to) {
  const start = new Date(`${from}T00:00:00Z`).valueOf();
  const end = new Date(`${to}T00:00:00Z`).valueOf();
  return Math.round((end - start) / 86400000);
}

function birthdayForYear(birthDate, year) {
  const [, month, day] = birthDate.split('-').map(Number);
  const isLeapDay = month === 2 && day === 29;
  const adjustedDay = isLeapDay && !((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 28 : day;
  return `${year}-${String(month).padStart(2, '0')}-${String(adjustedDay).padStart(2, '0')}`;
}

export function birthdayOccurrence(birthDate, today = isoToday()) {
  const year = Number(today.slice(0, 4));
  const thisYear = birthdayForYear(birthDate, year);
  const nextDate = thisYear >= today ? thisYear : birthdayForYear(birthDate, year + 1);
  const birthYear = Number(birthDate.slice(0, 4));
  const age = Number(nextDate.slice(0, 4)) - birthYear;
  return { nextDate, age, daysRemaining: differenceInDays(today, nextDate) };
}

export function eventDateTime(event) {
  return new Date(`${event.event_date}T${event.event_time || '00:00'}:00`);
}

export function sanitizeEvent(row) {
  if (!row) return null;
  return {
    ...row,
    recurring: Boolean(row.recurring),
    completed: Boolean(row.completed),
    reminder_minutes: Number(row.reminder_minutes)
  };
}

export function sanitizeBirthday(row) {
  if (!row) return null;
  const occurrence = birthdayOccurrence(row.birth_date);
  return { ...row, ...occurrence };
}

export function settingsRow() {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  return {
    ...row,
    browser_notifications: Boolean(row.browser_notifications),
    in_app_notifications: Boolean(row.in_app_notifications)
  };
}
