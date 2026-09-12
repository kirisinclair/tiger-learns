/**
 * Answer checking.
 *
 * Typing Spanish accents on a Russian keyboard layout is awkward, so an answer
 * that is right apart from its accents counts as correct — the properly
 * accented form is then shown as the reference. Leading subject pronouns and
 * surrounding punctuation are ignored too.
 */

const SUBJECT_PRONOUNS = [
  "yo",
  "tú",
  "tu",
  "él",
  "el",
  "ella",
  "usted",
  "nosotros",
  "nosotras",
  "vosotros",
  "vosotras",
  "ellos",
  "ellas",
  "ustedes",
];

const PUNCTUATION = new Set([
  "¿",
  "?",
  "¡",
  "!",
  ".",
  ",",
  ";",
  ":",
  '"',
  "'",
  "«",
  "»",
  "(",
  ")",
  "-",
]);

/**
 * Lowercase, drop punctuation, collapse whitespace. Keeps Spanish accents and ñ.
 *
 * "ё" is folded onto "е" here rather than in the loose pass, because the two
 * are not a mistake to be forgiven — Russian itself writes them
 * interchangeably, and most keyboards and most printed text use "е" for both.
 * Marking "ребенок" as anything short of simply right would teach a rule that
 * does not exist.
 */
export function normalize(input: string): string {
  let out = "";
  for (const char of input.toLowerCase()) {
    out += PUNCTUATION.has(char) ? " " : char === "ё" ? "е" : char;
  }
  return out.split(/\s+/).filter(Boolean).join(" ");
}

/**
 * Same as `normalize`, but folds every Spanish-specific letter onto its plain
 * ASCII counterpart, `ñ` included. A Russian keyboard layout cannot type any of
 * them, so "manana" is accepted for "mañana" and "esta" for "está"; the
 * correctly written form is always shown afterwards as the reference.
 */
const ACCENT_FOLD: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
};

export function normalizeLoose(input: string): string {
  let out = "";
  for (const char of normalize(input)) {
    out += ACCENT_FOLD[char] ?? char;
  }
  return out;
}

/**
 * Drops a parenthesised aside from an expected answer.
 *
 * Several translations carry a note that tells two words apart — "твой
 * (самостоятельно)" is `tuyo` as opposed to `tu`, "рука (кисть)" is `mano`
 * as opposed to `brazo`. The note is there to be read, not typed: it
 * explains which sense is meant, and demanding it back makes the right
 * answer look wrong. So the aside is accepted either way, present or not.
 *
 * Applied to the expected answers before normalising, since normalising
 * turns the brackets into spaces and there is nothing left to strip.
 */
export function withoutAside(value: string): string {
  return value.replace(/\([^)]*\)/g, " ");
}

/** Strips a leading subject pronoun: "yo hablo" and "hablo" are both accepted. */
export function stripSubject(input: string): string {
  const parts = normalize(input).split(" ");
  if (parts.length > 1 && SUBJECT_PRONOUNS.includes(parts[0])) {
    return parts.slice(1).join(" ");
  }
  return parts.join(" ");
}

export type AnswerVerdict = "correct" | "correctButAccents" | "wrongCase" | "wrong";

/**
 * Words where capitalisation carries meaning rather than style.
 *
 * Russian writes the polite address as «Вы» and the plain plural as «вы». In
 * this app that single letter is the only thing separating `usted`/`ustedes`
 * from `vosotros`, so it has to be graded. Everything else stays
 * case-insensitive: nobody should be marked wrong for typing "он".
 */
const CASE_SIGNIFICANT = new Set(["вы"]);

/**
 * Checks a pronoun answer against the persons a Spanish form allows.
 *
 * Either language is accepted: "Вы" and "usted" are both right for `habla`.
 * The Spanish side ignores capitalisation and accents, so "el", "él" and "Él"
 * all pass. The Russian side ignores capitalisation too, except on «вы», where
 * it is the only thing distinguishing `vosotros` from the polite `usted` —
 * there a case slip returns `wrongCase` so the UI can explain the difference.
 */
export function checkPronoun(
  input: string,
  acceptedRu: string[],
  acceptedEs: string[] = [],
): AnswerVerdict {
  const given = normalize(input);
  if (!given) return "wrong";

  const loose = normalizeLoose(given);
  if (acceptedEs.some((option) => normalizeLoose(option) === loose)) return "correct";

  // `normalize` lowercases, so the original text is needed to judge the case.
  const givenRaw = input.trim();

  if (CASE_SIGNIFICANT.has(given)) {
    // Asides are dropped here too, so the case check never turns into a
    // spelling check for a note that was only ever meant to be read.
    const plain = acceptedRu.map((option) => withoutAside(option).trim());
    if (plain.some((option) => option === givenRaw)) return "correct";
    return plain.some((option) => option.toLowerCase() === given) ? "wrongCase" : "wrong";
  }

  return acceptedRu.some(
    (option) => normalize(option) === given || normalize(withoutAside(option)) === given,
  )
    ? "correct"
    : "wrong";
}

/**
 * Checks a typed answer against the accepted forms.
 * `allowMissingSubject` applies to conjugation drills, where the pronoun is
 * already printed next to the input box.
 */
export function checkAnswer(
  input: string,
  accepted: string[],
  options: { allowMissingSubject?: boolean } = {},
): AnswerVerdict {
  const prepare = (value: string) =>
    options.allowMissingSubject ? stripSubject(value) : normalize(value);

  const given = prepare(input);
  if (!given) return "wrong";

  const variants = accepted.flatMap((a) => [a, withoutAside(a)]);

  if (variants.some((a) => prepare(a) === given)) return "correct";

  const loose = normalizeLoose(given);
  return variants.some((a) => normalizeLoose(prepare(a)) === loose)
    ? "correctButAccents"
    : "wrong";
}
