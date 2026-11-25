import { Router } from 'express';
import { db, settingsRow } from '../db.js';

const router = Router();

router.get('/', (_req, res) => res.json({ settings: settingsRow() }));

router.put('/', (req, res) => {
  const current = settingsRow();
  const theme = String(req.body?.theme ?? current.theme);
  const dateFormat = String(req.body?.date_format ?? current.date_format);
  const browserNotifications = req.body?.browser_notifications ?? current.browser_notifications;
  const inAppNotifications = req.body?.in_app_notifications ?? current.in_app_notifications;
  if (!['dark', 'light'].includes(theme)) return res.status(400).json({ error: 'Theme must be dark or light.' });
  if (!['MMM D, YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'].includes(dateFormat)) return res.status(400).json({ error: 'Choose a supported date format.' });
  db.prepare(`UPDATE settings SET theme=@theme, date_format=@date_format,
    browser_notifications=@browser_notifications, in_app_notifications=@in_app_notifications WHERE id=1`).run({
    theme,
    date_format: dateFormat,
    browser_notifications: browserNotifications ? 1 : 0,
    in_app_notifications: inAppNotifications ? 1 : 0
  });
  res.json({ settings: settingsRow() });
});

export default router;
