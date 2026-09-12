import { MAX_INTERVAL_DAYS, newCard, type CardState } from "../domain/srs";

/**
 * On-device persistence.
 *
 * Everything lives in localStorage: a few thousand cards serialise to a few
 * hundred kilobytes, well inside the quota, and it behaves identically in the
 * browser, in the Tauri desktop build and in the Android build. The repository
 * interface keeps the rest of the app from caring which store is underneath.
 */

const KEY_CARDS = "tiger.cards.v1";
const KEY_STATS = "tiger.stats.v1";
const KEY_SETTINGS = "tiger.settings.v1";
const KEY_HISTORY = "tiger.history.v1";

/**
 * One studied day.
 *
 * Kept because `Stats` only ever knows about today: it has no memory of
 * yesterday, so nothing could answer "am I doing more than last month".
 * A day is about thirty bytes, so two years of them cost less than one
 * screenshot — the reason not to keep them was never space.
 */
export interface DayRecord {
  /** ISO date, YYYY-MM-DD. */
  day: string;
  reviews: number;
  correct: number;
  /** Cards met for the very first time that day. */
  fresh: number;
}

/**
 * How far back the history goes.
 *
 * Two years, then the oldest day falls off. Long enough that no chart ever
 * wants more, short enough that the record cannot grow without bound on a
 * device nobody clears.
 */
export const HISTORY_DAYS = 730;

export interface Stats {
  /** ISO date (YYYY-MM-DD) of the last day with at least one review. */
  lastStudyDay: string | null;
  /** Consecutive days studied, ending at `lastStudyDay`. */
  streak: number;
  /** Longest streak ever reached. */
  bestStreak: number;
  /** Lifetime answer counters. */
  totalReviews: number;
  totalCorrect: number;
  /** Reviews done today, reset when the day rolls over. */
  reviewsToday: number;
  /** How many of today's reviews were correct. */
  correctToday: number;
}

/**
 * Dialect is not a runtime setting: the course is written in Latin-American
 * Spanish, peninsular variants are always accepted as correct answers, and
 * `vosotros` is drilled regardless because it still has to be recognised.
 */
export interface Settings {
  /** Speech synthesis for Spanish prompts and answers. */
  soundEnabled: boolean;
  /**
   * Epoch millis until which listening questions are suppressed. Lets someone
   * keep studying somewhere they cannot listen, without turning sound off for
   * good and having to remember to turn it back on.
   */
  listeningPausedUntil: number;
  /**
   * What moves on to the next question.
   *
   * "auto" pauses briefly and moves on by itself — good on a phone, where
   * there is no keyboard to press. "enter" waits: the answer stays on screen
   * until Enter, which is what anyone reading the correction actually wants.
   * With a typed answer that makes two presses — the first checks, the second
   * moves on.
   */
  advance: "auto" | "enter";
  /**
   * Answers that count as a day's work.
   *
   * A target rather than a limit: passing it closes the ring, and nothing
   * stops at it. Thirty is roughly ten minutes, which is a size a bad day
   * can still fit.
   */
  dailyGoal: number;
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  listeningPausedUntil: 0,
  advance: "auto",
  dailyGoal: 30,
};

const EMPTY_STATS: Stats = {
  lastStudyDay: null,
  streak: 0,
  bestStreak: 0,
  totalReviews: 0,
  totalCorrect: 0,
  reviewsToday: 0,
  correctToday: 0,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failure: the session still works, it just will not
    // survive a restart. Nothing useful to do here beyond not crashing.
  }
}

export function isoDay(now: number): string {
  const d = new Date(now);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const parse = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(b) - parse(a)) / (24 * 60 * 60 * 1000));
}

/* -------------------------------------------------------------------------- */
/* Cards                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Repairs a stored card.
 *
 * Intervals used to compound without a ceiling, so saved progress contains
 * cards scheduled tens of thousands of years out. Left alone they would never
 * come up again and the deck would keep replaying its handful of nearest
 * cards. Clamping on load fixes existing progress without asking anyone to
 * start over.
 *
 * `seen` is also backfilled here: it was added after these cards were written,
 * and starting every one of them at zero would hand the same example sentence
 * to a card that has been answered a dozen times.
 */
function repair(card: CardState, now: number): CardState {
  const interval = Math.min(card.interval, MAX_INTERVAL_DAYS);
  const seen = card.seen ?? card.reps + card.lapses;

  if (interval === card.interval && card.seen !== undefined) return card;

  return {
    ...card,
    interval,
    // Pull an over-scheduled card back in line with its clamped interval.
    due: Math.min(card.due, now + interval * 24 * 60 * 60 * 1000),
    seen,
  };
}

