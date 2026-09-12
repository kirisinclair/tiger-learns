import type { ContentIndex } from "../content";
import { PRACTICE_PERSONS } from "./conjugation";
import type { Deck, Person, Tense } from "./types";
import { FREQUENCY_ORDER } from "../content/frequencyOrder";

/**
 * Verb order for conjugation drills.
 *
 * Two things are balanced here. Within a group the most frequent verbs come
 * first, so useful verbs are introduced before rare ones. Across groups the
 * three endings take equal turns rather than appearing in proportion to how
 * many verbs each has — otherwise -ar, with forty of the eighty regular verbs,
 * would swamp the session and -ir, with ten, would barely show up.
 */
function orderVerbsForPractice(verbIds: string[], index: ContentIndex): string[] {
  const groups: Record<"ar" | "er" | "ir", string[]> = { ar: [], er: [], ir: [] };

  const byRank = [...verbIds].sort((a, b) => {
    const rankA = index.verbs.get(a)?.rank ?? Infinity;
    const rankB = index.verbs.get(b)?.rank ?? Infinity;
    return rankA - rankB;
  });

  for (const id of byRank) {
    const verb = index.verbs.get(id);
    if (verb) groups[verb.group].push(id);
  }

  // Round-robin -ar, -er, -ir. Groups that run out simply drop out of the cycle.
  const order: string[] = [];
  const cycle = [groups.ar, groups.er, groups.ir];
  for (let round = 0; order.length < byRank.length; round += 1) {
    for (const group of cycle) {
      if (round < group.length) order.push(group[round]);
    }
  }
  return order;
}

/**
 * A card is the smallest thing the SRS schedules. Its id is stable across
 * releases so progress survives content updates.
 */
export type CardRef =
  | { kind: "conjugation"; id: string; verbId: string; tense: Tense; person: Person }
  | { kind: "lexeme"; id: string; lexemeId: string }
  | { kind: "verbMeaning"; id: string; verbId: string }
  | { kind: "phrase"; id: string; phraseId: string };

export function conjugationCardId(verbId: string, tense: Tense, person: Person): string {
  return `conj:${verbId}:${tense}:${person}`;
}

/**
 * The word a card belongs to. Session ordering spreads cards of the same family
 * apart, so a conjugation drill moves from verb to verb instead of running one
 * verb through every person before touching the next.
 */
export function familyOf(card: CardRef): string {
  switch (card.kind) {
    case "conjugation":
      return card.verbId;
    case "verbMeaning":
      return card.verbId;
    case "lexeme":
      return card.lexemeId;
    case "phrase":
      return card.phraseId;
  }
}

/**
 * Rebuilds a card reference from its id.
 * Ids are stable and self-describing, which is what lets a hand-picked
 * selection be stored as a plain list of strings.
 */
export function parseCardId(id: string): CardRef | null {
  const [prefix, ...rest] = id.split(":");
  switch (prefix) {
    case "lex":
      return { kind: "lexeme", id, lexemeId: rest.join(":") };
    case "verb":
      return { kind: "verbMeaning", id, verbId: rest.join(":") };
    case "phrase":
      return { kind: "phrase", id, phraseId: rest.join(":") };
    case "conj": {
      const [verbId, tense, person] = rest;
      if (!verbId || !tense || !person) return null;
      return {
        kind: "conjugation",
        id,
        verbId,
        tense: tense as Tense,
        person: person as Person,
      };
    }
    default:
      return null;
  }
}

/**
 * Word-to-card lookup, built once per content index.
 *
 * It used to scan every verb and every dictionary entry for each word, which is
 * fine once and ruinous a thousand times: drawing the ten frequency bars took
 * eighteen milliseconds on a desktop, and that is the cheap machine. The index
 * is cached against the content object rather than rebuilt, since content never
 * changes at runtime.
 */
const wordIndexCache = new WeakMap<ContentIndex, Map<string, CardRef>>();

function wordIndex(index: ContentIndex): Map<string, CardRef> {
  const cached = wordIndexCache.get(index);
  if (cached) return cached;

  const map = new Map<string, CardRef>();

  // Dictionary entries first, verbs second, so a verb overwrites a same-spelled
  // dictionary entry: the verb's card is the canonical one for a verb.
  for (const lex of index.lexemes.values()) {
    const full = lex.es.toLowerCase();
    const ref: CardRef = { kind: "lexeme", id: `lex:${lex.id}`, lexemeId: lex.id };
    // Both forms: nouns are stored with their article ("la casa"), but a few
    // entries begin with one as part of the word itself ("los demás").
    if (!map.has(full)) map.set(full, ref);
    const bare = full.replace(/^(el|la|los|las)\s+/i, "");
    if (!map.has(bare)) map.set(bare, ref);
  }

  for (const verb of index.verbs.values()) {
    map.set(verb.infinitive, { kind: "verbMeaning", id: `verb:${verb.id}`, verbId: verb.id });
  }

  wordIndexCache.set(index, map);
  return map;
}

/** Finds the one card that teaches a word. */
function resolveWord(word: string, index: ContentIndex): CardRef | null {
  return wordIndex(index).get(word) ?? null;
}

