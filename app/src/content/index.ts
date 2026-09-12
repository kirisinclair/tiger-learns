import type {
  Deck,
  GrammarRule,
  LexemeEntry,
  PhraseEntry,
  SentenceFrame,
  VerbEntry,
} from "../domain/types";
import { FRAMES_BY_VERB } from "./sentences";
import { DECKS } from "./decks";
import { ALL_LEXEMES } from "./lexemes";
import { PERIPHRASES, PHRASES } from "./phrases";
import { RULES } from "./rules";
import { VERB_COMPLEMENTS } from "./verbComplements";
import { ALL_VERBS } from "./verbs";

/** Everything the app knows, indexed for lookup by id. */
export interface ContentIndex {
  lexemes: Map<string, LexemeEntry>;
  verbs: Map<string, VerbEntry>;
  phrases: Map<string, PhraseEntry>;
  /** Sentence frames for conjugation drills, grouped by verb. */
  framesByVerb: Map<string, SentenceFrame[]>;
  rules: Map<string, GrammarRule>;
  decks: Deck[];
  deckById: Map<string, Deck>;
}

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    if (import.meta.env.DEV && map.has(item.id)) {
      // A duplicate id would silently merge two cards into one SRS entry.
      console.warn(`Duplicate content id: ${item.id}`);
    }
    map.set(item.id, item);
  }
  return map;
}

/** Complements live in their own file so verb data stays readable. */
const VERBS_WITH_COMPLEMENTS: VerbEntry[] = ALL_VERBS.map((verb) => {
  const complement = VERB_COMPLEMENTS[verb.id];
  return complement ? { ...verb, complement } : verb;
});

export const CONTENT: ContentIndex = {
  lexemes: byId(ALL_LEXEMES),
  verbs: byId(VERBS_WITH_COMPLEMENTS),
  // The verb constructions live in the same pool but in their own rank band,
  // so the numbered parts never pick them up and their own deck can.
  phrases: byId([...PHRASES, ...PERIPHRASES]),
  framesByVerb: FRAMES_BY_VERB,
  rules: byId(RULES),
  decks: DECKS,
  deckById: byId(DECKS),
};

/** Tracks in the order the level rail lists them. */
export const TRACKS = [
  { id: "grammar", title: "Grammar" },
  { id: "vocabulary", title: "Vocabulary" },
] as const;

export const LEVELS = ["A1", "A2"] as const;
