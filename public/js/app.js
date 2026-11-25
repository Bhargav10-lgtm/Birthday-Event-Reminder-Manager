import { renderCalendar } from './calendar.js';
import { renderCountdown } from './countdown.js';

const state = { events: [], birthdays: [], settings: null, dashboard: null, calendarMonth: new Date().toISOString().slice(0, 7), calendarSelected: new Date().toISOString().slice(0, 10), upcomingTab: '30', currentView: 'dashboard' };
let toastTimer;

const icons = {
  calendar: '<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9h18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z"/><path d="m5 11 7 4 7-4M5 15.5l7 4 7-4"/>',
  'plus-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  cake: '<path d="M4 11h16v9H4zM6 11V8a2 2 0 0 1 4 0v3M14 11V8a2 2 0 0 1 4 0v3M4 15h16"/><path d="M12 3v2M10.5 4.5h3"/>',
  'calendar-days': '<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>',
  sparkles: '<path d="m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3ZM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15ZM5 15l.5 1.5L7 17l-1.5.5L5 19l-.5-1.5L3 17l1.5-.5L5 15Z"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  lightbulb: '<path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14c-.8.7-1.3 1.5-1.5 2.5h-4c-.2-1-.7-1.5-1.5-2Z"/>',
  'more-horizontal': '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-right': '<path d="M4 12h16M13 5l7 7-7 7"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  edit: '<path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5ZM13.8 6.7l3.5 3.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  palette: '<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M12 7h.01M16 10h.01M9 15c2 .8 4 .7 5.5-.5.7-.6.2-1.7-.8-1.7h-1.2c-1.4 0-2.5-1.1-2.5-2.5V9"/>',
  archive: '<path d="M4 7h16v14H4zM3 3h18v4H3zM9 12h6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>'
};

