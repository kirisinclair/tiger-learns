import { useMemo, useState } from "react";
import { CONTENT } from "../content";
import { PRONOUN_FULL } from "../domain/conjugation";
import { deckVerbs } from "../domain/deckVerbs";
import { deckProgress, type CardState } from "../domain/srs";
import type { Deck } from "../domain/types";

interface Props {
  deck: Deck;
  cards: Map<string, CardState>;
  /** `intro` shows the conjugation cards first; `review` drills straight away. */
  onStart: (cardIds: string[], mode: "intro" | "review") => void;
  onExit: () => void;
}

/**
 * Entry screen for a conjugation section.
 *
 * Previously such a deck dropped straight into questions, which meant the forms
 * had to be guessed before they had ever been shown, and there was no way to
 * see what the section even contained. Three doors instead: look at the list,
 * learn from the tables, or drill what is already known.
 */
export function VerbBrowser({ deck, cards, onStart, onExit }: Props) {
  const verbs = useMemo(() => deckVerbs(deck, CONTENT), [deck]);
  const [showList, setShowList] = useState(false);

  const allIds = verbs.flatMap((v) => v.cardIds);
  const progress = deckProgress(allIds, cards, Date.now());
  const started = progress.seen > 0;

  return (
    <div className="levels">
      <div className="levels__top">
        <button className="levels__back" onClick={onExit} aria-label="Назад" title="Назад">
          ←
        </button>
        <h1 className="levels__title">{deck.title}</h1>
      </div>

      <div className="verb-browser__actions">
        <button className="pill pill--outline" onClick={() => setShowList((open) => !open)}>
          {showList ? "Скрыть список" : `Список глаголов (${verbs.length})`}
        </button>
        <button className="pill pill--accent" onClick={() => onStart(allIds, "intro")}>
          Учить
        </button>
        {started && (
          <button className="pill pill--outline" onClick={() => onStart(allIds, "review")}>
            Повторять
          </button>
        )}
      </div>

      <p className="verb-browser__hint">
        «Учить» показывает карточку каждого глагола со всеми формами, а потом
        переходит к упражнениям. «Повторять» — сразу упражнения.
      </p>

      {showList &&
        verbs.map(({ verb, tense, table, cardIds }) => (
          <section className="verb-card verb-card--standalone" key={`${verb.id}:${tense}`}>
            <header className="verb-card__head">
              <span className="verb-card__es">{verb.infinitive}</span>
              <span className="verb-card__ru">{verb.ru.join(", ")}</span>
              <button
                className="verb-card__drill"
                onClick={() => onStart(cardIds, "intro")}
                title="Учить только этот глагол"
              >
                учить
              </button>
            </header>
            <table className="verb-card__table">
              <tbody>
                {table.map(({ person, form }) => (
                  <tr key={person}>
                    <td>{PRONOUN_FULL[person]}</td>
                    <td>
                      <code>{form}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
    </div>
  );
}
