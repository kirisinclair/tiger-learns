/**
 * Spaced repetition, SM-2 style.
 *
 * Cards never graduate out of the system: a correct answer only stretches the
 * interval (1 day → 3 → a week → a month → …), so review is genuinely endless.
 * A wrong answer resets the interval and pushes the card back into the current
 * session.
 */

export interface CardState {
  /** Deck-scoped card key, e.g. "conj:es.hablar:present:yo". */
  id: string;
  /** Ease factor. Starts at 2.5 and drifts with performance. */
  ease: number;
  /** Current interval in days. */
  interval: number;
  /** Epoch millis when the card becomes due. */
  due: number;
  /** Consecutive successful reviews. Reset to 0 on a lapse. */
  reps: number;
  /** How many times the card has been forgotten. */
  lapses: number;
  /** Epoch millis of the last review, `null` for a card never seen. */
  lastReviewed: number | null;
  /**
   * How many times this card has ever been answered. Unlike `reps` it never
   * resets, which is what makes it usable as a cursor: the sentence built
   * around the verb advances by one on every encounter, so a card returns with
   * a different example rather than the same one over and over.
   */
  seen?: number;
  /**
   * Switched off by hand: never scheduled, never spoken, never counted.
   *
   * A property of the card rather than a list kept beside it, so it cannot
   * drift out of step with the card and travels with the progress file for
   * free. Reversible on purpose — see the retired list on the progress
   * screen — because a permanent decision made by one tap on a phone is a
   * decision made by accident.
   */
  retired?: boolean;
}

export const MIN_EASE = 1.3;
export const START_EASE = 2.5;
const MAX_EASE = 2.9;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Longest a card may be put off, in days.
 *
 * Without a ceiling the interval compounds without limit: multiplying by an
 * ease of 2.9 fifteen times over sent real cards a hundred and sixty thousand
 * years into the future. Those cards are then never due again, the deck runs
 * out of anything to show, and the session falls back to replaying whatever is
 * nearest — which is exactly what repetition feels like from the outside.
 *
 * A year is long enough to mean "known" and short enough to keep the card in
 * the system.
 */
export const MAX_INTERVAL_DAYS = 365;

export function newCard(id: string): CardState {
  return {
    id,
    ease: START_EASE,
    interval: 0,
    due: 0,
    reps: 0,
    lapses: 0,
    lastReviewed: null,
    seen: 0,
  };
}

/** The stored state for a card, or a fresh one if it has never been seen. */
export function getCardOrNew(states: Map<string, CardState>, id: string): CardState {
  return states.get(id) ?? newCard(id);
}

export type Grade = "again" | "good" | "easy";

/** Applies one review and returns the updated state. Pure — no clock reads. */
export function review(card: CardState, grade: Grade, now: number): CardState {
  if (grade === "again") {
    return {
      ...card,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      interval: 0,
      // Due immediately: the session queue will show it again before finishing.
      due: now,
      reps: 0,
      lapses: card.lapses + 1,
      lastReviewed: now,
      seen: (card.seen ?? 0) + 1,
    };
  }

  const reps = card.reps + 1;
  const ease = Math.min(MAX_EASE, card.ease + (grade === "easy" ? 0.15 : 0.05));

  let interval: number;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.round(card.interval * ease);

  if (grade === "easy") interval = Math.round(interval * 1.3);
  interval = Math.min(MAX_INTERVAL_DAYS, Math.max(1, interval));

  return {
    ...card,
    ease,
    interval,
    due: now + interval * DAY_MS,
    reps,
    lapses: card.lapses,
    lastReviewed: now,
    seen: (card.seen ?? 0) + 1,
  };
}

/** How well established a card is — drives which exercise kind is used. */
export type Maturity = "new" | "learning" | "young" | "mature";

export function maturity(card: CardState): Maturity {
  if (card.reps === 0 && card.lastReviewed === null) return "new";
  if (card.reps < 2) return "learning";
  if (card.interval < 21) return "young";
  return "mature";
}

/** One card as the session ordering sees it: an id plus the word it belongs to. */
export interface SessionCard {
  id: string;
  /** Cards sharing a family are spread apart rather than run back to back. */
  family: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Interleaves cards so consecutive ones come from different words.
 *
 * Input order decides which family is introduced first (for conjugation decks
 * that is frequency order); within a family the cards are shuffled, so the
 * person being asked is unpredictable. Then families are visited round-robin:
 * verb A in some person, verb B in some other person, and so on.
 */
/**
 * Families are shuffled inside blocks of this size before the round-robin.
 *
 * Without it every session opens with the same two or three words, because the
 * content order is fixed. Shuffling in small blocks varies the opening while
 * keeping the overall progression from frequent to rare intact.
 */
const START_VARIETY_BLOCK = 6;

function shuffleWithinBlocks<T>(items: T[], blockSize: number): T[] {
  const result: T[] = [];
  for (let start = 0; start < items.length; start += blockSize) {
    result.push(...shuffle(items.slice(start, start + blockSize)));
  }
  return result;
}

export function interleaveByFamily(cards: SessionCard[]): string[] {
  const families = new Map<string, string[]>();
  for (const card of cards) {
    const bucket = families.get(card.family);
    if (bucket) bucket.push(card.id);
    else families.set(card.family, [card.id]);
  }

  const buckets = shuffleWithinBlocks([...families.values()], START_VARIETY_BLOCK).map(shuffle);
  const result: string[] = [];
  let round = 0;
  let remaining = cards.length;

  while (remaining > 0) {
    for (const bucket of buckets) {
      if (round < bucket.length) {
        result.push(bucket[round]);
        remaining -= 1;
      }
    }
    round += 1;
  }

  return result;
}

/**
 * Orders every card in a deck for an endless session.
 *
 * There is no cap: the learner practises until they leave. Cards already due
 * come first, oldest due date first, because those are the ones about to be
 * forgotten. Then unseen cards, interleaved so the drill jumps between words.
 * Then everything else by how soon it falls due, which keeps the session going
 * once the backlog is cleared.
 */
export function orderSession(
  cards: SessionCard[],
  states: Map<string, CardState>,
  now: number,
): string[] {
  const due: CardState[] = [];
  const fresh: SessionCard[] = [];
  const upcoming: CardState[] = [];

  for (const card of cards) {
    const state = states.get(card.id);
    if (!state || state.lastReviewed === null) fresh.push(card);
    else if (state.due <= now) due.push(state);
    else upcoming.push(state);
  }

  due.sort((a, b) => a.due - b.due);
  upcoming.sort((a, b) => a.due - b.due);

  return [
    ...due.map((state) => state.id),
    ...interleaveByFamily(fresh),
    ...upcoming.map((state) => state.id),
  ];
}

/** Counts used by the deck list and the stats tiles. */
export interface DeckProgress {
  total: number;
  seen: number;
  dueNow: number;
  mature: number;
}

export function deckProgress(
  cardIds: string[],
  states: Map<string, CardState>,
  now: number,
): DeckProgress {
  let seen = 0;
  let dueNow = 0;
  let mature = 0;

  for (const id of cardIds) {
    const state = states.get(id);
    if (!state || state.lastReviewed === null) continue;
    seen += 1;
    if (state.due <= now) dueNow += 1;
    if (maturity(state) === "mature") mature += 1;
  }

  return { total: cardIds.length, seen, dueNow, mature };
}