function renderIcons() { document.querySelectorAll('[data-icon]').forEach((element) => { const name = element.dataset.icon; if (icons[name]) element.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`; }); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function byId(id) { return document.getElementById(id); }
function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(dateString, options = {}) { if (!dateString) return ''; const date = new Date(`${dateString}T12:00:00`); const defaults = state.settings?.date_format === 'DD/MM/YYYY' ? { day: '2-digit', month: '2-digit', year: 'numeric' } : state.settings?.date_format === 'MM/DD/YYYY' ? { month: '2-digit', day: '2-digit', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }; return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(date); }
function shortDate(dateString) { return formatDate(dateString, { month: 'short', day: 'numeric' }).replace(',', ''); }
function monthName(dateString) { return new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(new Date(`${dateString}T12:00:00Z`)); }
function relativeDate(days) { if (days === 0) return 'Today'; if (days === 1) return 'Tomorrow'; if (days < 0) return `${Math.abs(days)}d ago`; return `In ${days} days`; }
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'; }
function showToast(message, isError = false) { const toast = byId('toast'); byId('toastMessage').textContent = message; toast.classList.toggle('error', isError); toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200); }
function emptyState(title, message, action = 'open-event', icon = 'sparkles') { return `<div class="empty-state"><div class="empty-icon" data-icon="${icon}"></div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p><button class="primary-button" data-action="${action}">${action === 'open-birthday' ? 'Add a birthday' : 'Add an event'}</button></div>`; }

async function api(path, options = {}) { const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }); const content = response.status === 204 ? null : await response.json().catch(() => ({})); if (!response.ok) { const error = new Error(content?.error || 'Something went wrong.'); error.fields = content?.fields || {}; throw error; } return content; }

function applyTheme(theme) { document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark'; document.querySelectorAll('[data-theme]').forEach((button) => button.classList.toggle('active', button.dataset.theme === (theme || 'dark'))); }
function setTopbarDate() { byId('topbarDate').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date()); }

function renderStats(metrics) {
  const cards = [
    ['Saved events', metrics.total, 'Across your workspace', 'layers', 'violet'],
    ['Birthdays', metrics.birthdayCount, 'Yearly moments to celebrate', 'cake', 'coral'],
    ['This month', metrics.month, 'Dates on the calendar', 'calendar-days', 'teal'],
    ['Completed', metrics.completed, 'Past moments checked off', 'check', 'amber']
  ];
  byId('statsGrid').innerHTML = cards.map(([label, value, note, icon, color]) => `<article class="stat-card" style="--stat-color:var(--${color});--stat-soft:var(--${color}-soft)"><div class="stat-top"><span>${label}</span><span class="stat-icon" data-icon="${icon}"></span></div><div class="stat-number">${value}</div><div class="stat-note">${note}</div></article>`).join(''); renderIcons(); byId('eventNavCount').textContent = metrics.total;
}

function renderCompactReminder(event) { return `<div class="reminder-item"><div class="reminder-clock" data-icon="clock"></div><div class="item-main"><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.location || event.category)}</span></div><span class="reminder-time">${escapeHtml(event.event_time)}</span></div>`; }
function renderNextItem(event) { return `<div class="next-item"><span class="event-mark ${escapeHtml(event.category)}"></span><div class="item-main"><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.category)}${event.location ? ` · ${escapeHtml(event.location)}` : ''}</span></div><span class="item-date">${relativeDate(event.days_remaining)}</span></div>`; }

async function loadDashboard() { const data = await api('/events/dashboard'); state.dashboard = data; renderStats(data.metrics); const upcoming = data.upcoming.filter((event) => !event.completed); renderCountdown(byId('countdownMount'), upcoming[0], formatDate); byId('dashboardUpcoming').innerHTML = upcoming.length ? upcoming.slice(0, 4).map(renderNextItem).join('') : '<div class="mini-empty"><span data-icon="sparkles"></span><span>Your timeline is clear. Add an event to see what is coming next.</span></div>'; byId('dashboardReminders').innerHTML = data.todayReminders.length ? data.todayReminders.map(renderCompactReminder).join('') : emptyState('No reminders today.', 'You have a little breathing room.'); byId('activityTitle').textContent = data.metrics.total ? `${data.metrics.total} moments are in your orbit.` : 'Your workspace is ready.'; byId('activitySubtitle').textContent = data.metrics.total ? `${data.metrics.month} dates land this month. Keep the good things close.` : 'Add your first event to start building your timeline.'; renderIcons(); }

function eventRow(event) { const date = new Date(`${event.display_date}T12:00:00`); return `<article class="event-row"><div class="row-date"><strong>${date.getDate()}</strong><span>${monthName(event.display_date)}</span></div><span class="event-mark ${escapeHtml(event.category)}"></span><div class="row-info"><strong>${escapeHtml(event.title)}${event.recurring ? ' <span class="recurring-mark">↻</span>' : ''}</strong><p>${escapeHtml(event.description || event.location || `${event.category} · ${event.event_time}`)}</p></div><span class="category-chip">${escapeHtml(event.category)}</span><span class="item-date">${relativeDate(event.days_remaining)}</span><div class="row-actions"><button class="small-icon-button" data-edit-event="${event.id}" aria-label="Edit ${escapeHtml(event.title)}"><span data-icon="edit"></span></button><button class="small-icon-button danger" data-delete-event="${event.id}" aria-label="Delete ${escapeHtml(event.title)}"><span data-icon="trash"></span></button></div></article>`; }

async function loadEvents() { const params = new URLSearchParams(); const search = byId('eventSearch')?.value.trim(); const category = byId('eventCategoryFilter')?.value; const range = byId('eventRangeFilter')?.value; if (search) params.set('search', search); if (category) params.set('category', category); if (range === 'next7') { params.set('from', today()); params.set('to', dateAfter(7)); } if (range === 'next30') { params.set('from', today()); params.set('to', dateAfter(30)); } if (range === 'past') params.set('to', dateBefore(1)); const data = await api(`/events?${params.toString()}`); state.events = data.events; const filter = byId('eventCategoryFilter'); if (filter && filter.options.length === 1) { data.categories.forEach((category) => filter.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`)); } byId('eventsList').innerHTML = state.events.length ? state.events.map(eventRow).join('') : emptyState('Nothing on the timeline yet.', 'Add a date, then use search and filters as your list grows.'); byId('eventListSummary').textContent = `${state.events.length} event${state.events.length === 1 ? '' : 's'}`; renderIcons(); }
function dateAfter(days) { const date = new Date(`${today()}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
function dateBefore(days) { const date = new Date(`${today()}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10); }

