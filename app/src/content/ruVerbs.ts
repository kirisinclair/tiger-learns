import type { RuVerbSource } from "../domain/types";

/**
 * Russian verbs a sentence frame can borrow instead of the drilled verb's own
 * dictionary translation.
 *
 * Spanish reuses one verb where Russian changes it to suit the object. `hacer`
 * covers homework, dinner, questions, noise and a suitcase; Russian needs
 * "делать", "готовить", "задавать", "шуметь" and "собирать" for exactly those
 * five. Building the cue from a single translation produced sentences no one
 * says — "Я делаю вопросы", "Он даёт круг" — so a frame names the verb its own
 * object calls for and the cue is built from that instead.
 *
 * Forms are written out rather than generated: these are precisely the verbs
 * where the regular pattern fails (задаю, not "задавáю"; готовлю, not
 * "готовю"), which is why they are here in the first place.
 */

/** Compact authoring form: the six Russian slots in a fixed order. */
type Six = [string, string, string, string, string, string];

function verb(ru: string, present: Six, pastStem: string, past?: Six): RuVerbSource {
  const [yo, tu, el, nosotros, vosotros, ellos] = present;
  const source: RuVerbSource = {
    ru: [ru],
    ruPresent: { yo, tu, el, nosotros, vosotros, ellos },
    ruPastStem: pastStem,
  };
  if (past) {
    const [a, b, c, d, e, f] = past;
    source.ruPast = { yo: a, tu: b, el: c, nosotros: d, vosotros: e, ellos: f };
  }
  return source;
}

