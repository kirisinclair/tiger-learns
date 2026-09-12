import type { ContentIndex } from "../content";
import type { DayRecord } from "../storage/progressStore";
import { expandDeck, expandDeckIncludingRetired, type CardRef } from "./cards";
import { maturity, type CardState } from "./srs";
import type { Deck } from "./types";

/**
 * Everything the progress screen shows, computed from what is already stored.
 *
 * Deliberately a plain function over cards and content rather than a second
 * saved record: any number kept separately from the cards is a number that can
 * disagree with them, and progress counters that contradict the cards are
 * worse than none. Only the daily history is stored, and only because
 * yesterday cannot be recomputed from today.
 *
 * Two measures, not one, because the two halves of the app do not compare.
 * Words and phrases accumulate — each one learned is a thing that can be said,
 * and counting them answers "how far have I got". Conjugation does not work
 * that way: seven persons times a dozen tenses times two hundred verbs is a
 * number that only ever looks discouraging, and "9% of forms" says nothing
 * about whether the present tense has clicked. So grammar is measured as work
 * done — repetitions — and vocabulary as ground gained.
 */

/** Four buckets, in the order they are learned. */
export interface Buckets {
  total: number;
  /** Never answered. */
  unseen: number;
  /** Answered, but not yet holding: fewer than two successes in a row. */
  learning: number;
  /** Holding, but the interval is still under three weeks. */
  young: number;
  /** Coming back at three weeks or more. */
  mature: number;
  /**
   * Switched off by hand.
   *
   * Counted as known, and counted inside the total. A word is switched off
   * precisely because it is already known — that is the whole reason the
   * switch exists — so leaving it out of the numerator understated the
   * vocabulary by exactly the words the learner was surest of. It stays in the
   * denominator for the same reason: a fraction whose halves disagree about
   * what they are counting is worse than either number alone.
   */
  retired: number;
}

const EMPTY: Buckets = { total: 0, unseen: 0, learning: 0, young: 0, mature: 0, retired: 0 };

export function bucketOf(state: CardState | undefined): keyof Buckets {
  if (!state) return "unseen";
  if (state.retired) return "retired";
  switch (maturity(state)) {
    case "new":
      return "unseen";
    case "learning":
      return "learning";
    case "young":
      return "young";
    default:
      return "mature";
  }
}

/* -------------------------------------------------------------------------- */
/* Vocabulary: words and phrases only                                         */
/* -------------------------------------------------------------------------- */

export interface VocabularyProgress {
  words: Buckets;
  phrases: Buckets;
  /** The two added together — the headline "you know N things" figure. */
  both: Buckets;
  /** Of the frequency list specifically, which is ordered by usefulness. */
  frequencyKnown: number;
  frequencyTotal: number;
}

/**
 * How much can actually be said.
 *
 * "Known" means young or mature: answered right twice running and now coming
 * back at intervals. A card met once and not seen since is counted as met, not
 * known — the whole point of the interval is that it has not been proved yet.
 *
 * No claim is made about what share of speech this covers. The figures people
 * quote — "the top thousand words are 80% of everything said" — describe
 * knowing the top thousand *in order*, and cannot be applied to a scattered
 * subset without inventing a frequency model. A count that is true beats a
 * percentage that is impressive.
 */
export function vocabularyProgress(
  content: ContentIndex,
  cards: Map<string, CardState>,
): VocabularyProgress {
  const words = { ...EMPTY };

  for (const lexeme of content.lexemes.values()) {
    words.total += 1;
    words[bucketOf(cards.get(`lex:${lexeme.id}`))] += 1;
  }

  /*
   * The frequency tally is counted over the frequency decks, not over entries
   * carrying a rank.
   *
   * Seventy-three of the thousand are verbs: they have cards of their own and
   * no dictionary entry at all, so counting ranked dictionary words reported
   * "из 927" beside a section promising a thousand. The decks already resolve
   * each position to whichever card teaches it, which makes them the only
   * honest source for this number.
   */
  let frequencyKnown = 0;
  let frequencyTotal = 0;
  for (const deck of content.decks) {
    if (deck.track !== "frequency" || deck.id.endsWith(".all")) continue;
    for (const card of expandDeckIncludingRetired(deck, content, cards)) {
      frequencyTotal += 1;
      if (KNOWN.has(bucketOf(cards.get(card.id)))) frequencyKnown += 1;
    }
  }

  const phrases = { ...EMPTY };
  for (const phrase of content.phrases.values()) {
    const state = cards.get(`phrase:${phrase.id}`);
    phrases.total += 1;
    phrases[bucketOf(state)] += 1;
  }

  const both: Buckets = {
    total: words.total + phrases.total,
    unseen: words.unseen + phrases.unseen,
    learning: words.learning + phrases.learning,
    young: words.young + phrases.young,
    mature: words.mature + phrases.mature,
    retired: words.retired + phrases.retired,
  };

  return { words, phrases, both, frequencyKnown, frequencyTotal };
}