function birthdayCard(birthday) { return `<article class="birthday-card"><div class="birthday-top"><div class="birthday-avatar">${escapeHtml(initials(birthday.name))}</div><div class="row-actions"><button class="small-icon-button" data-edit-birthday="${birthday.id}" aria-label="Edit ${escapeHtml(birthday.name)}"><span data-icon="edit"></span></button><button class="small-icon-button danger" data-delete-birthday="${birthday.id}" aria-label="Delete ${escapeHtml(birthday.name)}"><span data-icon="trash"></span></button></div></div><h3>${escapeHtml(birthday.name)}</h3><p>${formatDate(birthday.birth_date, { month: 'long', day: 'numeric', year: 'numeric' })} · Turns ${birthday.age}</p><div class="birthday-meta"><div><strong>${birthday.daysRemaining === 0 ? 'Today' : `${birthday.daysRemaining}d`}</strong><span>until next birthday</span></div><span class="birthday-note">${escapeHtml(birthday.notes || 'Yearly recurring')}</span></div></article>`; }
async function loadBirthdays() { const data = await api('/birthdays'); state.birthdays = data.birthdays; byId('birthdaysList').innerHTML = state.birthdays.length ? state.birthdays.map(birthdayCard).join('') : emptyState('Your people are not here yet.', 'Add a birthday once and Evently will carry it forward every year.', 'open-birthday', 'cake'); renderIcons(); }

async function loadCalendar() { const data = await api(`/events/calendar?month=${state.calendarMonth}`); renderCalendar({ mount: byId('calendarGrid'), titleMount: byId('calendarTitle'), detailsMount: byId('calendarDetails'), month: state.calendarMonth, events: data.events, selectedDate: state.calendarSelected, onSelect: (date) => { state.calendarSelected = date; loadCalendar(); }, formatDate }); }

function upcomingList() { const tab = state.upcomingTab; let list = state.events.filter((event) => !event.completed && event.days_remaining >= 0); if (tab === '7') list = list.filter((event) => event.days_remaining <= 7); if (tab === '30') list = list.filter((event) => event.days_remaining <= 30); if (tab === 'birthdays') list = list.filter((event) => event.category === 'Birthday'); return list.sort((a, b) => a.days_remaining - b.days_remaining || a.event_time.localeCompare(b.event_time)); }
function renderUpcoming() { const list = upcomingList(); byId('upcomingSummary').textContent = state.upcomingTab === 'birthdays' ? 'Upcoming birthdays' : `Next ${state.upcomingTab} days`; byId('upcomingList').innerHTML = list.length ? list.map(eventRow).join('') : emptyState('The horizon is clear.', 'Nothing is scheduled for this view yet.'); renderIcons(); }

async function loadReminders() { const data = await api(`/reminders?date=${today()}`); const due = data.reminders; byId('reminderSummary').textContent = `${due.length} reminder${due.length === 1 ? '' : 's'} today`; byId('remindersList').innerHTML = due.length ? due.map((item) => `<article class="event-row"><div class="reminder-clock" data-icon="bell"></div><div class="row-info"><strong>${escapeHtml(item.title)}</strong><p>${formatDate(item.display_date)} at ${escapeHtml(item.event_time)} · ${escapeHtml(item.reminder_label)}</p></div><span class="category-chip">${item.acknowledged ? 'Acknowledged' : 'Ready'}</span><button class="small-icon-button" data-ack-reminder="${escapeHtml(item.notification_key)}" data-event-key="${item.id}" aria-label="Acknowledge reminder"><span data-icon="check"></span></button></article>`).join('') : emptyState('No reminders today.', 'Set a reminder when you add an event and we will surface it here.'); const active = due.some((item) => !item.acknowledged); byId('reminderNavDot').classList.toggle('visible', active); byId('notificationBadge').classList.toggle('visible', active); const permission = 'Notification' in window ? Notification.permission : 'unsupported'; byId('reminderPermission').textContent = permission === 'granted' ? 'Browser alerts enabled' : permission === 'denied' ? 'Browser alerts blocked' : 'In-app alerts active'; renderIcons(); }

function setModal(id, open) { const modal = byId(id); modal.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; if (open) modal.querySelector('input, textarea, select')?.focus(); }
function fillEventOptions() { const categories = ['Birthday', 'Anniversary', 'Festival', 'Meeting', 'Exam', 'Personal', 'Other']; byId('eventCategory').innerHTML = categories.map((category) => `<option>${category}</option>`).join(''); byId('eventReminder').innerHTML = [{ value: 10, label: '10 minutes before' }, { value: 30, label: '30 minutes before' }, { value: 60, label: '1 hour before' }, { value: 1440, label: '1 day before' }, { value: 10080, label: '1 week before' }, { value: 0, label: 'At event time' }].map((option) => `<option value="${option.value}">${option.label}</option>`).join(''); }
function openEvent(eventId = null) { const event = eventId ? state.events.find((item) => item.id === Number(eventId)) : null; byId('eventModalTitle').textContent = event ? 'Edit an event' : 'Add an event'; byId('eventModalEyebrow').textContent = event ? 'EDIT MOMENT' : 'NEW MOMENT'; byId('eventId').value = event?.id || ''; byId('eventTitle').value = event?.title || ''; byId('eventCategory').value = event?.category || 'Personal'; byId('eventReminder').value = event?.reminder_minutes ?? 1440; byId('eventDate').value = event?.event_date || today(); byId('eventTime').value = event?.event_time || '09:00'; byId('eventLocation').value = event?.location || ''; byId('eventDescription').value = event?.description || ''; byId('eventRecurring').checked = Boolean(event?.recurring); setModal('eventModal', true); }
function openBirthday(birthdayId = null) { const birthday = birthdayId ? state.birthdays.find((item) => item.id === Number(birthdayId)) : null; byId('birthdayModalTitle').textContent = birthday ? 'Edit a birthday' : 'Add a birthday'; byId('birthdayId').value = birthday?.id || ''; byId('birthdayName').value = birthday?.name || ''; byId('birthdayDate').value = birthday?.birth_date || ''; byId('birthdayNotes').value = birthday?.notes || ''; setModal('birthdayModal', true); }