/** How badly a card is going, for the "trouble" view of the dictionary. */
export interface CardStateLike {
  /** Switched off by hand; excluded from every deck. */
  retired?: boolean;
  lapses: number;
  ease: number;
  due: number;
  lastReviewed: number | null;
}

/**
 * Turns a deck definition into the concrete list of cards it schedules.
 *
 * Retired cards are dropped here rather than at each call site, and that is
 * the whole point: practice, listening, the level lists, the verb browser and
 * every progress count all read decks through this one function, so one
 * filter makes "never show me this again" mean the same thing everywhere.
 * Filtering in five places would eventually mean five different answers.
 */
export function expandDeck(
  deck: Deck,
  index: ContentIndex,
  states?: Map<string, CardStateLike>,
): CardRef[] {
  const cards = expandDeckIncludingRetired(deck, index, states);
  if (!states) return cards;
  return cards.filter((card) => !states.get(card.id)?.retired);
}

/**
 * Every card a deck names, retired ones included.
 *
 * Exported for the word lists, and only for them. A switched-off word has
 * to stay visible where it was switched off, or there is no way back; and
 * it has to keep its place in the list, or turning one word off would
 * renumber the levels under it and quietly break what "I finished level 3"
 * refers to.
 */
export function expandDeckIncludingRetired(
  deck: Deck,
  index: ContentIndex,
  states?: Map<string, CardStateLike>,
): CardRef[] {
  const source = deck.source;

  switch (source.kind) {
    case "lexemes":
      return source.ids
        .filter((id) => index.lexemes.has(id))
        .map((id) => ({ kind: "lexeme", id: `lex:${id}`, lexemeId: id }));

    case "lexemeQuery": {
      const matches = [...index.lexemes.values()].filter((lex) => {
        if (source.pos && !source.pos.includes(lex.pos)) return false;
        if (source.cefr && !source.cefr.includes(lex.cefr)) return false;
        if (source.topics && !source.topics.some((t) => lex.topics?.includes(t))) return false;
        if (source.rankRange) {
          const [lo, hi] = source.rankRange;
          if (lex.rank === null || lex.rank < lo || lex.rank > hi) return false;
        }
        return true;
      });
      matches.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
      return matches.map((lex) => ({ kind: "lexeme", id: `lex:${lex.id}`, lexemeId: lex.id }));
    }

    case "verbMeaning":
      return source.verbIds
        .filter((id) => index.verbs.has(id))
        .map((id) => ({ kind: "verbMeaning", id: `verb:${id}`, verbId: id }));

    case "conjugation": {
      const cards: CardRef[] = [];
      for (const verbId of orderVerbsForPractice(source.verbIds, index)) {
        if (!index.verbs.has(verbId)) continue;
        for (const tense of source.tenses) {
          for (const person of PRACTICE_PERSONS) {
            cards.push({
              kind: "conjugation",
              id: conjugationCardId(verbId, tense, person),
              verbId,
              tense,
              person,
            });
          }
        }
      }
      return cards;
    }

    case "frequency": {
      const [lo, hi] = source.rankRange;
      const cards: CardRef[] = [];
      for (let rank = lo; rank <= hi; rank += 1) {
        const word = FREQUENCY_ORDER[rank - 1];
        if (!word) break;
        const card = resolveWord(word, index);
        if (card) cards.push(card);
      }
      return cards;
    }

    case "phrases": {
      const matches = [...index.phrases.values()].filter((phrase) => {
        if (source.fns && !source.fns.includes(phrase.fn)) return false;
        if (source.rankRange) {
          const [lo, hi] = source.rankRange;
          if (phrase.rank < lo || phrase.rank > hi) return false;
        }
        return true;
      });
      matches.sort((a, b) => a.rank - b.rank);
      return matches.map((p) => ({ kind: "phrase", id: `phrase:${p.id}`, phraseId: p.id }));
    }

    case "cards":
      return source.ids
        .map(parseCardId)
        .filter((card): card is CardRef => card !== null);

    case "state": {
      if (!states) return [];
      const now = Date.now();
      // The dictionary's own pool: single words, in frequency order.
      const pool = [...index.lexemes.values()]
        .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
        .map((lex) => ({ kind: "lexeme" as const, id: `lex:${lex.id}`, lexemeId: lex.id }));

      return pool.filter((card) => {
        const state = states.get(card.id);
        const seen = state && state.lastReviewed !== null;

        switch (source.filter) {
          case "unseen":
            return !seen;
          case "due":
            return Boolean(seen && state!.due <= now);
          case "hard":
            // Three lapses, or an ease that has been dragged down far enough
            // that the card keeps coming back sooner than the rest.
            return Boolean(seen && (state!.lapses >= 3 || state!.ease < 1.8));
          case "known":
            return Boolean(seen && state!.lapses < 3 && state!.ease >= 1.8);
        }
      });
    }

    case "combined": {
      const seen = new Set<string>();
      const cards: CardRef[] = [];
      for (const deckId of source.deckIds) {
        const child = index.deckById.get(deckId);
        if (!child) continue;
        for (const card of expandDeck(child, index, states)) {
          if (seen.has(card.id)) continue;
          seen.add(card.id);
          cards.push(card);
        }
      }
      return cards;
    }
  }
}
