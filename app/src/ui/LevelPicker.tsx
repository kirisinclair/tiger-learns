import { useMemo, useState } from "react";
import { CONTENT } from "../content";
import { MNEMONICS } from "../content/mnemonics";
import { expandDeckIncludingRetired } from "../domain/cards";
import { deckProgress, maturity, type CardState, type Maturity } from "../domain/srs";
import type { Deck } from "../domain/types";

interface Props {
  deck: Deck;
  cards: Map<string, CardState>;
  /** `intro` shows the word cards first; `review` goes straight to exercises. */
  onStart: (cardIds: string[], mode: "intro" | "review") => void;
  /** Switches a card off, or back on. */
  onRetire: (cardId: string, retired: boolean) => void;
  onExit: () => void;
}

/**
 * How far one card has got, as four states.
 *
 * The same four the progress screen uses, and they come from the schedule
 * rather than from a counter: a card is "known" because it is coming back in
 * three weeks, which it can only do by having been answered right repeatedly.
 * One wrong answer collapses the interval, so the state cannot be faked by
 * grinding.
 */
const STATE_LABEL: Record<Maturity | "retired", string> = {
  new: "не начато",
  learning: "учится",
  young: "держится",
  mature: "знаю уверенно",
  retired: "выключено",
};

function stateOf(card: CardState | undefined): Maturity {
  return card ? maturity(card) : "new";
}

