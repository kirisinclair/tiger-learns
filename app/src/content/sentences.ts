import type { SentenceFrame, SentenceMood } from "../domain/types";

/**
 * Sentence bank for conjugation drills.
 *
 * A frame is everything around the verb; the verb itself is conjugated at
 * runtime for whichever person and tense the card asks about. One frame
 * therefore serves all nine persons and both tenses, which is why a few
 * hundred frames produce thousands of distinct, grammatical sentences.
 *
 * Every A1 verb gets three frames — a statement, a negative and a question —
 * so the same verb is met in all three shapes rather than only in the flat
 * "Yo hablo español" pattern. Content is chosen from ordinary daily life:
 * what someone actually says about work, home, food, plans and people.
 *
 * Two authoring rules, both about Russian rather than Spanish:
 *  - the tail must fit the case the Russian verb governs ("звоню маме", not
 *    "звоню маму"), since the Russian cue is built by concatenation;
 *  - the tail must not depend on the subject, so that one frame stays correct
 *    for every person.
 */

/**
 * Anything a frame needs beyond the four required fields.
 *
 * A trailing object rather than more positions: most frames want one of these
 * and not the others, and a row ending in two `undefined`s followed by a verb
 * name says nothing to whoever reads it next.
 */
interface Extra {
  /** Plural tail, for complements that agree with the subject. */
  esPlural?: string;
  ruPlural?: string;
  /** Russian verb this object calls for, by key into `RU_VERB_ALIASES`. */
  ruVerb?: string;
  /** Russian tail in the past tense, where it differs from the present. */
  ruTailPast?: string;
}

/** Compact authoring form: [verbId, spanish tail, russian tail, mood, extra]. */
type Row = [
  verbId: string,
  es: string,
  ru: string,
  mood: "s" | "n" | "q",
  extra?: Extra,
];

const MOOD: Record<Row[3], SentenceMood> = {
  s: "statement",
  n: "negative",
  q: "question",
};