/** The three states that mean "I have this one". */
const KNOWN = new Set<keyof Buckets>(["young", "mature", "retired"]);

/**
 * How one deck stands, for the bar on its button.
 *
 * Counted over every card the deck names, switched-off ones included: they are
 * known, and leaving them out would fill the bar as words were removed from it.
 */
export function deckBuckets(
  deck: Deck,
  content: ContentIndex,
  cards: Map<string, CardState>,
): Buckets {
  const counts = { ...EMPTY };
  for (const card of expandDeckIncludingRetired(deck, content, cards)) {
    counts.total += 1;
    counts[bucketOf(cards.get(card.id))] += 1;
  }
  return counts;
}

/** Words and phrases that count as known, switched-off ones included. */
export function knownCount(buckets: Buckets): number {
  return buckets.young + buckets.mature + buckets.retired;
}

/* -------------------------------------------------------------------------- */
/* A rough level, from vocabulary size                                        */
/* -------------------------------------------------------------------------- */

export interface LevelEstimate {
  /** The band reached, e.g. "A1". */
  level: string;
  /** The next band up, or null at the top of what this app can measure. */
  next: string | null;
  /** Words still needed to reach it. */
  remaining: number;
}

/**
 * Vocabulary size, turned into a CEFR band.
 *
 * The thresholds are the commonly cited receptive-vocabulary figures for the
 * levels, rounded hard because the published numbers disagree with each other
 * by hundreds and pretending otherwise would be false precision. Hence
 * "примерный" on the label, which is not modesty but accuracy.
 *
 * Counted on words alone, not phrases: the benchmarks are about words, and a
 * memorised phrase is a different kind of knowing. Counted on words known
 * *here*, which is a floor rather than a measure — whatever was learned
 * elsewhere is invisible to this app.
 *
 * And it says nothing about grammar. Someone with a thousand words and no past
 * tense is not A2 in any way that matters at a clinic window; the number is a
 * milestone, not a certificate.
 */
const LEVEL_BANDS: Array<{ level: string; from: number }> = [
  { level: "B2", from: 4000 },
  { level: "B1", from: 2000 },
  { level: "A2", from: 900 },
  { level: "A1", from: 300 },
  { level: "начальный", from: 0 },
];

