const HOURS_ROOT = document.querySelector('[data-hours]');
const WEEK_LENGTH = 7;
const MINUTES_IN_DAY = 1440;
const TIME_ZONE = 'Europe/Bratislava';
const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Reads the current weekday and minute of the day in Slovakia, whatever the visitor's own time zone is.
 * @returns {{dayIndex: number, minutes: number}}
 */
function nowInNitra() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const read = (type) => parts.find((part) => part.type === type).value;
  return {
    dayIndex: WEEKDAY_ORDER.indexOf(read('weekday')),
    minutes: Number(read('hour')) * 60 + Number(read('minute')),
  };
}

/**
 * Formats minutes since midnight of the opening day as a clock time.
 * @param {number} minutes
 * @returns {string}
 */
function clockLabel(minutes) {
  const wrapped = minutes % MINUTES_IN_DAY;
  const hour = Math.floor(wrapped / 60);
  return `${hour}:${String(wrapped % 60).padStart(2, '0')}`;
}

/**
 * Finds whether the venue is open now, counting a night that started yesterday.
 * @param {Array<Array<number>|null>} week
 * @param {{dayIndex: number, minutes: number}} now
 * @returns {number|null} Closing minute relative to today, or null when closed.
 */
function closingMinute(week, now) {
  const today = week[now.dayIndex];
  if (today && now.minutes >= today[0] && now.minutes < today[1]) return today[1];
  const yesterday = week[(now.dayIndex + WEEK_LENGTH - 1) % WEEK_LENGTH];
  if (yesterday && now.minutes + MINUTES_IN_DAY < yesterday[1]) return yesterday[1];
  return null;
}

/**
 * Finds the next opening within the coming week.
 * @param {Array<Array<number>|null>} week
 * @param {{dayIndex: number, minutes: number}} now
 * @returns {{offset: number, minutes: number}|null}
 */
function nextOpening(week, now) {
  for (let offset = 0; offset <= WEEK_LENGTH; offset += 1) {
    const day = week[(now.dayIndex + offset) % WEEK_LENGTH];
    if (day && (offset > 0 || day[0] > now.minutes)) return { offset, minutes: day[0] };
  }
  return null;
}

/**
 * Marks today in the week chart and writes the live open or closed line.
 * @param {HTMLElement} root
 */
function renderHours(root) {
  const week = JSON.parse(root.dataset.hours);
  const dayNames = JSON.parse(root.dataset.days);
  const now = nowInNitra();
  root.querySelectorAll('.week-day')[now.dayIndex]?.classList.add('is-today');
  const status = root.querySelector('.week-status');
  if (!status) return;
  const closing = closingMinute(week, now);
  status.dataset.open = String(closing !== null);
  if (closing !== null) {
    status.textContent = `Teraz otvorené, do ${clockLabel(closing)}`;
    return;
  }
  const next = nextOpening(week, now);
  if (!next) {
    status.textContent = 'Teraz zatvorené';
    return;
  }
  const when = next.offset === 0 ? 'dnes' : next.offset === 1 ? 'zajtra' : dayNames[(now.dayIndex + next.offset) % WEEK_LENGTH];
  status.textContent = `Teraz zatvorené, otvára ${when} o ${clockLabel(next.minutes)}`;
}

if (HOURS_ROOT) renderHours(HOURS_ROOT);