export function loadCards(now: number = Date.now()): Map<string, CardState> {
  try {
    const raw = localStorage.getItem(KEY_CARDS);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, CardState>;
    return new Map(
      Object.entries(parsed).map(([id, card]) => [id, repair(card, now)]),
    );
  } catch {
    return new Map();
  }
}

export function saveCards(cards: Map<string, CardState>): void {
  write(KEY_CARDS, Object.fromEntries(cards));
}

export function getCard(cards: Map<string, CardState>, id: string): CardState {
  return cards.get(id) ?? newCard(id);
}

/* -------------------------------------------------------------------------- */
/* Stats and streak                                                           */
/* -------------------------------------------------------------------------- */

export function loadStats(now: number = Date.now()): Stats {
  let stored: Partial<Stats> = {};
  try {
    const raw = localStorage.getItem(KEY_STATS);
    if (raw) stored = JSON.parse(raw) as Partial<Stats>;
  } catch {
    stored = {};
  }
  let stats = read<Stats>(KEY_STATS, EMPTY_STATS);
  const today = isoDay(now);

  // Stats saved before `correctToday` existed carry a review count with no
  // matching correct count, which would report every earlier answer as wrong.
  // The two cannot be reconciled, so today's pair restarts together.
  if (stored.correctToday === undefined && stats.reviewsToday > 0) {
    stats = { ...stats, reviewsToday: 0, correctToday: 0 };
  }

  // Defensive: the pair must stay consistent, since "wrong" is derived from it.
  if (stats.correctToday > stats.reviewsToday) {
    stats = { ...stats, correctToday: stats.reviewsToday };
  }

  if (stats.lastStudyDay && stats.lastStudyDay !== today) {
    // A new day: today's counter restarts, and a gap of more than one day
    // breaks the streak.
    const gap = daysBetween(stats.lastStudyDay, today);
    return {
      ...stats,
      reviewsToday: 0,
      correctToday: 0,
      streak: gap > 1 ? 0 : stats.streak,
    };
  }
  return stats;
}

export function saveStats(stats: Stats): void {
  write(KEY_STATS, stats);
}

/* -------------------------------------------------------------------------- */
/* Daily history                                                              */
/* -------------------------------------------------------------------------- */

/** Oldest day first, so a chart can read it straight through. */
export function loadHistory(): DayRecord[] {
  const rows = read<DayRecord[]>(KEY_HISTORY, []);
  return Array.isArray(rows) ? rows : [];
}

export function saveHistory(history: DayRecord[]): void {
  write(KEY_HISTORY, history.slice(-HISTORY_DAYS));
}

/**
 * Adds one answer to today's row, creating the row on the first answer.
 *
 * Days with no study are simply absent rather than stored as zeroes: the
 * charts fill the gaps themselves, and an empty day is not a fact worth
 * writing down every time the app is opened.
 */
export function recordDay(
  history: DayRecord[],
  correct: boolean,
  fresh: boolean,
  now: number,
): DayRecord[] {
  const today = isoDay(now);
  const last = history[history.length - 1];

  if (last && last.day === today) {
    const updated: DayRecord = {
      day: today,
      reviews: last.reviews + 1,
      correct: last.correct + (correct ? 1 : 0),
      fresh: last.fresh + (fresh ? 1 : 0),
    };
    return [...history.slice(0, -1), updated];
  }

  const started: DayRecord = {
    day: today,
    reviews: 1,
    correct: correct ? 1 : 0,
    fresh: fresh ? 1 : 0,
  };
  return [...history, started].slice(-HISTORY_DAYS);
}

