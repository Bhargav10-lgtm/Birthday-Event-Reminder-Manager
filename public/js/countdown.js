let countdownTimer;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function parts(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  };
}

export function renderCountdown(mount, event, formatDate) {
  clearInterval(countdownTimer);
  if (!event) {
    mount.innerHTML = `<div class="empty-state"><div class="empty-icon">✦</div><h3>Your next moment goes here.</h3><p>Add an event and the live countdown will appear in this space.</p><button class="primary-button" data-action="open-event">Add an event</button></div>`;
    return;
  }
  mount.innerHTML = `<div class="countdown"><div class="countdown-copy"><span class="eyebrow">COUNTING DOWN TO</span><h3>${escapeHtml(event.title)}</h3><p>${formatDate(event.display_date)} · ${escapeHtml(event.event_time)}</p></div><div class="countdown-numbers"><div class="count-segment"><strong id="countDays">00</strong><span>days</span></div><span class="count-divider">:</span><div class="count-segment"><strong id="countHours">00</strong><span>hours</span></div><span class="count-divider">:</span><div class="count-segment"><strong id="countMinutes">00</strong><span>min</span></div><span class="count-divider">:</span><div class="count-segment"><strong id="countSeconds">00</strong><span>sec</span></div></div></div>`;
  const target = new Date(`${event.display_date}T${event.event_time || '00:00'}:00`).getTime();
  const update = () => {
    const remaining = parts(target - Date.now());
    ['Days', 'Hours', 'Minutes', 'Seconds'].forEach((name) => { const element = document.getElementById(`count${name}`); if (element) element.textContent = String(remaining[name.toLowerCase()]).padStart(2, '0'); });
  };
  update();
  countdownTimer = setInterval(update, 1000);
}