/** "через 5 дней", for the tooltip on a card that is waiting. */
function dueIn(card: CardState | undefined): string {
  if (!card || card.lastReviewed === null) return "";
  const days = Math.round((card.due - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return " · к повторению сегодня";
  if (days === 1) return " · завтра";
  return ` · через ${days} ${days < 5 ? "дня" : "дней"}`;
}

/** One row of the list, whether it came from a verb or a plain word. */
interface Item {
  cardId: string;
  es: string;
  ru: string;
  mnemonic?: string;
}

/**
 * Level list for a deck too large to swallow whole.
 *
 * Words are cut into fixed batches, in the deck's own order, which for verbs is
 * frequency order — so level 1 is the ten most useful verbs rather than ten
 * arbitrary ones. Levels are stable: a word never moves between them, which is
 * what makes "I finished level 3" mean anything.
 *
 * The checkboxes exist for the other way of working: skim the list, tick the
 * handful that refuse to stick, and drill exactly those.
 */
export function LevelPicker({ deck, cards, onStart, onRetire, onExit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const items: Item[] = useMemo(() => {
    return expandDeckIncludingRetired(deck, CONTENT, cards)
      .map((card): Item | null => {
        if (card.kind === "verbMeaning") {
          const verb = CONTENT.verbs.get(card.verbId);
          if (!verb) return null;
          return {
            cardId: card.id,
            es: verb.infinitive,
            ru: verb.ru.join(", "),
            mnemonic: MNEMONICS[verb.id],
          };
        }
        if (card.kind === "lexeme") {
          const lex = CONTENT.lexemes.get(card.lexemeId);
          if (!lex) return null;
          return { cardId: card.id, es: lex.es, ru: lex.ru.join(", ") };
        }
        if (card.kind === "phrase") {
          const phrase = CONTENT.phrases.get(card.phraseId);
          if (!phrase) return null;
          return {
            cardId: card.id,
            es: phrase.es,
            ru: phrase.ru,
            // The literal gloss is the phrase equivalent of a mnemonic: it is
            // what makes a non-word-for-word expression stop looking arbitrary.
            mnemonic: phrase.literal ? `Дословно: ${phrase.literal}` : undefined,
          };
        }
        return null;
      })
      .filter((item): item is Item => item !== null);
    // `cards` is read once to build state-based decks; the list does not need
    // to rebuild itself while the learner is looking at it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck]);

  const size = deck.levelSize ?? 10;
  const levels = useMemo(() => {
    const groups: Item[][] = [];
    for (let start = 0; start < items.length; start += size) {
      groups.push(items.slice(start, start + size));
    }
    return groups;
  }, [items, size]);

  /** Ids a drill should actually use: everything still switched on. */
  const live = (list: Item[]) =>
    list.filter((item) => !cards.get(item.cardId)?.retired).map((item) => item.cardId);

  /** Progress across the whole deck, for the pair of buttons at the top. */
  const allProgress = deckProgress(live(items), cards, Date.now());

  const toggle = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="levels">
      {/* One row: back, name, actions. The name matters — arriving here from
          four different tabs makes it easy to lose track of which topic this
          is — but it does not need a line of its own. */}
      <div className="levels__top">
        <button className="levels__back" onClick={onExit} aria-label="Назад" title="Назад">
          ←
        </button>
        <h1 className="levels__title">{deck.title}</h1>
        {/* Grouped so that on a narrow screen the buttons move to a line of
            their own together, rather than each finding its own place. */}
        <div className="levels__actions">
        <button
          className="pill pill--accent levels__action"
          onClick={() => onStart(live(items), "intro")}
        >
          Учить все
        </button>
        {/* Same pair as on every level, for the whole deck at once: meeting the
            words and drilling what has already been met are different jobs, and
            one button could only ever do one of them. Hidden until there is
            something to revise, exactly as inside a level. */}
        {allProgress.seen > 0 && (
          <button
            className="pill pill--outline levels__action"
            onClick={() => onStart(live(items), "review")}
          >
            Повторять все
          </button>
        )}
        {selected.size > 0 && (
          <button
            className="pill pill--accent levels__action"
            onClick={() => onStart([...selected], "intro")}
          >
            Учить отмеченные ({selected.size})
          </button>
        )}
        </div>
      </div>

      {levels.map((level, index) => {
        const ids = live(level);
        // Counted over every word in the level, switched-off ones included:
        // they are known, and dropping them from both halves of the fraction
        // would make "знаю 8 из 8" appear the moment the rest were switched off.
        const all = level.map((item) => item.cardId);
        /*
         * Counted by state, not by "has been answered once".
         *
         * The old line read "8 / 10 · пройден" and meant that eight cards had
         * been touched — a level every word of which was seen once and
         * forgotten immediately still called itself finished. What is worth
         * knowing is how many have actually stuck.
         */
        const states = ids.map((id) => stateOf(cards.get(id)));
        const count = (state: Maturity) => states.filter((s) => s === state).length;
        const retired = all.filter((id) => cards.get(id)?.retired).length;
        const settled = count("mature");
        const holding = count("young");
        const learning = count("learning");
        const known = settled + retired;
        const width = (n: number) => (all.length ? `${(n / all.length) * 100}%` : "0%");

        return (
          <section className="level" key={index}>
            <header className="level__header">
              <h2 className="level__title">
                Уровень {index + 1}
                <span className="level__count">
                  знаю {known} из {all.length}
                  {retired > 0 ? ` (${retired} выключено)` : ""}
                </span>
              </h2>
              <div className="level__actions">
                <button
                  className="pill pill--accent level__button"
                  onClick={() => onStart(ids, "intro")}
                >
                  Учить
                </button>
                {states.some((s) => s !== "new") && (
                  <button
                    className="pill pill--outline level__button"
                    onClick={() => onStart(ids, "review")}
                  >
                    Повторять
                  </button>
                )}
              </div>
            </header>

            {all.length > 0 && (
              <div
                className="bucket-bar level__bar"
                role="img"
                aria-label={`знаю ${known} из ${all.length}`}
              >
                <span className="bucket-bar__retired" style={{ width: width(retired) }} />
                <span className="bucket-bar__mature" style={{ width: width(settled) }} />
                <span className="bucket-bar__young" style={{ width: width(holding) }} />
                <span className="bucket-bar__learning" style={{ width: width(learning) }} />
              </div>
            )}

            <ul className="level__words">
              {level.map((item) => (
                <li
                  className={`level__word${
                    cards.get(item.cardId)?.retired ? " level__word--retired" : ""
                  }`}
                  key={item.cardId}
                >
                  {/* Which word is dragging: a level bar cannot say. */}
                  <span
                    className={`level__state level__state--${
                      cards.get(item.cardId)?.retired ? "retired" : stateOf(cards.get(item.cardId))
                    }`}
                    title={
                      cards.get(item.cardId)?.retired
                        ? STATE_LABEL.retired
                        : STATE_LABEL[stateOf(cards.get(item.cardId))] + dueIn(cards.get(item.cardId))
                    }
                  />
                  <label className="level__check">
                    <input
                      type="checkbox"
                      checked={selected.has(item.cardId)}
                      onChange={() => toggle(item.cardId)}
                      disabled={Boolean(cards.get(item.cardId)?.retired)}
                    />
                    <span className="level__es">{item.es}</span>
                    <span className="level__ru">{item.ru}</span>
                  </label>
                  {/* The switch. Reversible from the same place it was thrown,
                      which is the only thing that makes it safe to tap. */}
                  <button
                    className="level__retire"
                    aria-pressed={Boolean(cards.get(item.cardId)?.retired)}
                    onClick={() =>
                      onRetire(item.cardId, !cards.get(item.cardId)?.retired)
                    }
                    title={
                      cards.get(item.cardId)?.retired
                        ? "Вернуть в тренировки и в аудио"
                        : "Знаю — больше не показывать нигде"
                    }
                  >
                    ✓
                  </button>
                  {item.mnemonic && <p className="level__mnemonic">{item.mnemonic}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