async function submitEvent(event) { event.preventDefault(); const payload = { title: byId('eventTitle').value, category: byId('eventCategory').value, reminder_minutes: Number(byId('eventReminder').value), event_date: byId('eventDate').value, event_time: byId('eventTime').value, location: byId('eventLocation').value, description: byId('eventDescription').value, recurring: byId('eventRecurring').checked }; const id = byId('eventId').value; try { await api(id ? `/events/${id}` : '/events', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); setModal('eventModal', false); showToast(id ? 'Event updated.' : 'Event added to your timeline.'); await refreshData(); navigate('events'); } catch (error) { showToast(error.message, true); Object.entries(error.fields || {}).forEach(([field, message]) => { const element = document.querySelector(`[data-error-for="${field.replace('event_', '')}"]`); if (element) element.textContent = message; }); } }
async function submitBirthday(event) { event.preventDefault(); const payload = { name: byId('birthdayName').value, birth_date: byId('birthdayDate').value, notes: byId('birthdayNotes').value }; const id = byId('birthdayId').value; try { await api(id ? `/birthdays/${id}` : '/birthdays', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); setModal('birthdayModal', false); showToast(id ? 'Birthday updated.' : 'Birthday added.'); await refreshData(); navigate('birthdays'); } catch (error) { showToast(error.message, true); } }

async function deleteEvent(id) { const event = state.events.find((item) => item.id === Number(id)); if (!event || !window.confirm(`Delete “${event.title}”? This cannot be undone.`)) return; try { await api(`/events/${id}`, { method: 'DELETE' }); showToast('Event deleted.'); await refreshData(); } catch (error) { showToast(error.message, true); } }
async function deleteBirthday(id) { const birthday = state.birthdays.find((item) => item.id === Number(id)); if (!birthday || !window.confirm(`Remove ${birthday.name} from birthdays?`)) return; try { await api(`/birthdays/${id}`, { method: 'DELETE' }); showToast('Birthday removed.'); await refreshData(); } catch (error) { showToast(error.message, true); } }

async function saveSettings(partial) { try { const data = await api('/settings', { method: 'PUT', body: JSON.stringify({ ...state.settings, ...partial }) }); state.settings = data.settings; applyTheme(state.settings.theme); showToast('Settings saved.'); } catch (error) { showToast(error.message, true); } }
async function requestNotifications() { if (!('Notification' in window)) { showToast('This browser does not support notifications.', true); return; } const permission = await Notification.requestPermission(); showToast(permission === 'granted' ? 'Browser alerts are enabled.' : 'Browser alerts were not enabled.'); await loadReminders(); }
async function acknowledgeReminder(eventKey, reminderKey) { await api('/reminders/acknowledge', { method: 'POST', body: JSON.stringify({ event_key: eventKey, reminder_key: reminderKey }) }); showToast('Reminder acknowledged.'); await loadReminders(); }
async function clearOld() { if (!window.confirm('Clear completed events and dates before today?')) return; try { const result = await api('/reminders/old', { method: 'DELETE' }); showToast(`${result.deleted_events} old event${result.deleted_events === 1 ? '' : 's'} cleared.`); await refreshData(); } catch (error) { showToast(error.message, true); } }

function navigate(view) { state.currentView = view; window.location.hash = view === 'dashboard' ? '' : view; document.querySelectorAll('.view').forEach((element) => element.classList.toggle('active', element.id === `view-${view}`)); document.querySelectorAll('.nav-item[data-view]').forEach((element) => element.classList.toggle('active', element.dataset.view === view)); byId('sidebar').classList.remove('open'); if (view === 'calendar') loadCalendar(); if (view === 'upcoming') { if (!state.events.length) loadEvents().then(renderUpcoming); else renderUpcoming(); } if (view === 'reminders') loadReminders(); }

