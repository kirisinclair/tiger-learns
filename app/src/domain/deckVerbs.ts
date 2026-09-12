import type { ContentIndex } from "../content";
import { expandDeck } from "./cards";
import { conjugationTable } from "./conjugation";
import type { Deck, Person, Tense, VerbEntry } from "./types";

/**
 * The verbs a conjugation deck drills, each with its full table.
 *
 * A conjugation deck is stored as one card per verb *and person*, which is the
 * right unit for scheduling but the wrong one for looking at: the learner
 * wants to see `tener` once with all its forms, not seven unrelated rows. This
 * regroups the cards back into verbs and hands over the table, so the same data
 * can be listed, learned from, and drilled.
 */
export interface DeckVerb {
  verb: VerbEntry;
  tense: Tense;
  table: Array<{ person: Person; form: string }>;
  /** Every card id belonging to this verb, for scoping a session to it. */
  cardIds: string[];
}

export function deckVerbs(deck: Deck, index: ContentIndex): DeckVerb[] {
  const byVerb = new Map<string, { verb: VerbEntry; tense: Tense; cardIds: string[] }>();

  for (const card of expandDeck(deck, index)) {
    if (card.kind !== "conjugation") continue;
    const verb = index.verbs.get(card.verbId);
    if (!verb) continue;

    // Keyed by verb and tense: a deck may drill both, and the tables differ.
    const key = `${card.verbId}:${card.tense}`;
    const entry = byVerb.get(key);
    if (entry) entry.cardIds.push(card.id);
    else byVerb.set(key, { verb, tense: card.tense, cardIds: [card.id] });
  }

  return [...byVerb.values()].map(({ verb, tense, cardIds }) => ({
    verb,
    tense,
    table: conjugationTable(verb, tense),
    cardIds,
  }));
}

/** True when the deck is about conjugating rather than about meanings. */
export function isConjugationDeck(deck: Deck): boolean {
  return deck.source.kind === "conjugation";
}