/** Records one answer and rolls the streak forward when a new day starts. */
export function recordReview(stats: Stats, correct: boolean, now: number): Stats {
  const today = isoDay(now);
  let { streak, bestStreak } = stats;

  if (stats.lastStudyDay !== today) {
    const gap = stats.lastStudyDay ? daysBetween(stats.lastStudyDay, today) : Infinity;
    streak = gap === 1 ? streak + 1 : 1;
    bestStreak = Math.max(bestStreak, streak);
  }

  // A new day resets today's counters before this answer is added to them.
  const sameDay = stats.lastStudyDay === today;

  return {
    lastStudyDay: today,
    streak,
    bestStreak,
    totalReviews: stats.totalReviews + 1,
    totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
    reviewsToday: (sameDay ? stats.reviewsToday : 0) + 1,
    correctToday: (sameDay ? stats.correctToday : 0) + (correct ? 1 : 0),
  };
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export function loadSettings(): Settings {
  // Merged over the defaults rather than used as-is: settings saved before a
  // new one existed would otherwise come back with it missing.
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEY_SETTINGS, {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEY_SETTINGS, settings);
}

/* -------------------------------------------------------------------------- */
/* Backup                                                                     */
/* -------------------------------------------------------------------------- */

interface Backup {
  format: "tiger-learns-progress";
  version: 1;
  exportedAt: string;
  cards: Record<string, CardState>;
  stats: Stats;
  settings: Settings;
  /** Absent in files written before the history existed. */
  history?: DayRecord[];
}

/**
 * Everything the learner has earned, as one portable file.
 *
 * Browser storage is scoped to the exact address the app was opened from, so
 * `localhost:5173` and `192.168.0.115:5173` keep entirely separate progress —
 * and clearing site data wipes it without warning. A file the learner holds is
 * the only copy that survives all of that, and it is also how progress moves
 * between a laptop and a phone without any server being involved.
 */
export function exportProgress(): string {
  const backup: Backup = {
    format: "tiger-learns-progress",
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: Object.fromEntries(loadCards()),
    stats: loadStats(),
    settings: loadSettings(),
    history: loadHistory(),
  };
  return JSON.stringify(backup, null, 2);
}

export type ImportResult =
  | { ok: true; cards: number; retired: number }
  | { ok: false; reason: string };

/**
 * Restores a backup, merging rather than replacing.
 *
 * A card already known on this device keeps whichever version was reviewed
 * more recently, so importing an older file cannot undo newer work — the one
 * way a restore could quietly destroy progress instead of saving it.
 */
export function importProgress(json: string): ImportResult {
  let parsed: Partial<Backup>;
  try {
    parsed = JSON.parse(json) as Partial<Backup>;
  } catch {
    return { ok: false, reason: "Файл не читается: это не сохранение прогресса." };
  }

  if (parsed.format !== "tiger-learns-progress" || !parsed.cards) {
    return { ok: false, reason: "Файл не похож на сохранение прогресса Tiger learns." };
  }

  const current = loadCards();
  let merged = 0;

  let retired = 0;

  for (const [id, incoming] of Object.entries(parsed.cards)) {
    const existing = current.get(id);
    const incomingSeen = incoming.lastReviewed ?? 0;
    const existingSeen = existing?.lastReviewed ?? 0;

    if (!existing || incomingSeen > existingSeen) {
      // Imported cards go through the same repair: a backup taken before the
      // interval cap carries the same runaway schedules.
      current.set(id, repair(incoming, Date.now()));
      merged += 1;
    }

    /*
     * Being switched off travels separately from the schedule.
     *
     * It has to, because it is a decision rather than a review: a word switched
     * off and never practised again has no `lastReviewed` to win the comparison
     * above, so merging it with the rest of the card would lose it every time.
     *
     * Either side switching it off wins. With no timestamp on the decision
     * there is no way to tell a fresh "switch this on again" from a stale
     * "never switched off", and of the two possible mistakes, hiding a word
     * that has to be un-hidden by one tap is the smaller one — the alternative
     * silently brings back everything the learner had already dismissed.
     */
    if (incoming.retired) {
      const card = current.get(id);
      if (card && !card.retired) {
        current.set(id, { ...card, retired: true });
        retired += 1;
      }
    }
  }

  saveCards(current);

  if (parsed.stats) {
    const stats = loadStats();
    saveStats({
      ...stats,
      // Lifetime totals are the larger of the two; today's counters belong to
      // this device and are left alone.
      totalReviews: Math.max(stats.totalReviews, parsed.stats.totalReviews ?? 0),
      totalCorrect: Math.max(stats.totalCorrect, parsed.stats.totalCorrect ?? 0),
      bestStreak: Math.max(stats.bestStreak, parsed.stats.bestStreak ?? 0),
      streak: Math.max(stats.streak, parsed.stats.streak ?? 0),
    });
  }

  if (parsed.history?.length) {
    // Merged by day, keeping whichever record has more work in it. Two
    // devices studied on the same day cannot be added together without
    // double-counting the days they were both used, and inventing a total
    // is worse than under-reporting one.
    const byDay = new Map(loadHistory().map((row) => [row.day, row]));
    for (const row of parsed.history) {
      const existing = byDay.get(row.day);
      if (!existing || row.reviews > existing.reviews) byDay.set(row.day, row);
    }
    saveHistory([...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)));
  }

  return { ok: true, cards: merged, retired };
}
