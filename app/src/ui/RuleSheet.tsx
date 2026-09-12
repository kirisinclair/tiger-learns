import type { GrammarRule } from "../domain/types";
import { useEscape } from "./useEscape";

interface Props {
  rule: GrammarRule;
  onClose: () => void;
}

/** One rendered cell, after identical neighbours have been folded together. */
interface Cell {
  text: string;
  colSpan: number;
  rowSpan: number;
}

/**
 * Collapses a plain grid into a merged one.
 *
 * Conjugation tables repeat themselves heavily — `usted` and `él` always share
 * an ending, and -er and -ir differ in only three cells out of nine. Printing
 * every duplicate makes the reader compare strings to notice they are the same.
 * Merging says it outright: one cell means one ending.
 *
 * Vertical merging joins consecutive rows whose values are identical, gluing
 * their labels together ("usted / él / ella"). Horizontal merging then spans
 * runs of equal values inside each row. The label column is never merged
 * sideways, only ever downwards.
 */
function mergeGrid(rows: string[][]): Cell[][] {
  if (rows.length === 0) return [];

  // Vertical pass: fold rows that carry the same values into one.
  const folded: Array<{ labels: string[]; values: string[] }> = [];
  for (const row of rows) {
    const [label, ...values] = row;
    const previous = folded[folded.length - 1];
    const sameAsPrevious =
      previous &&
      previous.values.length === values.length &&
      previous.values.every((value, i) => value === values[i]);

    if (sameAsPrevious) previous.labels.push(label);
    else folded.push({ labels: [label], values });
  }

  // Horizontal pass: span runs of equal values within a row.
  return folded.map(({ labels, values }) => {
    const cells: Cell[] = [{ text: labels.join(" / "), colSpan: 1, rowSpan: 1 }];
    for (let i = 0; i < values.length; i += 1) {
      if (i > 0 && values[i] === values[i - 1]) {
        cells[cells.length - 1].colSpan += 1;
      } else {
        cells.push({ text: values[i], colSpan: 1, rowSpan: 1 });
      }
    }
    return cells;
  });
}

/**
 * Merges header cells whose column is identical in every row, so a table where
 * -er and -ir never diverge shows a single "-er / -ir" heading.
 */
function mergeHead(head: string[], rows: string[][]): Cell[] {
  const cells: Cell[] = [{ text: head[0], colSpan: 1, rowSpan: 1 }];

  for (let column = 1; column < head.length; column += 1) {
    const identicalToPrevious =
      column > 1 && rows.length > 0 && rows.every((row) => row[column] === row[column - 1]);

    if (identicalToPrevious) {
      const last = cells[cells.length - 1];
      last.colSpan += 1;
      last.text = `${last.text} / ${head[column]}`;
    } else {
      cells.push({ text: head[column], colSpan: 1, rowSpan: 1 });
    }
  }

  return cells;
}

/** Modal with the full grammar explanation behind the practice screen link. */
export function RuleSheet({ rule, onClose }: Props) {
  useEscape(onClose);

  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={rule.title}
      onClick={onClose}
    >
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <h2>{rule.title}</h2>

        {rule.blocks.map((block, i) => {
          if (block.type === "text") {
            return <p key={i}>{block.text}</p>;
          }

          if (block.type === "table") {
            const head = mergeHead(block.head, block.rows);
            const body = mergeGrid(block.rows);
            return (
              <table key={i}>
                <thead>
                  <tr>
                    {head.map((cell, c) => (
                      <th key={c} colSpan={cell.colSpan}>
                        {cell.text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} colSpan={cell.colSpan}>
                          {c === 0 ? cell.text : <code>{cell.text}</code>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }

          return (
            <ul key={i} style={{ paddingLeft: "1.1rem" }}>
              {block.items.map((item, n) => (
                <li key={n} style={{ marginBottom: "0.4rem" }}>
                  <code>{item.es}</code>
                  <div style={{ color: "var(--color-text-soft)", fontSize: "0.875rem" }}>
                    {item.ru}
                  </div>
                </li>
              ))}
            </ul>
          );
        })}

        <button className="pill pill--accent" style={{ marginTop: "1.5rem" }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