export const RU_VERB_ALIASES: Record<string, RuVerbSource> = {
  // Movement: Russian splits "go" by whether wheels are involved.
  ехать: verb("ехать", ["еду", "едешь", "едет", "едем", "едете", "едут"], "еха"),
  приезжать: verb(
    "приезжать",
    ["приезжаю", "приезжаешь", "приезжает", "приезжаем", "приезжаете", "приезжают"],
    "приезжа",
  ),
  гулять: verb("гулять", ["гуляю", "гуляешь", "гуляет", "гуляем", "гуляете", "гуляют"], "гуля"),

  // Perception and knowledge.
  смотреть: verb(
    "смотреть",
    ["смотрю", "смотришь", "смотрит", "смотрим", "смотрите", "смотрят"],
    "смотре",
  ),
  уметь: verb("уметь", ["умею", "умеешь", "умеет", "умеем", "умеете", "умеют"], "уме"),

  // `hacer` in its many Russian guises.
  готовить: verb(
    "готовить",
    ["готовлю", "готовишь", "готовит", "готовим", "готовите", "готовят"],
    "готови",
  ),
  задавать: verb(
    "задавать",
    ["задаю", "задаёшь", "задаёт", "задаём", "задаёте", "задают"],
    "задава",
  ),
  шуметь: verb("шуметь", ["шумлю", "шумишь", "шумит", "шумим", "шумите", "шумят"], "шуме"),
  строить: verb("строить", ["строю", "строишь", "строит", "строим", "строите", "строят"], "строи"),
  собирать: verb(
    "собирать",
    ["собираю", "собираешь", "собирает", "собираем", "собираете", "собирают"],
    "собира",
  ),
  рисовать: verb(
    "рисовать",
    ["рисую", "рисуешь", "рисует", "рисуем", "рисуете", "рисуют"],
    "рисова",
  ),
  заниматься: verb(
    "заниматься",
    ["занимаюсь", "занимаешься", "занимается", "занимаемся", "занимаетесь", "занимаются"],
    "занима",
    ["занимался(ась)", "занимался(ась)", "занимался", "занимались", "занимались", "занимались"],
  ),
  обращать: verb(
    "обращать",
    ["обращаю", "обращаешь", "обращает", "обращаем", "обращаете", "обращают"],
    "обраща",
  ),

  // `poner`: Russian chooses by what goes where.
  ставить: verb(
    "ставить",
    ["ставлю", "ставишь", "ставит", "ставим", "ставите", "ставят"],
    "стави",
  ),
  вешать: verb("вешать", ["вешаю", "вешаешь", "вешает", "вешаем", "вешаете", "вешают"], "веша"),
  включать: verb(
    "включать",
    ["включаю", "включаешь", "включает", "включаем", "включаете", "включают"],
    "включа",
  ),
  накрывать: verb(
    "накрывать",
    ["накрываю", "накрываешь", "накрывает", "накрываем", "накрываете", "накрывают"],
    "накрыва",
  ),
  находить: verb(
    "находить",
    ["нахожу", "находишь", "находит", "находим", "находите", "находят"],
    "находи",
  ),

  // `dar` and `decir`: giving and saying both split by object.
  дарить: verb("дарить", ["дарю", "даришь", "дарит", "дарим", "дарите", "дарят"], "дари"),
  благодарить: verb(
    "благодарить",
    ["благодарю", "благодаришь", "благодарит", "благодарим", "благодарите", "благодарят"],
    "благодари",
  ),
  преподавать: verb(
    "преподавать",
    ["преподаю", "преподаёшь", "преподаёт", "преподаём", "преподаёте", "преподают"],
    "преподава",
  ),
  создавать: verb(
    "создавать",
    ["создаю", "создаёшь", "создаёт", "создаём", "создаёте", "создают"],
    "создава",
  ),
  подавать: verb(
    "подавать",
    ["подаю", "подаёшь", "подаёт", "подаём", "подаёте", "подают"],
    "подава",
  ),
  называть: verb(
    "называть",
    ["называю", "называешь", "называет", "называем", "называете", "называют"],
    "называ",
  ),
  рассказывать: verb(
    "рассказывать",
    [
      "рассказываю",
      "рассказываешь",
      "рассказывает",
      "рассказываем",
      "рассказываете",
      "рассказывают",
    ],
    "рассказыва",
  ),
  получаться: verb(
    "получаться",
    ["получаюсь", "получаешься", "получается", "получаемся", "получаетесь", "получаются"],
    "получа",
    ["получался(ась)", "получался(ась)", "получался", "получались", "получались", "получались"],
  ),

  /**
   * `tener` as possession — the one alias that is not just another verb.
   *
   * Russian states possession as a location, not an action: "У меня есть
   * собака", never "Я имею собаку". The subject pronoun is therefore replaced
   * as well as the verb, negation becomes "нет" rather than "не есть", and the
   * past copula agrees with the thing owned, not the owner — which is why the
   * past form is left empty and each frame carries its own "была собака".
   */
  /**
   * The same possession without the copula.
   *
   * Russian drops "есть" as soon as the thing owned is quantified: "У меня
   * много удачи", not "У меня есть много удачи". The subject and the negation
   * behave exactly as in `есть`, so only the verb slot differs.
   */
  у: {
    ru: ["у"],
    ruSubject: {
      yo: "У меня",
      tu: "У тебя",
      el: "У него",
      nosotros: "У нас",
      vosotros: "У вас",
      ellos: "У них",
    },
    ruPresent: { yo: "", tu: "", el: "", nosotros: "", vosotros: "", ellos: "" },
    ruPast: { yo: "", tu: "", el: "", nosotros: "", vosotros: "", ellos: "" },
    ruNegative: { present: "нет", past: "не было" },
  },

  есть: {
    ru: ["есть"],
    ruSubject: {
      yo: "У меня",
      tu: "У тебя",
      el: "У него",
      nosotros: "У нас",
      vosotros: "У вас",
      ellos: "У них",
    },
    ruPresent: {
      yo: "есть",
      tu: "есть",
      el: "есть",
      nosotros: "есть",
      vosotros: "есть",
      ellos: "есть",
    },
    ruPast: { yo: "", tu: "", el: "", nosotros: "", vosotros: "", ellos: "" },
    ruNegative: { present: "нет", past: "не было" },
  },
};