const ROWS: Row[] = [
  // -ar
  ["v.pasar", "por aquí", "здесь", "s"],
  ["v.pasar", "por el centro", "через центр", "n"],
  ["v.pasar", "por tu casa", "мимо твоего дома", "q"],

  ["v.hablar", "español", "по-испански", "s"],
  ["v.hablar", "de esto", "об этом", "n"],
  ["v.hablar", "inglés", "по-английски", "q"],

  ["v.llegar", "tarde", "поздно", "s"],
  ["v.llegar", "a tiempo", "вовремя", "n"],
  ["v.llegar", "mañana", "завтра", "q"],

  ["v.dejar", "las llaves aquí", "ключи здесь", "s"],
  ["v.dejar", "nada", "ничего", "n"],
  ["v.dejar", "el libro en la mesa", "книгу на столе", "q"],

  ["v.quedar", "en casa", "дома", "s"],
  ["v.quedar", "aquí", "тут", "n"],
  ["v.quedar", "en el hotel", "в отеле", "q"],

  ["v.llamar", "al hotel", "в отель", "s"],
  ["v.llamar", "a nadie", "никому", "n"],
  ["v.llamar", "al taxi", "в такси", "q"],

  ["v.tomar", "un café", "кофе", "s"],
  ["v.tomar", "alcohol", "алкоголь", "n"],
  ["v.tomar", "el autobús", "автобус", "q"],

  ["v.mirar", "el cielo", "на небо", "s"],
  ["v.mirar", "la televisión", "телевизор", "n"],
  ["v.mirar", "las fotos", "фотографии", "q"],

  ["v.buscar", "las llaves", "ключи", "s"],
  ["v.buscar", "problemas", "проблем", "n"],
  ["v.buscar", "trabajo", "работу", "q"],

  ["v.esperar", "el autobús de las siete", "автобус в семь", "s"],
  ["v.esperar", "a nadie en la parada", "никого на остановке", "n"],
  ["v.esperar", "buenas noticias", "хороших новостей", "q"],

  ["v.trabajar", "en la oficina", "в офисе", "s"],
  ["v.trabajar", "los domingos", "по воскресеньям", "n"],
  ["v.trabajar", "en un hospital", "в больнице", "q"],

  // -er
  ["v.creer", "en esto", "в это", "s"],
  ["v.creer", "en fantasmas", "в призраков", "n"],
  ["v.creer", "en la suerte", "в удачу", "q"],

  ["v.comer", "arroz", "рис", "s"],
  ["v.comer", "carne", "мясо", "n"],
  ["v.comer", "en casa los domingos", "дома по воскресеньям", "q"],

  ["v.beber", "agua", "воду", "s"],
  ["v.beber", "café por la noche", "кофе на ночь", "n"],
  ["v.beber", "vino", "вино", "q"],

  ["v.aprender", "español por mi cuenta", "испанский самостоятельно", "s"],
  ["v.aprender", "nada nuevo", "ничего нового", "n"],
  ["v.aprender", "rápido", "быстро", "q"],

  ["v.comprender", "la pregunta", "вопрос", "s"],
  ["v.comprender", "esta palabra", "это слово", "n"],
  ["v.comprender", "el problema", "проблему", "q"],

  ["v.correr", "en el parque", "в парке", "s"],
  ["v.correr", "por la mañana", "по утрам", "n"],
  ["v.correr", "todos los días", "каждый день", "q"],

  ["v.leer", "un libro", "книгу", "s"],
  ["v.leer", "las noticias", "новости", "n"],
  ["v.leer", "en español", "по-испански", "q"],

  ["v.deber", "estudiar más", "больше учиться", "s"],
  ["v.deber", "nada a nadie", "ничего никому", "n"],
  ["v.deber", "trabajar hoy", "работать сегодня", "q"],

  ["v.responder", "la pregunta del profesor", "на вопрос учителя", "s"],
  ["v.responder", "los mensajes", "на сообщения", "n"],
  ["v.responder", "en español siempre", "по-испански всегда", "q"],

  // -ir
  ["v.vivir", "en la Luna", "на Луне", "s"],
  ["v.vivir", "en el centro", "в центре", "n"],
  ["v.vivir", "cerca de aquí", "рядом", "q"],

  ["v.escribir", "una carta", "письмо", "s"],
  ["v.escribir", "por la noche", "ночью", "n"],
  ["v.escribir", "en español sin errores", "по-испански без ошибок", "q"],

  ["v.abrir", "la ventana", "окно", "s"],
  ["v.abrir", "la puerta", "дверь", "n"],
  ["v.abrir", "a las nueve", "в девять", "q"],

  ["v.recibir", "un mensaje", "сообщение", "s"],
  ["v.recibir", "cartas", "письма", "n"],
  ["v.recibir", "el dinero hoy", "деньги сегодня", "q"],

  ["v.subir", "la escalera", "по лестнице", "s"],
  ["v.subir", "al último piso", "на последний этаж", "n"],
  ["v.subir", "en el ascensor", "на лифте", "q"],

  ["v.decidir", "todo hoy", "всё сегодня", "s"],
  ["v.decidir", "nada sin ti", "ничего без тебя", "n"],
  ["v.decidir", "solo", "сам", "q"],

  ["v.permitir", "entrar", "войти", "s"],
  ["v.permitir", "fumar aquí", "здесь курить", "n"],
  ["v.permitir", "pagar con tarjeta", "платить картой", "q"],

  // Irregular
  /*
   * `ser` — то, чем предмет является: происхождение, род занятий, свойство.
   *
   * По-русски настоящее время идёт без связки, поэтому дополнения стоят в
   * именительном падеже: «Я врач», «Ты не отсюда». В прошедшем появляется
   * «был», и та же форма дополнения читается так же естественно.
   */
  ["v.ser", "de la Luna", "с Луны", "s"],
  ["v.ser", "médico", "врач", "s", { esPlural: "médicos", ruPlural: "врачи" }],
  ["v.ser", "el dueño del cohete", "хозяин ракеты", "s", { esPlural: "los dueños del cohete", ruPlural: "хозяева ракеты" }],
  ["v.ser", "muy amable", "очень любезный", "s", { esPlural: "muy amables", ruPlural: "очень любезные" }],
  ["v.ser", "de aquí", "отсюда", "n"],
  ["v.ser", "rico", "богатый", "s", { esPlural: "ricos", ruPlural: "богатые" }],
  ["v.ser", "el problema aquí", "проблема здесь", "n", { esPlural: "el problema aquí", ruPlural: "проблема здесь" }],
  ["v.ser", "astronauta", "космонавт", "q", { esPlural: "astronautas", ruPlural: "космонавты" }],
  ["v.ser", "marciano", "марсианин", "q", { esPlural: "marcianos", ruPlural: "марсиане" }],
  ["v.ser", "de Venus", "с Венеры", "q"],

  /*
   * `estar` — где предмет находится. Русское «находиться» подходит только к
   * месту, поэтому все дополнения здесь пространственные. Второе значение
   * estar — временное состояние (estar cansado) — так не переводится и живёт
   * в грамматическом правиле, а не здесь.
   */
  ["v.estar", "en casa a esta hora", "дома в это время", "s"],
  ["v.estar", "en el trabajo", "на работе", "s"],
  ["v.estar", "debajo de la mesa", "под столом", "s"],
  ["v.estar", "en Marte", "на Марсе", "s"],
  ["v.estar", "en la oficina hoy", "в офисе сегодня", "n"],
  ["v.estar", "lejos", "далеко", "n"],
  ["v.estar", "dentro del cohete", "внутри ракеты", "n"],
  ["v.estar", "arriba", "наверху", "n"],
  ["v.estar", "cerca", "рядом", "q"],
  ["v.estar", "detrás de la puerta", "за дверью", "q"],
  ["v.estar", "entre las estrellas", "среди звёзд", "q"],
  ["v.estar", "al otro lado del río", "на том берегу реки", "q"],

  ["v.ir", "al mercado", "на рынок", "s"],
  ["v.ir", "al trabajo hoy", "на работу сегодня", "n"],
  ["v.ir", "a la fiesta", "на праздник", "q"],

  ["v.tener", "un perro", "собака", "s", { ruVerb: "есть", ruTailPast: "была собака" }],
  ["v.tener", "tiempo", "времени", "n", { ruVerb: "есть" }],
  ["v.tener", "un paraguas", "зонт", "q", { ruVerb: "есть", ruTailPast: "был зонт" }],

  ["v.hacer", "la tarea", "домашнее задание", "s"],
  ["v.hacer", "nada hoy", "ничего сегодня", "n"],
  ["v.hacer", "ejercicio", "зарядку", "q"],

  ["v.poder", "ayudar", "помочь", "s"],
  ["v.poder", "venir hoy", "прийти сегодня", "n"],
  ["v.poder", "esperar un momento", "подождать минуту", "q"],

  ["v.querer", "un café bien cargado", "крепкий кофе", "s"],
  ["v.querer", "salir hoy", "выходить сегодня", "n"],
  ["v.querer", "ir conmigo", "пойти со мной", "q"],

  ["v.decir", "la verdad", "правду", "s"],
  ["v.decir", "mentiras", "неправду", "n"],
  ["v.decir", "algo", "что-то", "q"],

  ["v.ver", "el mar", "море", "s"],
  ["v.ver", "nada desde aquí", "ничего отсюда", "n"],
  ["v.ver", "esa casa", "тот дом", "q"],

  ["v.dar", "un regalo", "подарок", "s", { ruVerb: "дарить" }],
  ["v.dar", "consejos sin pedir", "советов без спроса", "n"],
  ["v.dar", "una respuesta", "ответ", "q"],

  ["v.saber", "la respuesta", "ответ", "s"],
  ["v.saber", "nada de esto", "ничего об этом", "n"],
  ["v.saber", "dónde está", "где это", "q"],

  ["v.venir", "mañana por la tarde", "завтра днём", "s"],
  ["v.venir", "solo al aeropuerto", "один в аэропорт", "n"],
  ["v.venir", "con nosotros", "с нами", "q"],

  ["v.poner", "el libro aquí", "книгу сюда", "s"],
  ["v.poner", "azúcar en el café", "сахар в кофе", "n"],
  ["v.poner", "las llaves en la bolsa", "ключи в сумку", "q"],

  ["v.salir", "de casa", "из дома", "s"],
  ["v.salir", "por la noche entre semana", "ночью в будни", "n"],
  ["v.salir", "temprano", "рано", "q"],

  ["v.conocer", "esta ciudad", "этот город", "s"],
  ["v.conocer", "a esa mujer", "ту женщину", "n"],
  ["v.conocer", "un buen restaurante", "хороший ресторан", "q"],

  ["v.pensar", "en ti", "о тебе", "s"],
  ["v.pensar", "en el trabajo hoy", "о работе сегодня", "n"],
  ["v.pensar", "lo mismo", "то же самое", "q"],

  ["v.volver", "a casa", "домой", "s"],
  ["v.volver", "hoy", "сегодня", "n"],
  ["v.volver", "el lunes", "в понедельник", "q"],

  ["v.dormir", "ocho horas", "восемь часов", "s"],
  ["v.dormir", "bien", "хорошо", "n"],
  ["v.dormir", "con la ventana abierta", "с открытым окном", "q"],

  /* --------------------------------------------------------------------- *
   * Ninth frames for the irregular core.
   *
   * Nine persons need nine sentences: with fewer, some person is bound to be
   * told the same thing twice within one tense. These are the verbs that come
   * up most, so they are the ones brought up to a full set first.
   * --------------------------------------------------------------------- */

  ["v.ir", "a la Luna", "на Луну", "s"],
  ["v.ir", "al médico mañana", "к врачу завтра", "s"],
  ["v.ir", "en bicicleta", "на велосипеде", "s", { ruVerb: "ехать" }],
  ["v.ir", "solo a todas partes", "один повсюду", "n"],
  ["v.ir", "a ninguna parte", "никуда", "n"],
  ["v.ir", "al banco después", "в банк потом", "q"],

  ["v.tener", "dos boletos", "два билета", "s", { ruVerb: "есть", ruTailPast: "было два билета" }],
  ["v.tener", "un cohete viejo", "старая ракета", "s", { ruVerb: "есть", ruTailPast: "была старая ракета" }],
  ["v.tener", "una idea rara", "странная идея", "s", { ruVerb: "есть", ruTailPast: "была странная идея" }],
  ["v.tener", "mucha suerte", "много удачи", "s", { ruVerb: "у", ruTailPast: "было много удачи" }],
  ["v.tener", "las llaves del cohete", "ключей от ракеты", "n", { ruVerb: "есть" }],
  ["v.tener", "clase hoy", "занятие сегодня", "q", { ruVerb: "есть", ruTailPast: "было занятие сегодня" }],

  ["v.hacer", "un pastel", "торт", "s", { ruVerb: "готовить" }],
  ["v.hacer", "ruido", "", "s", { ruVerb: "шуметь" }],
  ["v.hacer", "planes para el viernes", "планы на пятницу", "s", { ruVerb: "строить" }],
  ["v.hacer", "preguntas", "вопросов", "n", { ruVerb: "задавать" }],
  ["v.hacer", "el desayuno", "завтрак", "n", { ruVerb: "готовить" }],
  ["v.hacer", "algo interesante", "что-то интересное", "q"],

  ["v.poder", "abrir la ventana", "открыть окно", "s"],
  ["v.poder", "explicarlo mejor", "объяснить это лучше", "s"],
  ["v.poder", "dormir aquí", "спать здесь", "n"],
  ["v.poder", "parar de reír", "перестать смеяться", "n"],
  ["v.poder", "pagar mañana", "заплатить завтра", "q"],
  ["v.poder", "volar", "летать", "q"],

  ["v.querer", "ver las estrellas", "увидеть звёзды", "s"],
  ["v.querer", "otro plato", "другое блюдо", "s"],
  ["v.querer", "discutir", "спорить", "n"],
  ["v.querer", "nada más", "больше ничего", "n"],
  ["v.querer", "probar esto", "попробовать это", "q"],
  ["v.querer", "quedarse", "остаться", "q"],

  ["v.decir", "que sí", "«да»", "s"],
  ["v.decir", "lo mismo siempre", "всегда одно и то же", "s"],
  ["v.decir", "nada nuevo nunca", "никогда ничего нового", "n"],
  ["v.decir", "tu nombre", "своё имя", "n", { ruVerb: "называть" }],
  ["v.decir", "el motivo", "причину", "q", { ruVerb: "называть" }],
  ["v.decir", "la hora", "время", "q", { ruVerb: "называть" }],

  ["v.ver", "la Luna llena", "полную луну", "s"],
  ["v.ver", "una luz extraña", "странный свет", "s"],
  ["v.ver", "películas viejas", "старые фильмы", "n", { ruVerb: "смотреть" }],
  ["v.ver", "el error", "ошибку", "n"],
  ["v.ver", "algo raro", "что-то странное", "q"],
  ["v.ver", "el mapa", "карту", "q"],

  ["v.dar", "las gracias", "", "s", { ruVerb: "благодарить" }],
  ["v.dar", "un consejo", "совет", "s"],
  ["v.dar", "clases de español", "испанский", "s", { ruVerb: "преподавать" }],
  ["v.dar", "explicaciones", "объяснений", "n"],
  ["v.dar", "permiso", "разрешения", "n"],
  ["v.dar", "la dirección", "адрес", "q"],

  ["v.saber", "la verdad completa", "всю правду", "s"],
  ["v.saber", "manejar", "водить машину", "s", { ruVerb: "уметь" }],
  ["v.saber", "cocinar", "готовить", "n", { ruVerb: "уметь" }],
  ["v.saber", "su nombre", "его имя", "n"],
  ["v.saber", "qué pasó", "что случилось", "q"],
  ["v.saber", "el camino", "дорогу", "q"],

  ["v.venir", "en taxi", "на такси", "s", { ruVerb: "приезжать" }],
  ["v.venir", "desde lejos", "издалека", "s", { ruVerb: "приезжать" }],
  ["v.venir", "temprano a la reunión", "рано на встречу", "n"],
  ["v.venir", "a las fiestas", "на праздники", "n"],
  ["v.venir", "esta noche", "сегодня вечером", "q"],
  ["v.venir", "otra vez", "снова", "q"],

  ["v.poner", "la ropa en la maleta", "одежду в чемодан", "s"],
  ["v.poner", "música", "музыку", "s", { ruVerb: "включать" }],
  ["v.poner", "sal en la sopa", "соль в суп", "n"],
  ["v.poner", "nada en la mesa", "ничего на стол", "n"],
  ["v.poner", "el celular en silencio", "телефон на беззвучный", "q", { ruVerb: "ставить" }],
  ["v.poner", "las flores en el agua", "цветы в воду", "q", { ruVerb: "ставить" }],

  ["v.salir", "a caminar", "гулять", "s"],
  ["v.salir", "del cohete", "из ракеты", "s"],
  ["v.salir", "los domingos por la mañana", "по воскресеньям утром", "n"],
  ["v.salir", "a tiempo del trabajo", "вовремя с работы", "n"],
  ["v.salir", "con amigos", "с друзьями", "q"],
  ["v.salir", "de aquí sin decir nada", "отсюда молча", "q"],

  ["v.conocer", "este camino", "эту дорогу", "s"],
  ["v.conocer", "a mucha gente", "многих людей", "s"],
  ["v.conocer", "el lugar", "это место", "n"],
  ["v.conocer", "la historia", "историю", "n"],
  ["v.conocer", "a alguien aquí", "кого-то здесь", "q"],
  ["v.conocer", "otro planeta", "другую планету", "q"],

  ["v.pensar", "en el viaje", "о поездке", "s"],
  ["v.pensar", "antes de hablar", "прежде чем говорить", "s"],
  ["v.pensar", "en eso ahora", "об этом сейчас", "n"],
  ["v.pensar", "en nada", "ни о чём", "n"],
  ["v.pensar", "lo contrario", "наоборот", "q"],
  ["v.pensar", "en volver", "о возвращении", "q"],

  ["v.volver", "del trabajo tarde", "с работы поздно", "s"],
  ["v.volver", "a la Tierra", "на Землю", "s"],
  ["v.volver", "pronto", "скоро", "n"],
  ["v.volver", "a ese lugar", "в то место", "n"],
  ["v.volver", "en tren", "на поезде", "q"],
  ["v.volver", "antes de la cena", "до ужина", "q"],

  ["v.dormir", "en el sofá", "на диване", "s"],
  ["v.dormir", "hasta tarde", "допоздна", "s"],
  ["v.dormir", "en el avión", "в самолёте", "n"],
  ["v.dormir", "lo suficiente", "достаточно", "n"],
  ["v.dormir", "con la luz encendida", "со светом", "q"],
  ["v.dormir", "durante el viaje", "во время поездки", "q"],

  /* --------------------------------------------------------------------- *
   * Ninth frames for the regular core.
   *
   * Same arithmetic as above: nine persons, nine sentences, so no learner is
   * told the same thing twice inside one tense. With this block every drilled
   * verb has a full set.
   * --------------------------------------------------------------------- */

  ["v.abrir", "la caja", "коробку", "s"],
  ["v.abrir", "los ojos", "глаза", "s"],
  ["v.abrir", "la tienda a las nueve", "магазин в девять", "s"],
  ["v.abrir", "el correo", "почту", "n"],
  ["v.abrir", "las cortinas", "шторы", "n"],
  ["v.abrir", "la maleta aquí", "чемодан здесь", "q"],

  ["v.aprender", "palabras nuevas", "новые слова", "s"],
  ["v.aprender", "a manejar", "водить машину", "s"],
  ["v.aprender", "de los errores", "на ошибках", "s"],
  ["v.aprender", "las reglas", "правила", "n"],
  ["v.aprender", "nada de memoria", "ничего наизусть", "n"],
  ["v.aprender", "dos idiomas", "два языка", "q"],

  ["v.beber", "té por la mañana", "чай по утрам", "s"],
  ["v.beber", "jugo de naranja", "апельсиновый сок", "s"],
  ["v.beber", "suficiente agua", "достаточно воды", "n"],
  ["v.beber", "refrescos", "газировку", "n"],
  ["v.beber", "algo frío", "что-нибудь холодное", "q"],
  ["v.beber", "leche", "молоко", "q"],

  ["v.buscar", "trabajo nuevo", "новую работу", "s"],
  ["v.buscar", "una farmacia", "аптеку", "s"],
  ["v.buscar", "el pasaporte", "паспорт", "s"],
  ["v.buscar", "excusas", "оправдания", "n"],
  ["v.buscar", "nada especial", "ничего особенного", "n"],
  ["v.buscar", "la salida", "выход", "q"],

  ["v.comer", "sopa caliente", "горячий суп", "s"],
  ["v.comer", "pescado los viernes", "рыбу по пятницам", "s"],
  ["v.comer", "despacio", "медленно", "s"],
  ["v.comer", "postre", "десерт", "n"],
  ["v.comer", "nada antes de dormir", "ничего перед сном", "n"],
  ["v.comer", "fruta", "фрукты", "q"],

  ["v.comprender", "la regla", "правило", "s"],
  ["v.comprender", "todo ahora", "всё сейчас", "s"],
  ["v.comprender", "el chiste", "шутку", "n"],
  ["v.comprender", "las instrucciones", "инструкции", "n"],
  ["v.comprender", "lo que digo", "что я говорю", "q"],
  ["v.comprender", "el mapa del metro", "схему метро", "q"],

  ["v.correr", "rápido cuesta arriba", "быстро в гору", "s"],
  ["v.correr", "por la playa", "по пляжу", "s"],
  ["v.correr", "cinco kilómetros", "пять километров", "s"],
  ["v.correr", "con este calor", "в такую жару", "n"],
  ["v.correr", "nunca", "никогда", "n"],
  ["v.correr", "para el autobús", "за автобусом", "q"],

  ["v.creer", "en los marcianos", "в марсиан", "s"],
  ["v.creer", "lo que dicen", "тому, что говорят", "s"],
  ["v.creer", "en las noticias", "новостям", "n"],
  ["v.creer", "esa historia", "в ту историю", "n"],
  ["v.creer", "en el destino", "в судьбу", "q"],
  ["v.creer", "en mí", "в меня", "q"],

  ["v.deber", "llamar antes", "позвонить заранее", "s"],
  ["v.deber", "devolver el libro", "вернуть книгу", "s"],
  ["v.deber", "descansar hoy", "отдохнуть сегодня", "s"],
  ["v.deber", "dinero al banco", "денег банку", "n"],
  ["v.deber", "explicaciones a nadie", "объяснений никому", "n"],
  ["v.deber", "pagar ahora", "платить сейчас", "q"],

  ["v.decidir", "rápido bajo presión", "быстро под давлением", "s"],
  ["v.decidir", "el menú", "меню", "s"],
  ["v.decidir", "dónde ir", "куда идти", "s"],
  ["v.decidir", "por los demás", "за остальных", "n"],
  ["v.decidir", "a esta hora", "в такое время", "n"],
  ["v.decidir", "el precio", "цену", "q"],

  ["v.dejar", "propina", "чаевые", "s"],
  ["v.dejar", "el carro afuera", "машину снаружи", "s"],
  ["v.dejar", "una nota", "записку", "s"],
  ["v.dejar", "basura aquí", "мусор здесь", "n"],
  ["v.dejar", "la puerta abierta", "дверь открытой", "n"],
  ["v.dejar", "el paraguas", "зонт", "q"],

  ["v.escribir", "mi nombre aquí", "своё имя здесь", "s"],
  ["v.escribir", "con lápiz", "карандашом", "s"],
  ["v.escribir", "un mensaje corto", "короткое сообщение", "s"],
  ["v.escribir", "en el cuaderno", "в тетради", "n"],
  ["v.escribir", "durante la clase", "во время урока", "n"],
  ["v.escribir", "la dirección en un papel", "адрес на бумажке", "q"],

  ["v.esperar", "afuera", "снаружи", "s"],
  ["v.esperar", "una respuesta del jefe", "ответа от начальника", "s"],
  ["v.esperar", "media hora", "полчаса", "s"],
  ["v.esperar", "más", "больше", "n"],
  ["v.esperar", "a nadie más", "больше никого", "n"],
  ["v.esperar", "aquí en la esquina", "здесь на углу", "q"],

  ["v.hablar", "con el jefe", "с начальником", "s"],
  ["v.hablar", "por teléfono", "по телефону", "s"],
  ["v.hablar", "de política", "о политике", "n"],
  ["v.hablar", "tan rápido", "так быстро", "n"],
  ["v.hablar", "japonés", "по-японски", "q"],
  ["v.hablar", "en voz baja", "тихо", "q"],

  ["v.leer", "el menú entero", "меню целиком", "s"],
  ["v.leer", "antes de dormir", "перед сном", "s"],
  ["v.leer", "el periódico", "газету", "s"],
  ["v.leer", "los mensajes del grupo", "сообщения группы", "n"],
  ["v.leer", "en voz alta", "вслух", "n"],
  ["v.leer", "esa novela", "тот роман", "q"],

  ["v.llamar", "a la policía", "в полицию", "s"],
  ["v.llamar", "por la mañana temprano", "рано утром", "s"],
  ["v.llamar", "al banco", "в банк", "s"],
  ["v.llamar", "a esta hora de la noche", "в такое время ночи", "n"],
  ["v.llamar", "todos los días sin falta", "каждый день без исключения", "n"],
  ["v.llamar", "desde el trabajo", "с работы", "q"],

  ["v.llegar", "a las ocho", "в восемь", "s"],
  ["v.llegar", "antes que nadie", "раньше всех", "s"],
  ["v.llegar", "en tren de la tarde", "дневным поездом", "s"],
  ["v.llegar", "tarde a la reunión", "поздно на встречу", "n"],
  ["v.llegar", "sin avisar", "без предупреждения", "n"],
  ["v.llegar", "pronto a la ciudad", "скоро в город", "q"],

  ["v.mirar", "el reloj", "на часы", "s"],
  ["v.mirar", "por la ventana", "в окно", "s"],
  ["v.mirar", "las estrellas", "на звёзды", "s"],
  ["v.mirar", "atrás", "назад", "n"],
  ["v.mirar", "el precio antes de pagar", "на цену перед оплатой", "n"],
  ["v.mirar", "ese edificio", "на то здание", "q"],

  ["v.pasar", "por el parque", "через парк", "s"],
  ["v.pasar", "rápido por el pasillo", "быстро по коридору", "s"],
  ["v.pasar", "por la farmacia", "мимо аптеки", "s"],
  ["v.pasar", "sin saludar", "не здороваясь", "n"],
  ["v.pasar", "cerca del río", "рядом с рекой", "n"],
  ["v.pasar", "por tu oficina", "мимо твоего офиса", "q"],

  ["v.permitir", "salir temprano", "уйти раньше", "s"],
  ["v.permitir", "usar el celular", "пользоваться телефоном", "s"],
  ["v.permitir", "pagar después", "заплатить потом", "s"],
  ["v.permitir", "entrar sin boleto", "войти без билета", "n"],
  ["v.permitir", "comer aquí", "есть здесь", "n"],
  ["v.permitir", "tomar fotos", "фотографировать", "q"],

  ["v.quedar", "hasta el final", "до конца", "s"],
  ["v.quedar", "una hora más", "ещё на час", "s"],
  ["v.quedar", "en la mejor mesa", "за лучшим столом", "s"],
  ["v.quedar", "solo en la oficina", "один в офисе", "n"],
  ["v.quedar", "para siempre", "навсегда", "n"],
  ["v.quedar", "despierto", "бодрствующим", "q"],

  ["v.recibir", "una carta del banco", "письмо из банка", "s"],
  ["v.recibir", "buenas noticias por fin", "наконец хорошие новости", "s"],
  ["v.recibir", "el paquete hoy", "посылку сегодня", "s"],
  ["v.recibir", "respuestas", "ответов", "n"],
  ["v.recibir", "nada por correo", "ничего по почте", "n"],
  ["v.recibir", "el pago mañana", "оплату завтра", "q"],

  ["v.responder", "rápido a los correos", "быстро на письма", "s"],
  ["v.responder", "con calma", "спокойно", "s"],
  ["v.responder", "a todos", "всем", "s"],
  ["v.responder", "a esa pregunta", "на тот вопрос", "n"],
  ["v.responder", "por él", "за него", "n"],
  ["v.responder", "por escrito", "письменно", "q"],

  ["v.subir", "al segundo piso", "на второй этаж", "s"],
  ["v.subir", "por la montaña", "на гору", "s"],
  ["v.subir", "al cohete", "в ракету", "s"],
  ["v.subir", "corriendo", "бегом", "n"],
  ["v.subir", "hasta arriba", "до самого верха", "n"],
  ["v.subir", "al techo", "на крышу", "q"],

  ["v.tomar", "el metro", "метро", "s"],
  ["v.tomar", "una decisión", "решение", "s"],
  ["v.tomar", "notas", "заметки", "s"],
  ["v.tomar", "riesgos", "риски", "n"],
  ["v.tomar", "nada del refrigerador", "ничего из холодильника", "n"],
  ["v.tomar", "el primer tren", "первый поезд", "q"],

  ["v.trabajar", "desde casa", "из дома", "s"],
  ["v.trabajar", "con computadoras", "с компьютерами", "s"],
  ["v.trabajar", "hasta tarde los jueves", "допоздна по четвергам", "s"],
  ["v.trabajar", "sin descanso", "без отдыха", "n"],
  ["v.trabajar", "de noche", "ночью", "n"],
  ["v.trabajar", "este mes", "в этом месяце", "q"],

  ["v.vivir", "cerca del mar", "рядом с морем", "s"],
  ["v.vivir", "en un cohete", "в ракете", "s"],
  ["v.vivir", "solo desde hace años", "один уже много лет", "s"],
  ["v.vivir", "con miedo", "в страхе", "n"],
  ["v.vivir", "lejos del trabajo", "далеко от работы", "n"],
  ["v.vivir", "en otro planeta", "на другой планете", "q"],

  /* --------------------------------------------------------------------- *
   * Deep benches for ser and estar.
   *
   * Their deck holds only fourteen cards — two verbs across seven persons —
   * so the tail runs out long before the session does. With ten tails the
   * fifteenth question had to reuse one. Roughly a hundred each pushes the
   * first repeat past a hundred questions instead of past fifteen.
   *
   * `ser` takes predicates, so nouns and adjectives carry plural forms.
   * `estar` takes places only: its Russian is «находиться», which fits a
   * location and nothing else.
   * --------------------------------------------------------------------- */

  ["v.ser", "ingeniero", "инженер", "s", { esPlural: "ingenieros", ruPlural: "инженеры" }],
  ["v.ser", "profesor", "учитель", "s", { esPlural: "profesores", ruPlural: "учителя" }],
  ["v.ser", "cocinero", "повар", "s", { esPlural: "cocineros", ruPlural: "повара" }],
  ["v.ser", "piloto", "пилот", "s", { esPlural: "pilotos", ruPlural: "пилоты" }],
  ["v.ser", "músico", "музыкант", "s", { esPlural: "músicos", ruPlural: "музыканты" }],
  ["v.ser", "escritor", "писатель", "s", { esPlural: "escritores", ruPlural: "писатели" }],
  ["v.ser", "vecino", "сосед", "s", { esPlural: "vecinos", ruPlural: "соседи" }],
  ["v.ser", "el jefe aquí", "здесь начальник", "s", { esPlural: "los jefes aquí", ruPlural: "здесь начальники" }],
  ["v.ser", "muy alto", "очень высокий", "s", { esPlural: "muy altos", ruPlural: "очень высокие" }],
  ["v.ser", "bastante joven", "довольно молодой", "s", { esPlural: "bastante jóvenes", ruPlural: "довольно молодые" }],
  ["v.ser", "simpático", "приятный", "s", { esPlural: "simpáticos", ruPlural: "приятные" }],
  ["v.ser", "curioso", "любопытный", "s", { esPlural: "curiosos", ruPlural: "любопытные" }],
  ["v.ser", "valiente", "смелый", "s", { esPlural: "valientes", ruPlural: "смелые" }],
  ["v.ser", "tranquilo", "спокойный", "s", { esPlural: "tranquilos", ruPlural: "спокойные" }],
  ["v.ser", "de otro planeta", "с другой планеты", "s"],
  ["v.ser", "del futuro", "из будущего", "s"],
  ["v.ser", "bilingüe", "двуязычный", "s", { esPlural: "bilingües", ruPlural: "двуязычные" }],
  ["v.ser", "buen cocinero", "хороший повар", "s", { esPlural: "buenos cocineros", ruPlural: "хорошие повара" }],
  ["v.ser", "una persona seria", "серьёзный человек", "s", { esPlural: "personas serias", ruPlural: "серьёзные люди" }],
  ["v.ser", "igual que antes", "такой же, как раньше", "s", { esPlural: "iguales que antes", ruPlural: "такие же, как раньше" }],
  ["v.ser", "de la ciudad", "из города", "s"],
  ["v.ser", "tímido", "застенчивый", "n", { esPlural: "tímidos", ruPlural: "застенчивые" }],
  ["v.ser", "perezoso", "ленивый", "n", { esPlural: "perezosos", ruPlural: "ленивые" }],
  ["v.ser", "tonto", "глупый", "n", { esPlural: "tontos", ruPlural: "глупые" }],
  ["v.ser", "peligroso", "опасный", "n", { esPlural: "peligrosos", ruPlural: "опасные" }],
  ["v.ser", "responsable", "ответственный", "s", { esPlural: "responsables", ruPlural: "ответственные" }],
  ["v.ser", "el primero", "первый", "n", { esPlural: "los primeros", ruPlural: "первые" }],
  ["v.ser", "el último", "последний", "n", { esPlural: "los últimos", ruPlural: "последние" }],
  ["v.ser", "mecánico", "механик", "n", { esPlural: "mecánicos", ruPlural: "механики" }],
  ["v.ser", "millonario", "миллионер", "s", { esPlural: "millonarios", ruPlural: "миллионеры" }],
  ["v.ser", "de este barrio", "из этого района", "n"],
  ["v.ser", "invisible", "невидимый", "n", { esPlural: "invisibles", ruPlural: "невидимые" }],
  ["v.ser", "supersticioso", "суеверный", "n", { esPlural: "supersticiosos", ruPlural: "суеверные" }],
  ["v.ser", "el culpable", "виноватый", "n", { esPlural: "los culpables", ruPlural: "виноватые" }],
  ["v.ser", "de la Tierra", "с Земли", "n"],
  ["v.ser", "abogado", "адвокат", "q", { esPlural: "abogados", ruPlural: "адвокаты" }],
  ["v.ser", "artista", "художник", "q", { esPlural: "artistas", ruPlural: "художники" }],
  ["v.ser", "bombero", "пожарный", "q", { esPlural: "bomberos", ruPlural: "пожарные" }],
  ["v.ser", "el nuevo vecino", "новый сосед", "q", { esPlural: "los nuevos vecinos", ruPlural: "новые соседи" }],
  ["v.ser", "feliz", "счастливый", "q", { esPlural: "felices", ruPlural: "счастливые" }],
  ["v.ser", "amigo del capitán", "друг капитана", "q", { esPlural: "amigos del capitán", ruPlural: "друзья капитана" }],
  ["v.ser", "capaz de mucho", "способен на многое", "s", { esPlural: "capaces de mucho", ruPlural: "способны на многое" }],
  ["v.ser", "capaz de volar", "способный летать", "q", { esPlural: "capaces de volar", ruPlural: "способные летать" }],
  ["v.ser", "libre hoy", "свободный сегодня", "q", { esPlural: "libres hoy", ruPlural: "свободные сегодня" }],
  ["v.ser", "mayor que yo", "старше меня", "q", { esPlural: "mayores que yo", ruPlural: "старше меня" }],
  ["v.ser", "el mismo de siempre", "всё тот же", "q", { esPlural: "los mismos de siempre", ruPlural: "всё те же" }],

  ["v.estar", "en la cocina", "на кухне", "s"],
  ["v.estar", "en el jardín", "в саду", "s"],
  ["v.estar", "en el aeropuerto", "в аэропорту", "s"],
  ["v.estar", "en la estación", "на вокзале", "s"],
  ["v.estar", "en el mercado", "на рынке", "s"],
  ["v.estar", "en la playa", "на пляже", "s"],
  ["v.estar", "en la escuela", "в школе", "s"],
  ["v.estar", "en el banco", "в банке", "s"],
  ["v.estar", "en el museo", "в музее", "s"],
  ["v.estar", "en la farmacia", "в аптеке", "s"],
  ["v.estar", "en el cine", "в кинотеатре", "s"],
  ["v.estar", "bajo la lluvia", "под дождём", "s"],
  ["v.estar", "sobre el puente", "на мосту", "s"],
  ["v.estar", "junto a la ventana", "у окна", "s"],
  ["v.estar", "frente al edificio", "напротив здания", "s"],
  ["v.estar", "en el segundo piso", "на втором этаже", "s"],
  ["v.estar", "en la sala de espera", "в зале ожидания", "n"],
  ["v.estar", "en el metro", "в метро", "n"],
  ["v.estar", "en el carro", "в машине", "n"],
  ["v.estar", "en el avión de vuelta", "в самолёте обратно", "n"],
  ["v.estar", "en otra ciudad", "в другом городе", "n"],
  ["v.estar", "en la oficina de migración", "в миграционной службе", "n"],
  ["v.estar", "cerca del mar abierto", "рядом с открытым морем", "n"],
  ["v.estar", "lejos de aquí", "далеко отсюда", "n"],
  ["v.estar", "adentro", "внутри", "n"],
  ["v.estar", "abajo", "внизу", "n"],
  ["v.estar", "en el techo", "на крыше", "n"],
  ["v.estar", "en la Luna otra vez", "снова на Луне", "n"],
  ["v.estar", "en el hospital", "в больнице", "n"],
  ["v.estar", "en la esquina", "на углу", "q"],
  ["v.estar", "en el parque central", "в центральном парке", "q"],
  ["v.estar", "en la fila", "в очереди", "q"],
  ["v.estar", "en el hotel del centro", "в отеле в центре", "q"],
  ["v.estar", "en el restaurante", "в ресторане", "q"],
  ["v.estar", "detrás de mí", "позади меня", "q"],
  ["v.estar", "delante de la tienda", "перед магазином", "q"],
  ["v.estar", "entre los árboles", "среди деревьев", "q"],
  ["v.estar", "al final del pasillo", "в конце коридора", "q"],
  ["v.estar", "en el cuarto de al lado", "в соседней комнате", "q"],
  ["v.estar", "en algún lugar de Venus", "где-то на Венере", "q"],
  ["v.estar", "en la puerta", "в дверях", "q"],
  ["v.estar", "en el fondo", "в глубине", "q"],
  ["v.estar", "en la orilla", "на берегу", "q"],
  ["v.estar", "bajo el agua", "под водой", "q"],

  /* --------------------------------------------------------------------- *
   * Sixth-to-fifteenth frames for the irregular verbs.
   *
   * Their deck is larger — sixteen verbs across seven persons — so a hundred
   * tails each would be waste. Fifteen apiece already gives well over two
   * hundred distinct tails in the deck, which is the number that matters.
   * --------------------------------------------------------------------- */

  ["v.ir", "al cine el sábado", "в кино в субботу", "s"],
  ["v.ir", "de compras", "за покупками", "s"],
  ["v.ir", "por el mismo camino", "по той же дороге", "s"],
  ["v.ir", "a la playa sin avisar", "на пляж без предупреждения", "n"],
  ["v.ir", "en metro", "на метро", "n", { ruVerb: "ехать" }],
  ["v.ir", "al museo el domingo", "в музей в воскресенье", "q"],

  ["v.tener", "un secreto", "секрет", "s", { ruVerb: "есть", ruTailPast: "был секрет" }],
  ["v.tener", "una casa en la playa", "дом на пляже", "s", { ruVerb: "есть", ruTailPast: "был дом на пляже" }],
  ["v.tener", "un mapa del cielo", "карта неба", "s", { ruVerb: "есть", ruTailPast: "была карта неба" }],
  ["v.tener", "muchos recursos", "много ресурсов", "s", { ruVerb: "у", ruTailPast: "было много ресурсов" }],
  ["v.tener", "todo lo necesario", "всё необходимое", "s", { ruVerb: "есть", ruTailPast: "было всё необходимое" }],
  ["v.tener", "miedo a la oscuridad", "страха темноты", "n", { ruVerb: "есть" }],
  ["v.tener", "tiempo libre hoy", "свободного времени сегодня", "n", { ruVerb: "есть" }],
  ["v.tener", "algo que decir", "что сказать", "q", { ruVerb: "есть", ruTailPast: "было что сказать" }],

  ["v.hacer", "la maleta", "чемодан", "s", { ruVerb: "собирать" }],
  ["v.hacer", "la cena temprano", "ужин рано", "s", { ruVerb: "готовить" }],
  ["v.hacer", "un dibujo", "", "s", { ruVerb: "рисовать" }],
  ["v.hacer", "las cosas rápido", "дела быстро", "n"],
  ["v.hacer", "caso a nadie", "внимания ни на кого", "n", { ruVerb: "обращать" }],
  ["v.hacer", "deporte los martes", "спортом по вторникам", "q", { ruVerb: "заниматься" }],

  ["v.poder", "esperar afuera", "подождать снаружи", "s"],
  ["v.poder", "llegar a las ocho", "прийти в восемь", "s"],
  ["v.poder", "traer el mapa", "принести карту", "s"],
  ["v.poder", "seguir así", "продолжать так", "n"],
  ["v.poder", "verte hoy", "увидеть тебя сегодня", "n"],
  ["v.poder", "cambiar la fecha", "поменять дату", "q"],

  ["v.querer", "aprender a bailar", "научиться танцевать", "s"],
  ["v.querer", "un lugar tranquilo", "спокойное место", "s"],
  ["v.querer", "viajar solo", "путешествовать один", "s"],
  ["v.querer", "hablar de eso", "говорить об этом", "n"],
  ["v.querer", "esperar más", "ждать дольше", "n"],
  ["v.querer", "ver el cohete", "увидеть ракету", "q"],

  ["v.decir", "que no", "«нет»", "s"],
  ["v.decir", "la última palabra", "последнее слово", "s"],
  ["v.decir", "adiós sin mirar", "«пока» не глядя", "s"],
  ["v.decir", "toda la historia", "всю историю", "n", { ruVerb: "рассказывать" }],
  ["v.decir", "el precio real", "настоящую цену", "n", { ruVerb: "называть" }],
  ["v.decir", "algo en español", "что-нибудь по-испански", "q"],

  ["v.ver", "el amanecer", "рассвет", "s"],
  ["v.ver", "las noticias de la noche", "вечерние новости", "s", { ruVerb: "смотреть" }],
  ["v.ver", "el cohete despegar", "как взлетает ракета", "s"],
  ["v.ver", "la diferencia", "разницу", "n"],
  ["v.ver", "nada sin lentes", "ничего без очков", "n"],
  ["v.ver", "esa película", "тот фильм", "q", { ruVerb: "смотреть" }],

  ["v.dar", "un paseo", "", "s", { ruVerb: "гулять" }],
  ["v.dar", "el cambio", "сдачу", "s"],
  ["v.dar", "el número de teléfono", "номер телефона", "s"],
  ["v.dar", "problemas a nadie", "проблем никому", "n", { ruVerb: "создавать" }],
  ["v.dar", "señales de vida", "признаков жизни", "n", { ruVerb: "подавать" }],
  ["v.dar", "una respuesta clara", "чёткий ответ", "q"],

  ["v.saber", "la fecha", "дату", "s"],
  ["v.saber", "nadar", "плавать", "s", { ruVerb: "уметь" }],
  ["v.saber", "dónde queda", "где это находится", "s"],
  ["v.saber", "la contraseña", "пароль", "n"],
  ["v.saber", "qué decir", "что сказать", "n"],
  ["v.saber", "el resultado", "результат", "q"],

  ["v.venir", "a pie", "пешком", "s"],
  ["v.venir", "cada semana", "каждую неделю", "s"],
  ["v.venir", "de otro país", "из другой страны", "s", { ruVerb: "приезжать" }],
  ["v.venir", "con nada", "ни с чем", "n"],
  ["v.venir", "los lunes", "по понедельникам", "n"],
  ["v.venir", "al concierto", "на концерт", "q"],

  ["v.poner", "el mapa en la pared", "карту на стену", "s", { ruVerb: "вешать" }],
  ["v.poner", "la mesa para tres", "стол на троих", "s", { ruVerb: "накрывать" }],
  ["v.poner", "los platos en el fregadero", "тарелки в раковину", "s"],
  ["v.poner", "excusas cada vez", "оправданий каждый раз", "n", { ruVerb: "находить" }],
  ["v.poner", "el despertador", "будильник", "n", { ruVerb: "ставить" }],
  ["v.poner", "la maleta arriba", "чемодан наверх", "q"],

  ["v.salir", "a la calle", "на улицу", "s"],
  ["v.salir", "en la foto", "на фото", "s", { ruVerb: "получаться" }],
  ["v.salir", "de la reunión", "со встречи", "s"],
  ["v.salir", "sin paraguas", "без зонта", "n"],
  ["v.salir", "de casa antes de las siete", "из дома раньше семи", "n"],
  ["v.salir", "esta noche con todos", "сегодня вечером со всеми", "q"],

  ["v.conocer", "el barrio", "район", "s"],
  ["v.conocer", "buenos lugares", "хорошие места", "s"],
  ["v.conocer", "la respuesta correcta", "правильный ответ", "s"],
  ["v.conocer", "a nadie en la fiesta", "никого на празднике", "n"],
  ["v.conocer", "esa canción", "ту песню", "n"],
  ["v.conocer", "al nuevo jefe", "нового начальника", "q"],

  ["v.pensar", "en el futuro", "о будущем", "s"],
  ["v.pensar", "lo mismo que tú", "то же, что и ты", "s"],
  ["v.pensar", "en cambiar de trabajo", "о смене работы", "s"],
  ["v.pensar", "en las consecuencias", "о последствиях", "n"],
  ["v.pensar", "mucho en eso", "много об этом", "n"],
  ["v.pensar", "en mudarse", "о переезде", "q"],

  ["v.volver", "al mismo lugar", "в то же место", "s"],
  ["v.volver", "con las manos vacías", "с пустыми руками", "s"],
  ["v.volver", "por la puerta de atrás", "через заднюю дверь", "s"],
  ["v.volver", "sin avisar a nadie", "не предупредив никого", "n"],
  ["v.volver", "tan tarde", "так поздно", "n"],
  ["v.volver", "el próximo mes", "в следующем месяце", "q"],

  ["v.dormir", "profundamente", "крепко", "s"],
  ["v.dormir", "con música", "под музыку", "s"],
  ["v.dormir", "la siesta", "днём", "s"],
  ["v.dormir", "antes de medianoche", "до полуночи", "n"],
  ["v.dormir", "en camas duras", "на жёстких кроватях", "n"],
  ["v.dormir", "en el tren", "в поезде", "q"],
];

export const SENTENCE_FRAMES: SentenceFrame[] = ROWS.map(
  ([verbId, es, ru, mood, extra]) => ({
    verbId,
    es,
    ru,
    mood: MOOD[mood],
    ...extra,
  }),
);

/** Frames grouped by verb, for picking one when a card comes up. */
export const FRAMES_BY_VERB = SENTENCE_FRAMES.reduce<Map<string, SentenceFrame[]>>(
  (map, frame) => {
    const list = map.get(frame.verbId);
    if (list) list.push(frame);
    else map.set(frame.verbId, [frame]);
    return map;
  },
  new Map(),
);
