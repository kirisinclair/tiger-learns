import { PRONOUN_FULL } from "../domain/conjugation";
import type { DeckVerb } from "../domain/deckVerbs";
import { useEscape } from "./useEscape";

interface Props {
  title: string;
  verbs: DeckVerb[];
  onClose: () => void;
}

const TENSE_TITLE: Record<string, string> = {
  present: "настоящее время",
  preterite: "прошедшее время",
  imperfect: "imperfecto",
  future: "будущее время",
  conditional: "condicional",
};

/**
 * Everything the section drills, in one list.
 *
 * Without it a conjugation deck is opaque: it can be practised but never
 * surveyed, and there is no way to answer "what am I actually learning here"
 * short of grinding through it.
 */
export function VerbSheet({ title, verbs, onClose }: Props) {
  useEscape(onClose);

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <h2>
          {title}
          {/* A count belongs to a list, not to a single card. */}
          {verbs.length > 1 && <span className="sheet__count"> — {verbs.length}</span>}
        </h2>

        {verbs.map(({ verb, tense, table }) => (
          <section className="verb-card" key={`${verb.id}:${tense}`}>
            <header className="verb-card__head">
              <span className="verb-card__es">{verb.infinitive}</span>
              <span className="verb-card__ru">{verb.ru.join(", ")}</span>
              <span className="verb-card__tense">{TENSE_TITLE[tense] ?? tense}</span>
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

        <button className="pill pill--accent" style={{ marginTop: "1.5rem" }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
