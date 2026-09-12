import type { LexemeEntry } from "../domain/types";

/**
 * Numbers.
 *
 * The point is the pattern, not the count. Once `treinta y uno` is understood,
 * `cuarenta y dos` and `noventa y nueve` are the same card wearing a different
 * hat — drilling all seventy of them spends the learner's attention on nothing.
 *
 * So only the forms that have to be memorised are cards: everything irregular,
 * every round ten and hundred, and two or three worked examples of each
 * pattern. The examples carry a note saying which range they cover, so the
 * generalisation is stated rather than left to be inferred.
 */

const ES_UNITS = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
];

/** 10-29 are irregular or written as one word in Spanish. */
const ES_SPECIAL: Record<number, string> = {
  10: "diez",
  11: "once",
  12: "doce",
  13: "trece",
  14: "catorce",
  15: "quince",
  16: "dieciséis",
  17: "diecisiete",
  18: "dieciocho",
  19: "diecinueve",
  20: "veinte",
  21: "veintiuno",
  22: "veintidós",
  23: "veintitrés",
  24: "veinticuatro",
  25: "veinticinco",
  26: "veintiséis",
  27: "veintisiete",
  28: "veintiocho",
  29: "veintinueve",
  100: "cien",
};

const ES_TENS: Record<number, string> = {
  30: "treinta",
  40: "cuarenta",
  50: "cincuenta",
  60: "sesenta",
  70: "setenta",
  80: "ochenta",
  90: "noventa",
};

export function spanishNumber(n: number): string {
  if (ES_SPECIAL[n]) return ES_SPECIAL[n];
  if (n < 10) return ES_UNITS[n];
  const tens = Math.floor(n / 10) * 10;
  const unit = n % 10;
  // From thirty upwards Spanish spells the parts out: "treinta y cuatro".
  return unit === 0 ? ES_TENS[tens] : `${ES_TENS[tens]} y ${ES_UNITS[unit]}`;
}

const RU_UNITS = [
  "",
  "один",
  "два",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять",
];

const RU_SPECIAL: Record<number, string> = {
  10: "десять",
  11: "одиннадцать",
  12: "двенадцать",
  13: "тринадцать",
  14: "четырнадцать",
  15: "пятнадцать",
  16: "шестнадцать",
  17: "семнадцать",
  18: "восемнадцать",
  19: "девятнадцать",
  100: "сто",
};

const RU_TENS: Record<number, string> = {
  20: "двадцать",
  30: "тридцать",
  40: "сорок",
  50: "пятьдесят",
  60: "шестьдесят",
  70: "семьдесят",
  80: "восемьдесят",
  90: "девяносто",
};

export function russianNumber(n: number): string {
  if (RU_SPECIAL[n]) return RU_SPECIAL[n];
  if (n < 10) return RU_UNITS[n];
  const tens = Math.floor(n / 10) * 10;
  const unit = n % 10;
  return unit === 0 ? RU_TENS[tens] : `${RU_TENS[tens]} ${RU_UNITS[unit]}`;
}

/** Which numbers earn a card of their own, and why. */
const CARDINAL_NOTES: Record<number, string> = {
  16: "С 16 по 19 числа пишутся одним словом: dieciséis, diecisiete, dieciocho, diecinueve — из «diez y seis».",
  21: "Так строятся все числа 21-29: одним словом, с приставкой veinti-. Veintidós, veintitrés, veintiséis пишутся с ударением.",
  22: "Так строятся все числа 21-29 — одним словом.",
  25: "Так строятся все числа 21-29 — одним словом.",
  31: "Так строятся все числа 31-99: десяток + y + единица, тремя словами. Cuarenta y dos, noventa y nueve — по тому же образцу.",
  45: "Так строятся все числа 31-99 — тремя словами через y.",
  99: "Так строятся все числа 31-99 — тремя словами через y.",
  100: "Ровно сто — cien. Но 101-199 начинаются с ciento: ciento uno, ciento veinte.",
};

/**
 * Cardinals worth a card: everything up to twenty, worked examples of the two
 * joining patterns, and every round ten.
 */
const CARDINALS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 25,
  30, 40, 50, 60, 70, 80, 90, 100,
  31, 45, 99,
];

export const NUMBER_LEXEMES: LexemeEntry[] = CARDINALS.map((n) => ({
  id: `num.${n}`,
  es: spanishNumber(n),
  ru: [russianNumber(n), String(n)],
  pos: "numeral",
  rank: null,
  cefr: "A1",
  topics: ["numbers"],
  ...(CARDINAL_NOTES[n] ? { note: CARDINAL_NOTES[n] } : {}),
}));

/* -------------------------------------------------------------------------- */
/* Hundreds, thousands and long numbers                                       */
/* -------------------------------------------------------------------------- */

/** [spanish, russian, note?] */
type BigRow = [es: string, ru: string, note?: string];