async function refreshData() { await Promise.all([loadDashboard(), loadEvents(), loadBirthdays()]); if (state.currentView === 'upcoming') renderUpcoming(); if (state.currentView === 'calendar') loadCalendar(); if (state.currentView === 'reminders') loadReminders(); }

function wireEvents() {
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-view], [data-action], [data-close-modal], [data-edit-event], [data-delete-event], [data-edit-birthday], [data-delete-birthday], [data-ack-reminder], [data-theme], [data-upcoming-tab]'); if (!target) return;
    if (target.dataset.view) navigate(target.dataset.view);
    if (target.dataset.action === 'open-event') openEvent();
    if (target.dataset.action === 'open-birthday') openBirthday();
    if (target.dataset.closeModal) setModal(target.dataset.closeModal, false);
    if (target.dataset.editEvent) openEvent(target.dataset.editEvent);
    if (target.dataset.deleteEvent) await deleteEvent(target.dataset.deleteEvent);
    if (target.dataset.editBirthday) openBirthday(target.dataset.editBirthday);
    if (target.dataset.deleteBirthday) await deleteBirthday(target.dataset.deleteBirthday);
    if (target.dataset.ackReminder) await acknowledgeReminder(target.dataset.eventKey, target.dataset.ackReminder);
    if (target.dataset.theme) await saveSettings({ theme: target.dataset.theme });
    if (target.dataset.upcomingTab) { state.upcomingTab = target.dataset.upcomingTab; document.querySelectorAll('[data-upcoming-tab]').forEach((button) => button.classList.toggle('active', button.dataset.upcomingTab === state.upcomingTab)); renderUpcoming(); }
  });
  byId('eventForm').addEventListener('submit', submitEvent); byId('birthdayForm').addEventListener('submit', submitBirthday);
  byId('eventSearch').addEventListener('input', debounce(loadEvents, 250)); byId('eventCategoryFilter').addEventListener('change', loadEvents); byId('eventRangeFilter').addEventListener('change', loadEvents);
  byId('globalSearch').addEventListener('input', (event) => { if (event.target.value.trim()) { navigate('events'); byId('eventSearch').value = event.target.value; loadEvents(); } });
  byId('mobileMenu').addEventListener('click', () => byId('sidebar').classList.toggle('open')); byId('notificationTrigger').addEventListener('click', () => navigate('reminders')); byId('requestNotifications').addEventListener('click', requestNotifications); byId('clearOldButton').addEventListener('click', clearOld);
  byId('prevMonth').addEventListener('click', () => changeMonth(-1)); byId('nextMonth').addEventListener('click', () => changeMonth(1)); byId('todayMonth').addEventListener('click', () => { state.calendarMonth = today().slice(0, 7); state.calendarSelected = today(); loadCalendar(); });
  byId('inAppSetting').addEventListener('change', (event) => saveSettings({ in_app_notifications: event.target.checked })); byId('browserSetting').addEventListener('change', (event) => saveSettings({ browser_notifications: event.target.checked })); byId('dateFormatSetting').addEventListener('change', (event) => saveSettings({ date_format: event.target.value }));
  document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); byId('globalSearch').focus(); } if (event.key === 'Escape') { setModal('eventModal', false); setModal('birthdayModal', false); } });
}
function changeMonth(amount) { const [year, month] = state.calendarMonth.split('-').map(Number); const date = new Date(Date.UTC(year, month - 1 + amount, 1)); state.calendarMonth = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; state.calendarSelected = `${state.calendarMonth}-01`; loadCalendar(); }
function debounce(callback, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => callback(...args), wait); }; }

async function init() { renderIcons(); fillEventOptions(); setTopbarDate(); wireEvents(); const view = window.location.hash.replace('#', '') || 'dashboard'; try { const settingsData = await api('/settings'); state.settings = settingsData.settings; applyTheme(state.settings.theme); byId('dateFormatSetting').value = state.settings.date_format; byId('inAppSetting').checked = state.settings.in_app_notifications; byId('browserSetting').checked = state.settings.browser_notifications; await refreshData(); navigate(['dashboard', 'events', 'birthdays', 'calendar', 'upcoming', 'reminders', 'settings'].includes(view) ? view : 'dashboard'); } catch (error) { showToast(error.message, true); } setInterval(() => loadReminders().catch(() => {}), 60000); }

init();
