function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

export function renderCalendar({ mount, titleMount, detailsMount, month, events, selectedDate, onSelect, formatDate }) {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const previousDays = new Date(Date.UTC(year, monthNumber - 1, 0)).getUTCDate();
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;
  const today = new Date().toISOString().slice(0, 10);
  const eventMap = new Map();
  events.forEach((event) => {
    const date = event.display_date || event.event_date;
    if (!eventMap.has(date)) eventMap.set(date, []);
    eventMap.get(date).push(event);
  });
  titleMount.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
  mount.innerHTML = '';
  for (let cell = 0; cell < totalCells; cell += 1) {
    const position = cell - leading + 1;
    let day = position;
    let cellMonth = monthNumber;
    let cellYear = year;
    if (position < 1) { cellMonth -= 1; day = previousDays + position; if (cellMonth === 0) { cellMonth = 12; cellYear -= 1; } }
    if (position > daysInMonth) { cellMonth += 1; day = position - daysInMonth; if (cellMonth === 13) { cellMonth = 1; cellYear += 1; } }
    const date = `${cellYear}-${String(cellMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventMap.get(date) || [];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `calendar-day${cellMonth !== monthNumber ? ' muted' : ''}${date === today ? ' today' : ''}${date === selectedDate ? ' selected' : ''}${dayEvents.length ? ' has-events' : ''}`;
    button.dataset.date = date;
    button.innerHTML = `<span class="day-number">${day}</span><span class="day-events">${dayEvents.slice(0, 3).map((event) => `<span class="day-event ${escapeHtml(event.category)}">${escapeHtml(event.title)}</span>`).join('')}</span>`;
    button.addEventListener('click', () => onSelect(date));
    mount.appendChild(button);
  }
  const chosen = selectedDate || today;
  const selectedEvents = eventMap.get(chosen) || [];
  detailsMount.innerHTML = `<h3>${formatDate(chosen, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>${selectedEvents.length ? `<div class="detail-events">${selectedEvents.map((event) => `<span class="category-chip">${escapeHtml(event.title)} · ${escapeHtml(event.event_time)}</span>`).join('')}</div>` : '<span class="muted-copy">Nothing scheduled for this date.</span>'}`;
}
