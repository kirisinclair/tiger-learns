import type { ContentIndex } from "../content";
import { expandDeck } from "./cards";
import { maturity, type CardState } from "./srs";
import type { Deck } from "./types";

/** One thing to be said aloud: the Spanish, then its Russian. */
export interface AudioItem {
  cardId: string;
  es: string;
  ru: string;
}

/**
 * Which decks can be listened to.
 *
 * Conjugation is left out on purpose. A drill that reads "hablo — я говорю"
 * through seven persons and a dozen tenses is thousands of near-identical
 * items, and hearing them go by teaches nothing: the whole difficulty of a
 * paradigm is producing the right ending, which listening never asks for.
 * Words and phrases are the opposite — hearing them is most of knowing them.
 */
export function isListenable(deck: Deck): boolean {
  return deck.track !== "grammar";
}

/**
 * The listening order: what is due, then what is being learned, then what is new.
 *
 * The same priority the practice session uses, for the same reason — a walk
 * spent on cards that are about to slip is worth more than one spent on cards
 * that are solid. Within each group the order is shuffled, so a second session
 * on the same deck is not the same recording.
 */
export function audioQueue(
  deck: Deck,
  index: ContentIndex,
  cards: Map<string, CardState>,
  now: number,
): AudioItem[] {
  const due: AudioItem[] = [];
  const learning: AudioItem[] = [];
  const fresh: AudioItem[] = [];

  for (const card of expandDeck(deck, index, cards)) {
    const item = toItem(card, index);
    if (!item) continue;

    const state = cards.get(card.id);
    if (!state || state.lastReviewed === null) fresh.push(item);
    else if (state.due <= now || maturity(state) === "learning") due.push(item);
    else learning.push(item);
  }

  return [...shuffle(due), ...shuffle(learning), ...shuffle(fresh)];
}

/**
 * The two lines of one card.
 *
 * Only the first Russian meaning is read. A card whose translation is "ребёнок,
 * мальчик" would otherwise be a list read aloud, and by the third synonym the
 * pause for recall is long gone.
 */
function toItem(
  card: { kind: string; id: string } & Record<string, unknown>,
  index: ContentIndex,
): AudioItem | null {
  switch (card.kind) {
    case "lexeme": {
      const lex = index.lexemes.get(card.lexemeId as string);
      return lex ? { cardId: card.id, es: lex.es, ru: lex.ru[0] } : null;
    }
    case "verbMeaning": {
      const verb = index.verbs.get(card.verbId as string);
      return verb ? { cardId: card.id, es: verb.infinitive, ru: verb.ru[0] } : null;
    }
    case "phrase": {
      const phrase = index.phrases.get(card.phraseId as string);
      return phrase ? { cardId: card.id, es: phrase.es, ru: phrase.ru } : null;
    }
    default:
      return null;
  }
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
