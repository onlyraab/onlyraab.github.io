// DJ Scheduler
//
// A small tool that splits a time window evenly across a list of DJs.
// All state lives in the URL hash (compressed with lz-string) so the
// whole app can be restored just by opening the link -- there is no
// backend, storage, or save button.

import '../../less/tools/scheduler.less';
import * as LZString from 'lz-string';
import qrcode from 'qrcode-generator';

interface SchedulerState {
  s: number; // start time, minutes after midnight
  d: number; // duration, in minutes (may run past midnight into the next day)
  p: string[]; // ordered DJ names
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ScheduleSlot {
  start: number;
  end: number;
  name: string;
}

// ---------------------------------------------------------------------
// State
//
// `state` is the only thing persisted (via the URL hash); `currentQr` is
// a cache of the last rendered QR code object so the download button
// doesn't have to rebuild it.
// ---------------------------------------------------------------------
let state: SchedulerState;
let currentQr: ReturnType<typeof qrcode> | null = null;

// ---------------------------------------------------------------------
// DOM references (queried once)
// ---------------------------------------------------------------------
const startInput = document.getElementById('start-time') as HTMLInputElement;
const durationInput = document.getElementById('duration') as HTMLInputElement;
const djCountInput = document.getElementById('dj-count') as HTMLInputElement;
const validationEl = document.getElementById('validation-message') as HTMLElement;
const scheduleEl = document.getElementById('schedule') as HTMLElement;
const qrContainer = document.getElementById('qrcode') as HTMLElement;
const copyBtn = document.getElementById('copy-link-btn') as HTMLButtonElement;
const downloadBtn = document.getElementById('download-qr-btn') as HTMLButtonElement;
const editorList = document.getElementById('editor-list') as HTMLUListElement;

// ---------------------------------------------------------------------
// State <-> URL hash
// ---------------------------------------------------------------------

function defaultState(): SchedulerState {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return { s: nextHour * 60, d: 60, p: ['DJ 1'] };
}

// JSON -> compressed, URL-safe string.
function encodeState(s: SchedulerState): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(s));
}

// Compressed hash fragment -> validated state, or null if it can't be
// trusted (missing/corrupt hash, malformed JSON, wrong shape).
function decodeState(hash: string): SchedulerState | null {
  if (!hash) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    const obj = JSON.parse(json);
    if (!Number.isFinite(obj.s) || !Number.isFinite(obj.d) || !Array.isArray(obj.p)) {
      return null;
    }
    return {
      s: obj.s,
      d: obj.d,
      p: obj.p.slice(0, 200).map((name: unknown) => String(name))
    };
  } catch (err) {
    return null;
  }
}

// Writes the current state into the URL without creating a history
// entry, so every keystroke doesn't pollute back/forward navigation.
function updateHash(s: SchedulerState): void {
  const url = new URL(window.location.href);
  url.hash = encodeState(s);
  history.replaceState(null, '', url);
}

// ---------------------------------------------------------------------
// Time helpers (whole minutes only, no seconds anywhere)
// ---------------------------------------------------------------------

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------

