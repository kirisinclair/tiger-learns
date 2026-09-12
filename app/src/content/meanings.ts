/**
 * Splits an authored translation string into separate meanings.
 *
 * Translations are written as one readable line — "проходить, случаться" — but
 * every listed meaning has to count as a correct answer on its own. Splitting
 * happens on commas, semicolons and slashes, which is all the punctuation the
 * content actually uses for this purpose.
 *
 * Text in brackets is a qualifier rather than a separate meaning, so commas
 * inside brackets are left alone: "сколько (женский род, мн. ч.)" stays whole.
 */
export function splitMeanings(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (depth === 0 && (char === "," || char === ";" || char === "/")) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);

  const meanings = parts.map((part) => part.trim()).filter(Boolean);
  return meanings.length > 0 ? meanings : [text.trim()];
}