export function levelEstimate(knownWords: number): LevelEstimate {
  const index = LEVEL_BANDS.findIndex((band) => knownWords >= band.from);
  const current = LEVEL_BANDS[index];
  const next = index > 0 ? LEVEL_BANDS[index - 1] : null;
  return {
    level: current.level,
    next: next?.level ?? null,
    remaining: next ? next.from - knownWords : 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Grammar: work done, not ground gained                                      */
/* -------------------------------------------------------------------------- */

export interface GrammarProgress {
  /** Every answer ever given to a conjugation card. */
  reps: number;
  /** Distinct forms met at least once. */
  formsMet: number;
  /** Distinct forms now coming back at intervals. */
  formsHeld: number;
  /** Verbs touched at all, across every tense. */
  verbs: number;
}

/**
 * Conjugation counted as repetitions.
 *
 * `seen` is the right counter here and `reps` is not: `reps` resets to zero on
 * every lapse, so it measures the current run rather than the work, and a verb
 * fought with for a month would report less than one answered right twice.
 */
export function grammarProgress(cards: Map<string, CardState>): GrammarProgress {
  let reps = 0;
  let formsMet = 0;
  let formsHeld = 0;
  const verbs = new Set<string>();

  for (const [id, state] of cards) {
    if (!id.startsWith("conj:") || state.retired) continue;
    reps += state.seen ?? state.reps + state.lapses;
    if (state.lastReviewed === null) continue;
    formsMet += 1;
    const level = maturity(state);
    if (level === "young" || level === "mature") formsHeld += 1;
    // "conj:<verbId>:<tense>:<person>" — the verb id may itself contain a dot
    // but never a colon.
    verbs.add(id.split(":")[1] ?? id);
  }

  return { reps, formsMet, formsHeld, verbs: verbs.size };
}

/* -------------------------------------------------------------------------- */
/* Trouble spots and what is coming                                           */
/* -------------------------------------------------------------------------- */

export interface HardCard {
  id: string;
  ref: CardRef;
  lapses: number;
  /** Share of answers that were wrong, as a fraction. */
  failRate: number;
}

/**
 * The cards that keep being forgotten.
 *
 * Ranked by lapses rather than by fail rate: a card forgotten nine times out
 * of thirty is a real problem, one missed once out of one is noise. The rate
 * is carried along for display but does not decide the order.
 */
export function hardCards(
  content: ContentIndex,
  cards: Map<string, CardState>,
  limit = 12,
): HardCard[] {
  const refs = new Map<string, CardRef>();
  for (const deck of content.decks) {
    if (deck.id.endsWith(".all")) continue;
    for (const card of expandDeck(deck, content, cards)) refs.set(card.id, card);
  }

  const rows: HardCard[] = [];
  for (const [id, state] of cards) {
    if (state.lapses < 2) continue;
    const ref = refs.get(id);
    if (!ref) continue;
    const answers = state.seen ?? state.reps + state.lapses;
    rows.push({ id, ref, lapses: state.lapses, failRate: answers ? state.lapses / answers : 0 });
  }

  return rows.sort((a, b) => b.lapses - a.lapses || b.failRate - a.failRate).slice(0, limit);
}

/** How many cards come due on each of the next `days` days, today included. */
export function dueForecast(cards: Map<string, CardState>, now: number, days = 7): number[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const counts = new Array<number>(days).fill(0);

  for (const state of cards.values()) {
    if (state.lastReviewed === null) continue;
    // Anything already overdue belongs to today, not to the day it lapsed.
    const index = Math.max(0, Math.floor((state.due - startOfToday) / dayMs));
    if (index < days) counts[index] += 1;
  }
  return counts;
}

/* -------------------------------------------------------------------------- */
/* Days                                                                       */
/* -------------------------------------------------------------------------- */

function isoOffset(today: number, offset: number): string {
  const date = new Date(today - offset * 24 * 60 * 60 * 1000);
  // Local date, not UTC: `toISOString` would shift the day in a positive
  // timezone and put a late-evening session on tomorrow.
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Consecutive days ending today (or yesterday) on which the goal was met.
 *
 * Yesterday counts as the end so the streak does not read as broken at
 * breakfast, before the day's practice has happened.
 */
export function goalStreak(history: DayRecord[], goal: number, now: number): number {
  if (goal <= 0) return 0;
  const met = new Set(history.filter((row) => row.reviews >= goal).map((row) => row.day));

  const today = new Date(now).setHours(0, 0, 0, 0);
  let offset = met.has(isoOffset(today, 0)) ? 0 : 1;
  let streak = 0;
  while (met.has(isoOffset(today, offset))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

/**
 * The last `days` days as a dense series, missing days filled with zeroes.
 *
 * Charts need every day present; storage does not, so the gaps are opened here
 * rather than written down.
 */
export function recentDays(history: DayRecord[], now: number, days = 30): DayRecord[] {
  const byDay = new Map(history.map((row) => [row.day, row]));
  const today = new Date(now).setHours(0, 0, 0, 0);

  const out: DayRecord[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = isoOffset(today, offset);
    out.push(byDay.get(day) ?? { day, reviews: 0, correct: 0, fresh: 0 });
  }
  return out;
}