const BIG_NUMBERS: BigRow[] = [
  ["cien", "сто", "Ровно 100. Перед существительным тоже cien: cien pesos."],
  ["ciento uno", "сто один", "От 101 и выше — ciento, а не cien. Никакого y между сотнями и десятками: ciento veinte, а не «ciento y veinte»."],
  ["doscientos", "двести"],
  ["trescientos", "триста"],
  ["cuatrocientos", "четыреста"],
  ["quinientos", "пятьсот", "Исключение: не «cincocientos». Запомнить вместе с setecientos и novecientos."],
  ["seiscientos", "шестьсот"],
  ["setecientos", "семьсот", "Исключение: не «sietecientos»."],
  ["ochocientos", "восемьсот"],
  ["novecientos", "девятьсот", "Исключение: не «nuevecientos»."],
  ["doscientas personas", "двести человек", "Сотни согласуются в роде: doscientas personas, но doscientos pesos."],
  ["mil", "тысяча", "Просто mil, без un. «Un mil» — ошибка. И mil не меняется: dos mil, tres mil."],
  ["dos mil", "две тысячи"],
  ["diez mil", "десять тысяч"],
  ["cien mil", "сто тысяч"],
  ["un millón", "один миллион", "А вот миллион — с un. И требует de перед существительным: un millón de pesos."],
  ["mil novecientos noventa y cinco", "тысяча девятьсот девяносто пять (1995)", "Годы читаются как обычные числа целиком, без «сотен»: 1995 — mil novecientos noventa y cinco."],
  ["dos mil cuarenta y cinco", "две тысячи сорок пять (2045)"],
  ["dos mil veinticuatro", "две тысячи двадцать четыре (2024)"],
  [
    "ciento un mil doscientos treinta y cuatro",
    "сто одна тысяча двести тридцать четыре (101 234)",
    "Читается блоками: сотни-тысячи, затем сотни-десятки-единицы. Перед mil стоит un, а не uno.",
  ],
  ["tres coma cinco", "три и пять десятых (3,5)", "Дробная часть отделяется запятой и читается как coma. Разряды, наоборот, разделяются точкой: 1.500."],
  ["el veinte por ciento", "двадцать процентов", "С процентами обязателен артикль: el veinte por ciento."],
  ["la mitad", "половина"],
  ["un tercio", "треть"],
  ["un cuarto", "четверть"],
  ["una docena", "дюжина"],
  ["un par de", "пара (чего-то)"],
  ["unos veinte", "около двадцати", "unos перед числом означает «примерно»: unos veinte años — лет двадцать."],
];

export const BIG_NUMBER_LEXEMES: LexemeEntry[] = BIG_NUMBERS.map(([es, ru, note]) => ({
  id: `bignum.${es.replace(/\s+/g, "_")}`,
  es,
  ru: [ru],
  pos: "numeral",
  rank: null,
  cefr: "A2",
  // One topic for everything numeric: cardinals, ordinals and big numbers are
  // the same subject, and splitting them only hid two thirds of it.
  topics: ["numbers"],
  ...(note ? { note } : {}),
}));

/* -------------------------------------------------------------------------- */
/* Ordinals                                                                   */
/* -------------------------------------------------------------------------- */

const ORDINALS: BigRow[] = [
  ["primero", "первый", "Перед существительным мужского рода теряет -o: el primer día, но el primero de mayo."],
  ["segundo", "второй"],
  ["tercero", "третий", "Тоже укорачивается: el tercer piso."],
  ["cuarto", "комнатка"],
  ["quinto", "пятый"],
  ["sexto", "шестой"],
  ["séptimo", "седьмой"],
  ["octavo", "восьмой"],
  ["noveno", "девятый"],
  ["décimo", "десятый", "До десятого порядковые используются постоянно. Дальше — почти никогда."],
  ["undécimo", "одиннадцатый", "В живой речи после десятого берут обычное число: el piso once, а не «el undécimo piso». Форму стоит узнавать, но говорить проще числом."],
  ["duodécimo", "двенадцатый"],
  ["vigésimo", "двадцатый"],
  ["vigésimo quinto", "двадцать пятый", "Так строятся все составные: десяток + единица, двумя словами."],
  ["centésimo", "сотый"],
  ["la primera vez", "первый раз", "В женском роде -a: la primera vez, la segunda calle."],
  ["el primer día", "первый день"],
  ["el tercer piso", "третий этаж"],
];

export const ORDINAL_LEXEMES: LexemeEntry[] = ORDINALS.map(([es, ru, note]) => ({
  id: `ord.${es.replace(/\s+/g, "_")}`,
  es,
  ru: [ru],
  pos: "numeral",
  rank: null,
  cefr: "A2",
  topics: ["numbers"],
  ...(note ? { note } : {}),
}));
