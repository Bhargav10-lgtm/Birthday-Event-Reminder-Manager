import { Router } from 'express';
import { db, differenceInDays, birthdayOccurrence, isValidISODate, sanitizeBirthday } from '../db.js';

const router = Router();

function validateBirthday(input) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const birthDate = String(input.birth_date ?? '');
  if (!name || name.length > 100) errors.name = 'Enter a name up to 100 characters.';
  if (!isValidISODate(birthDate)) errors.birth_date = 'Enter a valid birth date.';
  if (birthDate > new Date().toISOString().slice(0, 10)) errors.birth_date = 'Birth date cannot be in the future.';
  return { errors, value: { name, birth_date: birthDate, notes: String(input.notes ?? '').trim().slice(0, 500) } };
}

function birthdayWithNext(row) {
  const birthday = sanitizeBirthday(row);
  return { ...birthday, iso_datetime: `${birthday.nextDate}T09:00:00` };
}

router.get('/', (_req, res) => {
  const birthdays = db.prepare('SELECT * FROM birthdays ORDER BY birth_date ASC, name ASC').all().map(birthdayWithNext).sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  res.json({ birthdays });
});

router.post('/', (req, res) => {
  const { errors, value } = validateBirthday(req.body ?? {});
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
  const result = db.prepare('INSERT INTO birthdays (name, birth_date, notes) VALUES (@name, @birth_date, @notes)').run(value);
  res.status(201).json({ birthday: birthdayWithNext(db.prepare('SELECT * FROM birthdays WHERE id = ?').get(result.lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM birthdays WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Birthday not found.' });
  const { errors, value } = validateBirthday({ ...existing, ...req.body });
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
  db.prepare('UPDATE birthdays SET name=@name, birth_date=@birth_date, notes=@notes, updated_at=CURRENT_TIMESTAMP WHERE id=@id').run({ ...value, id });
  res.json({ birthday: birthdayWithNext(db.prepare('SELECT * FROM birthdays WHERE id = ?').get(id)) });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM birthdays WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Birthday not found.' });
  res.status(204).end();
});

export default router;