function validateState(s: SchedulerState): ValidationResult {
  const errors: string[] = [];
  if (s.p.length < 1) errors.push('Add at least one DJ.');
  if (s.d <= 0) errors.push('Duration must be longer than zero.');
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------
// Schedule calculation
//
// The duration is split evenly; a duration that doesn't divide evenly
// leaves a remainder of whole minutes, which is handed out one-per-slot
// to the earliest DJs so the schedule always adds up to exactly `d`.
// The end of the last slot (start + duration) can pass 1440, i.e. run
// into the next day -- formatMinutes() wraps it back onto a 24h clock
// for display.
// ---------------------------------------------------------------------

function calculateSchedule(s: SchedulerState): ScheduleSlot[] {
  const total = s.d;
  const n = s.p.length;
  if (n < 1 || total <= 0) return [];

  const base = Math.floor(total / n);
  let remainder = total % n;

  const slots: ScheduleSlot[] = [];
  let cursor = s.s;
  for (let i = 0; i < n; i++) {
    const duration = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    const start = cursor;
    const end = cursor + duration;
    const name = s.p[i].trim() || 'DJ ' + (i + 1);
    slots.push({ start, end, name });
    cursor = end;
  }
  return slots;
}

// ---------------------------------------------------------------------
// Reordering
// ---------------------------------------------------------------------

// Swaps two DJs by index (used by the move up/down buttons).
function swapPeople(s: SchedulerState, i: number, j: number): void {
  if (j < 0 || j >= s.p.length) return;
  const tmp = s.p[i];
  s.p[i] = s.p[j];
  s.p[j] = tmp;
  render();
}

// Moves a DJ from one position to another (used by drag & drop).
function movePerson(s: SchedulerState, from: number, to: number): void {
  if (from === to || from < 0 || to < 0 || from >= s.p.length || to >= s.p.length) return;
  const [item] = s.p.splice(from, 1);
  s.p.splice(to, 0, item);
  render();
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------

function renderInputs(s: SchedulerState): void {
  if (document.activeElement !== startInput) startInput.value = formatMinutes(s.s);
  if (document.activeElement !== durationInput) durationInput.value = formatMinutes(s.d);
  if (document.activeElement !== djCountInput) djCountInput.value = String(s.p.length);
}

function renderValidation(validation: ValidationResult): void {
  if (validation.valid) {
    validationEl.hidden = true;
    validationEl.textContent = '';
  } else {
    validationEl.hidden = false;
    validationEl.textContent = validation.errors.join(' ');
  }
}

function renderSchedule(schedule: ScheduleSlot[], validation: ValidationResult): void {
  scheduleEl.innerHTML = '';

  if (!validation.valid) {
    const p = document.createElement('p');
    p.className = 'schedule-empty';
    p.textContent = 'Fix the settings above to see the schedule.';
    scheduleEl.appendChild(p);
    return;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  // Slot times run on an extended timeline that can pass 1440 (midnight)
  // for overnight schedules. If the clock is earlier than the schedule's
  // start time, it must be showing the next-day portion, so shift it onto
  // that same extended timeline before comparing against slots.
  const scheduleStart = schedule.length ? schedule[0].start : 0;
  const nowExtended = nowMinutes < scheduleStart ? nowMinutes + 1440 : nowMinutes;

  const list = document.createElement('ul');
  list.className = 'schedule-list';
  schedule.forEach((slot) => {
    const li = document.createElement('li');
    li.className = 'schedule-row';
    if (nowExtended >= slot.start && nowExtended < slot.end) {
      li.classList.add('now-playing');
    }

    const time = document.createElement('span');
    time.className = 'schedule-time';
    time.textContent = formatMinutes(slot.start) + '–' + formatMinutes(slot.end);

    const name = document.createElement('span');
    name.className = 'schedule-name';
    name.textContent = slot.name;

    li.append(time, name);
    list.appendChild(li);
  });
  scheduleEl.appendChild(list);
}

// Rebuilds the DJ editor list. Because it fully replaces the row markup,
// focus (and cursor position) on a name input being typed into would
// otherwise be lost on every keystroke -- so it's captured before the
// rebuild and restored after.
function renderEditor(s: SchedulerState): void {
  const active = document.activeElement as HTMLElement | null;
  const activeIndex = active && active.dataset && 'index' in active.dataset
    ? Number(active.dataset.index)
    : null;
  const activeInput = activeIndex !== null ? (active as HTMLInputElement) : null;
  const selStart = activeInput ? activeInput.selectionStart : null;
  const selEnd = activeInput ? activeInput.selectionEnd : null;

  editorList.innerHTML = '';

  s.p.forEach((name, i) => {
    const li = document.createElement('li');
    li.className = 'editor-row';
    li.draggable = true;
    li.dataset.index = String(i);

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.textContent = '⠿';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'icon-btn move-up';
    upBtn.textContent = '▲';
    upBtn.setAttribute('aria-label', 'Move up');
    upBtn.disabled = i === 0;

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'icon-btn move-down';
    downBtn.textContent = '▼';
    downBtn.setAttribute('aria-label', 'Move down');
    downBtn.disabled = i === s.p.length - 1;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'dj-name-input';
    input.value = name;
    input.placeholder = 'DJ ' + (i + 1);
    input.dataset.index = String(i);
    input.setAttribute('aria-label', 'DJ ' + (i + 1) + ' name');

    li.append(handle, upBtn, downBtn, input);
    editorList.appendChild(li);
  });

  if (activeIndex !== null) {
    const restored = editorList.querySelector<HTMLInputElement>(
      'input[data-index="' + activeIndex + '"]'
    );
    if (restored) {
      restored.focus();
      if (selStart !== null && selEnd !== null) restored.setSelectionRange(selStart, selEnd);
    }
  }
}

function buildQr(url: string) {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  return qr;
}

function renderQRCode(url: string): void {
  currentQr = buildQr(url);
  qrContainer.innerHTML = currentQr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
}

// Runs `fn` (which changes the number of DJ rows and re-renders) while
// keeping the page's scroll position visually stable. Adding or removing
// rows changes the document's height, so holding the raw scrollY would
// let the page jump around the edited input; instead the scroll offset
// is captured as a fraction of the scrollable height and re-applied
// after the DOM has settled, landing back at the same relative spot.
function withScrollPreserved(fn: () => void): void {
  const scrollEl = document.scrollingElement || document.documentElement;
  const maxScrollBefore = scrollEl.scrollHeight - window.innerHeight;
  const ratio = maxScrollBefore > 0 ? window.scrollY / maxScrollBefore : 0;

  fn();

  const maxScrollAfter = scrollEl.scrollHeight - window.innerHeight;
  window.scrollTo(0, ratio * maxScrollAfter);
}

// ---------------------------------------------------------------------
// Master render: recompute everything from `state` and sync the URL.
// ---------------------------------------------------------------------
function render(): void {
  const validation = validateState(state);
  updateHash(state);

  renderValidation(validation);
  renderSchedule(validation.valid ? calculateSchedule(state) : [], validation);
  renderInputs(state);
  renderEditor(state);
  renderQRCode(location.href);
}

// ---------------------------------------------------------------------
// Event wiring (attached once)
// ---------------------------------------------------------------------

function setupEventListeners(): void {
  startInput.addEventListener('input', () => {
    if (startInput.value) state.s = timeToMinutes(startInput.value);
    render();
  });

  durationInput.addEventListener('input', () => {
    if (durationInput.value) state.d = timeToMinutes(durationInput.value);
    render();
  });

  djCountInput.addEventListener('input', () => {
    withScrollPreserved(() => {
      let n = parseInt(djCountInput.value, 10);
      if (isNaN(n)) n = 0;
      n = Math.max(0, Math.min(50, n));
      if (n > state.p.length) {
        while (state.p.length < n) state.p.push('');
      } else {
        state.p.length = n;
      }
      render();
    });
  });

  // Delegated listeners on the editor list -- rows are recreated on every
  // render, so binding once on the stable parent avoids leaking listeners
  // and keeps setup simple.
  editorList.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches('.dj-name-input')) return;
    const index = Number(target.dataset.index);
    state.p[index] = (target as HTMLInputElement).value;
    render();
  });

  editorList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const upBtn = target.closest('.move-up');
    const downBtn = target.closest('.move-down');
    if (!upBtn && !downBtn) return;
    const row = target.closest('.editor-row') as HTMLElement;
    const index = Number(row.dataset.index);
    if (upBtn) swapPeople(state, index, index - 1);
    else swapPeople(state, index, index + 1);
  });

  editorList.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.editor-row') as HTMLElement | null;
    if (!row || !e.dataTransfer) return;
    e.dataTransfer.setData('text/plain', row.dataset.index || '');
    e.dataTransfer.effectAllowed = 'move';
    row.classList.add('dragging');
  });

  editorList.addEventListener('dragend', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.editor-row');
    if (row) row.classList.remove('dragging');
    editorList.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  });

  editorList.addEventListener('dragover', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.editor-row') as HTMLElement | null;
    if (!row) return;
    e.preventDefault();
    editorList.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
    row.classList.add('drag-over');
  });

  editorList.addEventListener('drop', (e) => {
    const target = e.target as HTMLElement;
    const row = target.closest('.editor-row') as HTMLElement | null;
    if (!row || !e.dataTransfer) return;
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    const to = Number(row.dataset.index);
    movePerson(state, from, to);
  });

  copyBtn.addEventListener('click', async () => {
    const original = copyBtn.textContent;
    try {
      await navigator.clipboard.writeText(location.href);
      copyBtn.textContent = 'Copied!';
    } catch (err) {
      copyBtn.textContent = 'Copy failed';
    }
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 1600);
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentQr) return;
    const link = document.createElement('a');
    link.href = currentQr.createDataURL(8, 16);
    link.download = 'dj-schedule-qr.gif';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // Someone editing the hash directly (or opening a fresh shared link in
  // a tab that's already running) should update the whole app.
  window.addEventListener('hashchange', () => {
    const next = decodeState(location.hash.slice(1));
    if (next) {
      state = next;
      render();
    }
  });

  // Keep the "now playing" highlight fresh without a full re-render.
  setInterval(() => {
    const validation = validateState(state);
    renderSchedule(validation.valid ? calculateSchedule(state) : [], validation);
  }, 30000);
}

function init(): void {
  state = decodeState(location.hash.slice(1)) || defaultState();
  setupEventListeners();
  render();
}

init();
