import type { PhraseEntry, PhraseFunction } from "../domain/types";

/**
 * Ready-made phrases, Latin-American Spanish.
 *
 * These are whole utterances, not vocabulary. "Gracias" and "Sí" belong in the
 * word section; what earns a place here is a sentence a learner could not
 * assemble on the spot — because of its structure, its idiom, or simply because
 * hesitating mid-sentence is not an option at a clinic window.
 *
 * Two axes, applied in that order:
 *
 *  - **Difficulty decides the part.** Part 1 is within reach at A1: present
 *    tense, short questions. Part 2 adds the past, the polite conditional and
 *    complaints. Part 3 is the specific and the stressful.
 *  - **Usefulness decides the order inside a part.** Whatever comes up most
 *    often in ordinary life goes first, so stopping after any level still
 *    leaves the most usable subset of that difficulty.
 *
 * Ordering by usefulness alone was tried and rejected: it put "Gracias" and
 * "Sí" at the top, which are words rather than phrases and belong elsewhere.
 *
 * Latin-American usage throughout: `ustedes` for plural you, `carro` not
 * `coche`, `celular` not `móvil`.
 */

/** Compact authoring form: [spanish, russian, function, situation?, literal?]. */
type PhraseRow = [
  es: string,
  ru: string,
  fn: PhraseFunction,
  situation?: string,
  literal?: string,
];

/* -------------------------------------------------------------------------- */
/* Part 1 — meeting people and holding a conversation                         */
/* -------------------------------------------------------------------------- */

const PART_1: PhraseRow[] = [
  // Keeping a conversation alive matters before anything else: these are the
  // sentences that buy time when the language runs out.
  ["Todavía no hablo muy bien", "Я пока говорю не очень хорошо", "problem"],
  ["¿Puedes hablar más despacio, por favor?", "Можешь говорить помедленнее?", "request"],
  ["No te entendí bien", "Я тебя не совсем понял", "problem"],
  ["¿Cómo se dice esto en español?", "Как это сказать по-испански?", "question"],
  ["¿Qué significa esta palabra?", "Что значит это слово?", "question"],
  ["¿Me entiendes?", "Ты меня понимаешь?", "question"],
  ["¿Cómo te llamas?", "Как тебя зовут?", "smalltalk"],
  ["Me llamo Ana, ¿y tú?", "Меня зовут Ана, а тебя?", "smalltalk"],
  ["¿De dónde eres?", "Откуда ты?", "smalltalk"],
  ["Soy de otro país, pero vivo aquí", "Я из другой страны, но живу здесь", "smalltalk"],
  ["Estoy aprendiendo español", "Я учу испанский", "smalltalk"],
  ["¿Me puedes ayudar con esto?", "Можешь помочь мне с этим?", "request"],
  ["Muchas gracias por tu ayuda", "Большое спасибо за помощь", "politeness"],
  ["No hay de qué", "Не за что", "politeness"],
  ["Perdón por molestarte", "Извини, что беспокою", "politeness"],
  ["No pasa nada, de verdad", "Ничего страшного, правда", "politeness"],
  ["Espera un momento, por favor", "Подожди минутку, пожалуйста", "request"],
  ["¿Tienes un momento?", "У тебя есть минутка?", "request"],
  ["¿Puedo preguntarte algo?", "Можно тебя кое о чём спросить?", "request"],
  ["Claro, dime", "Конечно, говори", "agreement"],
  ["Tengo que irme, se me hace tarde", "Мне пора идти, я опаздываю", "smalltalk"],
  ["¿Nos vemos mañana?", "Увидимся завтра?", "question"],
  ["Te escribo más tarde", "Напишу тебе позже", "smalltalk"],
  ["Que tengas un buen día", "Хорошего дня", "politeness", undefined, "чтобы ты имел хороший день"],
  ["Cuídate mucho", "Береги себя", "politeness"],
  ["¿Qué tal tu día?", "Как прошёл твой день?", "smalltalk"],
  ["Estoy un poco cansado hoy", "Я сегодня немного устал", "emotion"],
  ["¿A qué te dedicas?", "Чем ты занимаешься?", "smalltalk"],
  ["Trabajo desde casa", "Я работаю из дома", "smalltalk"],
  ["¿Cuánto tiempo llevas aquí?", "Давно ты здесь?", "smalltalk", undefined, "сколько времени несёшь здесь"],
  ["Llevo dos meses en México", "Я два месяца в Мексике", "smalltalk"],
  ["¿Cuántos años tienes?", "Сколько тебе лет?", "smalltalk", undefined, "сколько лет имеешь"],
  ["Tengo mucho trabajo esta semana", "У меня много работы на этой неделе", "smalltalk"],
  ["¿Dónde nos encontramos?", "Где встретимся?", "question"],
  ["Estoy en camino", "Я уже в пути", "smalltalk"],
  ["Voy a llegar un poco tarde", "Я немного опоздаю", "smalltalk"],
  ["No te preocupes, no hay prisa", "Не переживай, спешить некуда", "politeness"],
  ["¿Te gustaría venir con nosotros?", "Хочешь пойти с нами?", "request"],
  ["Me gustaría mucho, gracias", "Я бы с удовольствием, спасибо", "politeness"],
  ["Lo siento, hoy no puedo", "Извини, сегодня не могу", "politeness"],
  ["Quizás la próxima vez", "Может быть, в следующий раз", "politeness"],
  ["Por supuesto, con mucho gusto", "Разумеется, с удовольствием", "agreement"],
  ["Prefiero quedarme en casa hoy", "Я лучше останусь сегодня дома", "opinion"],
  ["Creo que sí, pero no estoy seguro", "Думаю, да, но я не уверен", "opinion"],
  ["Me parece buena idea", "По-моему, хорошая идея", "opinion"],
  ["¿Qué opinas de esto?", "Что ты об этом думаешь?", "question"],
  ["No estoy de acuerdo contigo", "Я с тобой не согласен", "opinion"],
  ["Depende de la situación", "Смотря по ситуации", "opinion"],
  ["No sé cómo explicarlo", "Не знаю, как это объяснить", "problem"],
  ["Es difícil de explicar", "Это трудно объяснить", "opinion"],
];

/* -------------------------------------------------------------------------- */
/* Part 2 — shops, cafés, transport, somewhere to live                        */
/* -------------------------------------------------------------------------- */

const PART_2: PhraseRow[] = [
  ["¿Cuánto cuesta esto?", "Сколько это стоит?", "question", "shop"],
  ["¿Puedo pagar con tarjeta?", "Можно оплатить картой?", "question", "shop"],
  ["¿Me lo puede repetir, por favor?", "Повторите, пожалуйста", "request"],
  ["¿Hay alguien que hable inglés?", "Здесь кто-нибудь говорит по-английски?", "question"],
  ["Me lo llevo, gracias", "Я это беру, спасибо", "request", "shop"],
  ["Sólo estoy mirando, gracias", "Я просто смотрю, спасибо", "smalltalk", "shop"],
  ["¿Hay una farmacia cerca de aquí?", "Здесь рядом есть аптека?", "question", "street"],
  ["Creo que me perdí", "Кажется, я заблудился", "problem", "street"],
  ["¿Voy bien por aquí?", "Я правильно иду?", "question", "street"],
  ["¿Está lejos caminando?", "Пешком далеко?", "question", "street"],
  ["Estoy buscando esta dirección", "Я ищу этот адрес", "problem", "street"],
  ["¿Cuánto tarda en llegar?", "Сколько времени туда добираться?", "question", "street"],
  ["¿Este autobús va al centro?", "Этот автобус идёт в центр?", "question", "transport"],
  ["¿Dónde tengo que bajarme?", "Где мне выходить?", "question", "transport"],
  ["¿Puede parar aquí, por favor?", "Можете остановить здесь?", "request", "transport"],
  ["¿Cuánto cobra hasta el aeropuerto?", "Сколько до аэропорта?", "question", "transport"],
  ["¿Me avisa cuando lleguemos?", "Скажете, когда приедем?", "request", "transport"],
  ["¿Nos trae la carta, por favor?", "Принесёте нам меню?", "request", "cafe"],
  ["¿Qué me recomienda?", "Что вы посоветуете?", "question", "cafe"],
  ["Sin picante, por favor", "Без острого, пожалуйста", "request", "cafe"],
  ["Soy alérgico a los mariscos", "У меня аллергия на морепродукты", "problem", "cafe"],
  ["¿Está incluida la propina?", "Чаевые включены?", "question", "cafe"],
  ["¿Podemos pagar por separado?", "Можно заплатить раздельно?", "question", "cafe"],
  ["Estaba todo delicioso, gracias", "Всё было очень вкусно, спасибо", "opinion", "cafe"],
  ["Quisiera reservar una mesa para dos", "Я бы хотел забронировать столик на двоих", "request", "cafe"],
  ["¿A qué hora cierran hoy?", "Во сколько вы сегодня закрываетесь?", "question", "shop"],
  ["¿Están abiertos los domingos?", "Вы работаете по воскресеньям?", "question", "shop"],
  ["¿Tiene algo más barato?", "У вас есть что-нибудь подешевле?", "question", "shop"],
  ["¿Me puede dar un recibo?", "Можете дать чек?", "request", "shop"],
  ["¿Hay wifi? ¿Cuál es la contraseña?", "Есть вайфай? Какой пароль?", "question", "hotel"],
  ["Tengo una reserva a mi nombre", "У меня бронь на моё имя", "smalltalk", "hotel"],
  ["¿Puedo dejar la maleta aquí?", "Можно оставить здесь чемодан?", "question", "hotel"],
  ["¿A qué hora hay que dejar el cuarto?", "Во сколько нужно освободить номер?", "question", "hotel"],
  ["No me funciona el internet", "У меня не работает интернет", "problem"],
  ["El aire acondicionado no funciona", "Кондиционер не работает", "problem", "hotel"],
  ["Necesito una toalla más", "Мне нужно ещё одно полотенце", "request", "hotel"],
  ["¿Podría cambiarme de cuarto?", "Не могли бы вы меня переселить?", "request", "hotel"],
  ["Perdí mi celular, ¿qué hago?", "Я потерял телефон, что делать?", "problem"],
  ["Se me olvidó la mochila en el taxi", "Я забыл рюкзак в такси", "problem", "transport", "мне забылся рюкзак"],
  ["Creo que hay un error en la cuenta", "Кажется, в счёте ошибка", "problem", "shop"],
  ["Me cobraron de más", "С меня взяли лишнее", "problem", "shop"],
  ["¿Podemos arreglarlo ahora?", "Можем решить это сейчас?", "question"],
  ["¿Me puede ayudar un momento?", "Можете помочь мне на минутку?", "request"],
  ["Vuelvo en cinco minutos", "Я вернусь через пять минут", "smalltalk"],
  ["Ya casi termino", "Я почти закончил", "smalltalk"],
  ["¿Me lo puede envolver?", "Можете это завернуть?", "request", "shop"],
  ["¿Dónde se paga el recibo?", "Где оплачивают квитанцию?", "question"],
  ["Se fue la luz en todo el edificio", "Во всём доме отключился свет", "problem"],
  ["Hay una fuga de agua en el baño", "В ванной течёт вода", "problem"],
  ["¿Cuándo pasa el camión de la basura?", "Когда приезжает мусоровоз?", "question"],
];

/* -------------------------------------------------------------------------- */
/* Part 3 — the clinic, the paperwork, the road                               */
/* -------------------------------------------------------------------------- */

const PART_3: PhraseRow[] = [
  ["No me siento bien desde ayer", "Мне нездоровится со вчерашнего дня", "problem", "doctor"],
  ["Me duele la cabeza desde hace dos días", "У меня два дня болит голова", "problem", "doctor"],
  ["Tengo fiebre y me duele la garganta", "У меня температура и болит горло", "problem", "doctor"],
  ["Necesito una cita con el médico", "Мне нужна запись к врачу", "request", "doctor"],
  ["¿Tiene turno para hoy?", "Есть талон на сегодня?", "question", "doctor"],
  ["Es una emergencia, por favor", "Это срочно, пожалуйста", "problem", "doctor"],
  ["Soy alérgico a la penicilina", "У меня аллергия на пенициллин", "problem", "doctor"],
  ["¿Me puede dar una receta?", "Можете выписать рецепт?", "request", "doctor"],
  ["¿Cada cuánto tomo la pastilla?", "Как часто принимать таблетку?", "question", "doctor"],
  ["¿Esto lo cubre mi seguro?", "Это покрывает моя страховка?", "question", "doctor"],
  ["Estoy tomando estos medicamentos", "Я принимаю вот эти лекарства", "smalltalk", "doctor"],
  ["Creo que me intoxiqué con algo", "Кажется, я чем-то отравился", "problem", "doctor"],
  ["¿Dónde me hago los análisis?", "Где мне сдать анализы?", "question", "doctor"],
  ["¿Cuándo estarán los resultados?", "Когда будут результаты?", "question", "doctor"],
  ["¿Tengo que venir en ayunas?", "Нужно приходить натощак?", "question", "doctor"],
  ["¿Cuánto dura el tratamiento?", "Сколько длится лечение?", "question", "doctor"],
  ["Vengo a hacer un trámite", "Я пришёл оформить документы", "smalltalk", "migration"],
  ["¿Qué documentos tengo que traer?", "Какие документы нужно принести?", "question", "migration"],
  ["¿Dónde saco el turno?", "Где взять талон?", "question", "migration"],
  ["¿A qué ventanilla tengo que ir?", "В какое окошко мне идти?", "question", "migration"],
  ["¿Cuánto tarda el trámite?", "Сколько занимает оформление?", "question", "migration"],
  ["¿Dónde tengo que firmar?", "Где мне расписаться?", "question", "migration"],
  ["¿Cuándo tengo que volver?", "Когда мне нужно вернуться?", "question", "migration"],
  ["No entiendo qué me están pidiendo", "Я не понимаю, что от меня хотят", "problem", "migration"],
  ["¿Me lo puede explicar otra vez, por favor?", "Объясните ещё раз, пожалуйста", "request", "migration"],
  ["Creo que falta un documento", "Кажется, не хватает одного документа", "problem", "migration"],
  ["Vengo a renovar mi residencia", "Я пришёл продлить вид на жительство", "smalltalk", "migration"],
  ["Se me vence la visa el mes que viene", "У меня в следующем месяце истекает виза", "problem", "migration"],
  ["Necesito pedir una prórroga", "Мне нужно попросить продление", "request", "migration"],
  ["¿Puedo entregar los papeles después?", "Можно донести бумаги позже?", "question", "migration"],
  ["¿Puedo pedir la cita por internet?", "Можно записаться через интернет?", "question", "migration"],
  ["¿Necesito traducir estos documentos?", "Эти документы нужно переводить?", "question", "migration"],
  ["¿La copia tiene que estar certificada?", "Копия должна быть заверена?", "question", "migration"],
  ["¿Me puede sellar este comprobante?", "Можете поставить печать на квитанцию?", "request", "migration"],
  ["El carro no arranca", "Машина не заводится", "problem", "road"],
  ["Se me acabó la gasolina", "У меня кончился бензин", "problem", "road", "мне кончился бензин"],
  ["Se me ponchó una llanta", "У меня пробило колесо", "problem", "road"],
  ["¿Puede llamar a una grúa?", "Можете вызвать эвакуатор?", "request", "road"],
  ["¿Se puede estacionar en esta calle?", "На этой улице можно парковаться?", "question", "road"],
  ["¿Dónde puedo pagar la multa?", "Где можно оплатить штраф?", "question", "road"],
  ["Me multaron por estacionar aquí", "Меня оштрафовали за парковку здесь", "problem", "road"],
  ["Hay mucho tráfico a esta hora", "В это время большие пробки", "smalltalk", "road"],
  ["La calle está cerrada por obras", "Улица перекрыта из-за ремонта", "problem", "road"],
  ["¿Por dónde se va a la carretera?", "Как выехать на трассу?", "question", "road"],
  ["¿Cuál es el límite de velocidad aquí?", "Какое здесь ограничение скорости?", "question", "road"],
  ["Tenga cuidado, el camino está mojado", "Осторожно, дорога мокрая", "politeness", "road"],
  ["¿Me muestra su licencia, por favor?", "Покажите права, пожалуйста", "request", "road"],
  ["No traigo el pasaporte, sólo una copia", "Паспорта с собой нет, только копия", "problem", "road"],
  ["Tuve un accidente, nadie está herido", "Я попал в аварию, никто не пострадал", "problem", "road"],
  ["Necesito el reporte para el seguro", "Мне нужна справка для страховой", "request", "road"],
];

/* -------------------------------------------------------------------------- */
/* Part 4 — plans, invitations, saying no                                     */
/* -------------------------------------------------------------------------- */

const PART_4: PhraseRow[] = [
  ["¿Qué quieres hacer hoy?", "Чем хочешь сегодня заняться?", "question"],
  ["¿Cuál es el plan?", "Какой план?", "question"],
  ["¿Quieres ir de paseo?", "Хочешь пойти погулять?", "request"],
  ["¿Quieres venir?", "Хочешь прийти?", "request"],
  ["¿Tienen planes para más tarde?", "У вас есть планы на потом?", "question"],
  ["Vamos a salir a tomar algo", "Мы собираемся выйти выпить", "smalltalk"],
  ["Esta tarde quiero ir a nadar", "Сегодня днём хочу пойти поплавать", "smalltalk"],
  ["Vamos a correr mañana por la noche", "Завтра вечером пойдём на пробежку", "smalltalk"],
  ["¿Van a ver una película esta noche?", "Будете смотреть фильм сегодня вечером?", "question"],
  ["Podríamos ir al cine", "Мы могли бы сходить в кино", "opinion"],
  ["Me encantaría", "Я бы с удовольствием", "agreement"],
  ["Me encantaría, pero mañana tengo que levantarme temprano", "С удовольствием, но завтра мне рано вставать", "politeness"],
  ["Será estupendo", "Будет здорово", "emotion"],
  ["Eso espero", "Надеюсь", "opinion"],
  ["Hablamos más tarde", "Поговорим позже", "smalltalk"],
  ["No quiero hacer nada", "Я ничего не хочу делать", "emotion"],
  ["Quiere estar solo", "Он хочет побыть один", "description"],
  ["Está cansado, así que quiere quedarse en casa", "Он устал, поэтому хочет остаться дома", "description"],
  ["¿Quieres ayudarme?", "Хочешь мне помочь?", "request"],
  ["Necesito tu ayuda", "Мне нужна твоя помощь", "request"],
  ["¿Puedo hacerle una pregunta?", "Можно задать вам вопрос?", "request"],
  ["¿Con quién van a ir?", "С кем вы поедете?", "question"],
  ["¿Volverás antes o después de la cena?", "Вернёшься до или после ужина?", "question"],
  ["Mañana no iré a la escuela", "Завтра я не пойду в школу", "smalltalk"],
  ["Iré a Japón el próximo invierno", "Поеду в Японию следующей зимой", "smalltalk"],
  ["Vamos a ir a Francia en verano", "Летом поедем во Францию", "smalltalk"],
  ["Estaré en casa a las cuatro en punto", "Я буду дома ровно в четыре", "smalltalk"],
  ["Quiero ver a mi amigo", "Хочу увидеть друга", "smalltalk"],
  ["Tengo que hablar contigo", "Мне надо с тобой поговорить", "request"],
  ["Tienes que descansar", "Тебе надо отдохнуть", "opinion"],
  ["Hay que trabajar", "Надо работать", "opinion"],
  ["Hay que pensar", "Надо подумать", "opinion"],
  ["Tengo que pensar", "Мне надо подумать", "opinion"],
  ["Tengo que aprender a manejar", "Мне надо научиться водить", "smalltalk"],
  ["Empiezo a entender", "Начинаю понимать", "smalltalk"],
  ["¿En qué estás pensando?", "О чём ты думаешь?", "question"],
  ["No tiene sentido", "В этом нет смысла", "opinion"],
  ["¿Tiene sentido?", "В этом есть смысл?", "question"],
  ["No me importa", "Мне всё равно", "opinion"],
  ["Supongo que sí", "Пожалуй, да", "agreement"],
  ["¿O qué?", "Или как?", "question"],
  ["Cálmate", "Успокойся", "request"],
  ["Cállate", "Замолчи", "request"],
  ["Espere, por favor", "Подождите, пожалуйста", "request"],
  ["¡Gracias a Dios!", "Слава богу!", "emotion"],
  ["Cosas así", "И тому подобное", "description"],
  ["Por cierto", "Кстати", "smalltalk"],
  ["En realidad, ese es más grande", "На самом деле вон тот больше", "description"],
  ["Este es más barato", "Вот этот дешевле", "description"],
  ["Hay mucha gente", "Тут много народу", "description"],
];

/* -------------------------------------------------------------------------- */
/* Part 5 — time, numbers, schedules                                          */
/* -------------------------------------------------------------------------- */

const PART_5: PhraseRow[] = [
  ["¿Qué día de la semana es hoy?", "Какой сегодня день недели?", "time"],
  ["Hoy es lunes, así que mañana es martes", "Сегодня понедельник, значит завтра вторник", "time"],
  ["Su cumpleaños es el tres de febrero", "Его день рождения третьего февраля", "time"],
  ["Son las dos en punto", "Ровно два часа", "time"],
  ["Es la una menos cuarto", "Без четверти час", "time"],
  ["¿Cuánto dura?", "Сколько длится?", "time"],
  ["¿Cuánto dura la película?", "Сколько идёт фильм?", "time"],
  ["Dos horas, veinte minutos y cinco segundos", "Два часа двадцать минут пять секунд", "time"],
  ["El vuelo se retrasó", "Рейс задержали", "problem", "transport"],
  ["Hace tres semanas", "Три недели назад", "time"],
  ["Durante dos meses", "В течение двух месяцев", "time"],
  ["Dentro de dos horas", "Через два часа", "time"],
  ["El año pasado", "В прошлом году", "time"],
  ["La última vez", "В прошлый раз", "time"],
  ["Anoche", "Прошлой ночью", "time"],
  ["Para siempre", "Навсегда", "time"],
  ["A tiempo", "Вовремя", "time"],
  ["Dos mil uno", "Две тысячи первый", "quantity"],
  ["Dos mil diecisiete", "Две тысячи семнадцатый", "quantity"],
  ["Mil novecientos cuarenta y cinco", "Тысяча девятьсот сорок пятый", "quantity"],
  ["Mi equipaje pesa demasiado", "Мой багаж весит слишком много", "problem", "transport"],
  ["¡Pesa una tonelada!", "Весит тонну!", "emotion"],
  ["Peso tres kilos de más", "Я вешу на три кило больше, чем надо", "description"],
  ["Pesa sesenta kilos", "Весит шестьдесят кило", "quantity"],
  ["Mide un metro setenta y cinco", "Рост метр семьдесят пять", "quantity"],
  ["¿Cuántas sillas hay en la sala?", "Сколько стульев в гостиной?", "quantity"],
  ["¿Cuánta leche hay en el refrigerador?", "Сколько молока в холодильнике?", "quantity"],
  ["¿Sabes dónde están mis llaves?", "Знаешь, где мои ключи?", "question"],
  ["Tus llaves están debajo del sofá", "Твои ключи под диваном", "description"],
  ["El gimnasio está aquí mismo", "Спортзал прямо здесь", "description"],
  ["Claro que tengo agua", "Конечно, у меня есть вода", "agreement"],
  ["Aquí tienes", "Вот, держи", "politeness"],
  ["Me trae la cuenta, por favor", "Принесите счёт, пожалуйста", "request", "cafe"],
  ["Queremos algo de comer, por favor", "Мы бы хотели чего-нибудь поесть", "request", "cafe"],
  ["Pedimos cuatro entradas", "Мы заказали четыре закуски", "smalltalk", "cafe"],
  ["El cliente siempre tiene razón", "Клиент всегда прав", "opinion"],
  ["Quiero comprarte algo", "Хочу тебе кое-что купить", "smalltalk"],
  ["Tenemos que ir en taxi", "Нам нужно поехать на такси", "smalltalk", "transport"],
  ["Tienes que tener un boleto y una visa", "Тебе нужны билет и виза", "smalltalk", "migration"],
  ["Tienes que mostrar tu pasaporte en el aeropuerto", "Нужно предъявить паспорт в аэропорту", "smalltalk", "migration"],
  ["¿Qué ciudad deberíamos visitar?", "Какой город нам стоит посетить?", "question"],
  ["Odio lavar la ropa", "Ненавижу стирать", "opinion"],
  ["Irse a casa", "Идти домой", "smalltalk"],
  ["Salir a comer", "Выйти поесть", "smalltalk"],
  ["Tomar algo", "Выпить чего-нибудь", "smalltalk"],
  ["Quedarse despierto", "Не ложиться спать", "smalltalk"],
  ["Quedarse dormido", "Заснуть", "smalltalk"],
  ["Ir de paseo", "Идти на прогулку", "smalltalk"],
  ["¿Cuál es el plan para mañana?", "Какой план на завтра?", "question"],
  ["Nadie quiere quedar conmigo", "Никто не хочет со мной встретиться", "emotion"],
];

/* -------------------------------------------------------------------------- */
/* Part 6 — health, tastes, the past                                          */
/* -------------------------------------------------------------------------- */

const PART_6: PhraseRow[] = [
  ["No me siento bien", "Я плохо себя чувствую", "problem", "doctor"],
  ["Me duele el brazo", "У меня болит рука", "problem", "doctor"],
  ["¡Mejórate pronto!", "Выздоравливай скорее!", "politeness", "doctor"],
  ["Deberías ver a un médico", "Тебе стоит сходить к врачу", "opinion", "doctor"],
  ["El médico cree que necesita medicina", "Врач считает, что вам нужно лекарство", "description", "doctor"],
  ["Llama a una ambulancia", "Вызови скорую", "problem", "doctor"],
  ["¡Ten cuidado!", "Осторожно!", "politeness"],
  ["¿Qué te encanta hacer?", "Что тебе очень нравится делать?", "question"],
  ["¿A tu amigo le gustan las comedias?", "Твоему другу нравятся комедии?", "question"],
  ["Prefiere los dramas", "Он предпочитает драмы", "opinion"],
  ["Me gustan los dramas, pero prefiero las comedias", "Мне нравятся драмы, но комедии больше", "opinion"],
  ["¿Qué tipo de películas prefiere tu amigo?", "Какие фильмы предпочитает твой друг?", "question"],
  ["Le interesan los idiomas", "Он интересуется языками", "description"],
  ["Montar en bicicleta", "Кататься на велосипеде", "smalltalk"],
  ["Tocar la guitarra", "Играть на гитаре", "smalltalk"],
  ["Tocar el piano", "Играть на пианино", "smalltalk"],
  ["El hockey sobre hielo", "Хоккей на льду", "description"],
  ["El libro policíaco", "Детектив", "description"],
  ["Jugamos al bádminton los miércoles", "По средам мы играем в бадминтон", "smalltalk"],
  ["Hacer senderismo", "Ходить в походы", "smalltalk"],
  ["Hacer rafting", "Сплавляться по реке", "smalltalk"],
  ["Ayer ayudé a mi vecina en la cocina", "Вчера я помогала соседке на кухне", "smalltalk"],
  ["Esperamos dos semanas", "Мы прождали две недели", "smalltalk"],
  ["Estudié dos meses en Japón", "Я училась два месяца в Японии", "smalltalk"],
  ["Vivieron en China durante ocho años", "Они прожили в Китае восемь лет", "smalltalk"],
  ["Escribí un libro hace dos años", "Я написала книгу два года назад", "smalltalk"],
  ["La última vez tomamos un taxi", "В прошлый раз мы взяли такси", "smalltalk", "transport"],
  ["¿Quién se comió mi pastel?", "Кто съел мой торт?", "question"],
  ["Me gustaron mucho los pasteles y el chocolate", "Мне очень понравились пирожные и шоколад", "opinion", "cafe"],
  ["¿Cómo estuvieron tus vacaciones?", "Как прошёл твой отпуск?", "question"],
  ["¿Por qué fuiste a Europa?", "Почему ты поехала в Европу?", "question"],
  ["Porque es un lugar muy interesante", "Потому что это очень интересное место", "opinion"],
  ["¿Qué te gustó más?", "Что понравилось больше всего?", "question"],
  ["Emocionante", "Волнующий", "description"],
  ["Divertido", "Весёлый, смешной", "description"],
  ["Aburrido", "Скучный", "description"],
  ["Gracioso", "Забавный", "description"],
  ["Extraño", "Странный", "description"],
  ["Pesado y ligero", "Тяжёлый и лёгкий", "description"],
  ["Mejor y peor", "Лучше и хуже", "description"],
  ["El mejor y el peor", "Лучший и худший", "description"],
  ["Tener miedo", "Бояться", "emotion"],
  ["Tener razón", "Быть правым", "opinion"],
  ["Tener hambre", "Быть голодным", "emotion"],
  ["Ni en un millón de años", "Ни за что в жизни", "opinion"],
  ["Junto a la ventana", "Рядом с окном", "description"],
  ["En vez de trabajar", "Вместо того чтобы работать", "description"],
  ["Los demás ya se fueron", "Остальные уже ушли", "description"],
  ["Todavía no", "Ещё нет", "agreement"],
  ["Así que nos vamos", "Так что мы уходим", "description"],
];


/* -------------------------------------------------------------------------- */
/* Verb constructions — the frames the language is actually spoken in         */
/* -------------------------------------------------------------------------- */

/**
 * Perífrasis verbales: the frame alone, with nothing hanging off it.
 *
 * These were whole sentences — "Tengo que trabajar mañana" — and that was one
 * thing too many. The frame is the difficulty: what "tengo que" does, how it
 * differs from "hay que" and from "no debes". Wrapping each one in an errand
 * meant the errand had to be recalled too, and a card that tests two things
 * tells you nothing when it fails.
 *
 * So: the construction in the person and polarity that matter, and its
 * meaning. "tengo que — мне нужно". The infinitive it governs is any verb
 * already known, which is the point of learning a frame at all.
 *
 * Left out are the frames that mean nothing without their complement:
 * `estar` + gerund, `seguir` + gerund and `llevar` + a length of time carry
 * their sense in the part that would have to be cut, so a fragment of them
 * teaches nothing.
 *
 * The fourth field names the pattern, so the shape is visible rather than
 * inferred from an example that is no longer there.
 */
const VERB_PERIPHRASES: PhraseRow[] = [
  // --- Обязанность: у tener que она личная, у hay que — ничья ------------
  ["tengo que", "мне нужно", "description", "tener que + инфинитив"],
  ["tienes que", "тебе нужно", "description", "tener que + инфинитив"],
  ["tiene que", "ему нужно", "description", "tener que + инфинитив"],
  ["tenemos que", "нам нужно", "description", "tener que + инфинитив"],
  ["tienen que", "им нужно", "description", "tener que + инфинитив"],
  ["no tengo que", "мне не нужно", "description", "отрицание: обязанности нет"],
  ["no tienes que", "тебе не нужно", "description", "отрицание: обязанности нет"],
  ["tenía que", "мне нужно было", "description", "tener que в прошедшем"],
  ["hay que", "нужно", "opinion", "hay que + инфинитив: без лица"],
  ["no hay que", "не нужно", "opinion", "hay que + инфинитив: без лица"],
  ["había que", "нужно было", "opinion", "hay que в прошедшем"],

  // --- Долг и совет ------------------------------------------------------
  ["debo", "я должен", "description", "deber + инфинитив"],
  ["debes", "ты должен", "opinion", "deber + инфинитив"],
  ["debe", "он должен", "opinion", "deber + инфинитив"],
  ["debemos", "мы должны", "opinion", "deber + инфинитив"],
  ["no debes", "тебе не стоит", "opinion", "запрет, а не отсутствие нужды"],
  ["no debo", "мне не стоит", "opinion", "запрет, а не отсутствие нужды"],
  ["deberías", "тебе стоило бы", "opinion", "deber в условном: мягкий совет"],
  ["necesito", "мне надо (я нуждаюсь)", "description", "necesitar + инфинитив"],
  ["necesitas", "тебе надо (ты нуждаешься)", "description", "necesitar + инфинитив"],

  // --- Возможность и умение ---------------------------------------------
  ["puedo", "я могу", "description", "poder + инфинитив"],
  ["puedes", "ты можешь", "description", "poder + инфинитив"],
  ["puede", "он может", "description", "poder + инфинитив"],
  ["podemos", "мы можем", "description", "poder + инфинитив"],
  ["pueden", "они могут", "description", "poder + инфинитив"],
  ["no puedo", "я не могу", "problem", "poder + инфинитив"],
  ["no puedes", "ты не можешь", "problem", "poder + инфинитив"],
  ["¿puedo?", "можно мне?", "question", "просьба о разрешении"],
  ["¿puedes?", "можешь?", "question", "просьба"],
  ["podría", "я мог бы", "description", "poder в условном"],
  ["¿podría?", "не могли бы Вы?", "request", "вежливая просьба"],
  ["¿podrías?", "не мог бы ты?", "request", "вежливая просьба на «ты»"],
  ["se puede", "можно", "question", "безлично: разрешено ли"],
  ["no se puede", "нельзя", "problem", "безлично: не разрешено"],
  ["sé", "я умею", "description", "saber + инфинитив: умение, не «знать»"],
  ["sabes", "ты умеешь", "description", "saber + инфинитив"],
  ["no sé", "я не умею", "description", "saber + инфинитив"],

  // --- Желание и намерение ----------------------------------------------
  ["quiero", "я хочу", "description", "querer + инфинитив"],
  ["quieres", "ты хочешь", "description", "querer + инфинитив"],
  ["quiere", "он хочет", "description", "querer + инфинитив"],
  ["queremos", "мы хотим", "description", "querer + инфинитив"],
  ["no quiero", "я не хочу", "description", "querer + инфинитив"],
  ["quisiera", "я хотел бы", "request", "querer в условном: вежливо"],
  ["me gustaría", "мне бы хотелось", "request", "gustar в условном"],
  ["te gustaría", "тебе бы хотелось", "question", "gustar в условном"],
  ["tengo ganas de", "мне хочется", "emotion", "tener ganas de + инфинитив"],
  ["no tengo ganas de", "мне не хочется", "emotion", "tener ganas de + инфинитив"],
  ["pienso", "я собираюсь", "description", "pensar + инфинитив: намерение"],
  ["piensas", "ты собираешься", "question", "pensar + инфинитив: намерение"],

  // --- Ближайшее будущее -------------------------------------------------
  ["voy a", "я буду, я собираюсь", "description", "ir a + инфинитив"],
  ["vas a", "ты будешь", "description", "ir a + инфинитив"],
  ["va a", "он будет", "description", "ir a + инфинитив"],
  ["vamos a", "мы будем", "description", "ir a + инфинитив"],
  ["van a", "они будут", "description", "ir a + инфинитив"],
  ["no voy a", "я не буду", "description", "ir a + инфинитив"],
  ["iba a", "я собирался", "description", "ir a в прошедшем"],
  ["está a punto de", "вот-вот", "description", "estar a punto de + инфинитив"],

  // --- Начало, повтор, конец --------------------------------------------
  ["empiezo a", "я начинаю", "description", "empezar a + инфинитив"],
  ["empieza a", "он начинает", "description", "empezar a + инфинитив"],
  ["acabo de", "я только что", "description", "acabar de + инфинитив"],
  ["acabas de", "ты только что", "description", "acabar de + инфинитив"],
  ["acaba de", "он только что", "description", "acabar de + инфинитив"],
  ["vuelvo a", "я снова", "description", "volver a + инфинитив: сделать снова"],
  ["vuelve a", "он снова", "description", "volver a + инфинитив"],
  ["no vuelvas a", "больше не", "request", "volver a + инфинитив, запрет"],
  ["dejo de", "я перестаю", "description", "dejar de + инфинитив"],
  ["deja de", "перестань", "request", "dejar de + инфинитив, повеление"],
  ["no dejes de", "не переставай", "request", "dejar de + инфинитив, отрицание"],
  ["termino de", "я заканчиваю", "description", "terminar de + инфинитив"],

  // --- Привычка ----------------------------------------------------------
  ["suelo", "я обычно", "description", "soler + инфинитив: по привычке"],
  ["sueles", "ты обычно", "description", "soler + инфинитив"],
  ["suele", "он обычно", "description", "soler + инфинитив"],
  ["aprendo a", "я учусь", "description", "aprender a + инфинитив"],
  ["ayudo a", "я помогаю", "description", "ayudar a + инфинитив"],
];

const ALL_ROWS: PhraseRow[] = [
  ...PART_1,
  ...PART_2,
  ...PART_3,
  ...PART_4,
  ...PART_5,
  ...PART_6,
];

export const PHRASES: PhraseEntry[] = ALL_ROWS.map(([es, ru, fn, situation, literal], i) => ({
  id: `ph.${i + 1}`,
  es,
  ru,
  fn,
  rank: i + 1,
  cefr: i < 50 ? "A1" : "A2",
  ...(situation ? { situation } : {}),
  ...(literal ? { literal } : {}),
}));

/** Start of the rank band reserved for verb constructions. */
export const PERIPHRASIS_RANK_BASE = 2000;

/**
 * The verb constructions as cards.
 *
 * Their own id namespace and their own rank band, deliberately far above the
 * numbered parts. Phrase ids are positional (`ph.12`), so slipping fifty rows
 * into the front of the main list would renumber every phrase after them and
 * silently hand each card someone else's progress. A separate band cannot
 * collide, and the section can be reordered or extended without touching
 * anything already learned.
 */
export const PERIPHRASES: PhraseEntry[] = VERB_PERIPHRASES.map(
  ([es, ru, fn, situation, literal], i) => ({
    id: `ph.per.${i + 1}`,
    es,
    ru,
    fn,
    rank: PERIPHRASIS_RANK_BASE + i + 1,
    cefr: "A1" as const,
    ...(situation ? { situation } : {}),
    ...(literal ? { literal } : {}),
  }),
);

export const PERIPHRASIS_RANGE: [number, number] = [
  PERIPHRASIS_RANK_BASE + 1,
  PERIPHRASIS_RANK_BASE + PERIPHRASES.length,
];

/** Phrases per deck: "Часть 1" holds ranks 1-50, and so on. */
export const PHRASE_PART_SIZE = 50;

export const PHRASE_TOTAL = PHRASES.length;

/** Short subtitle for each part, so the deck name says what is inside. */
export const PHRASE_PART_SUBTITLES: string[] = [
  "Знакомство и разговор",
  "Город, покупки, жильё",
  "Врач, документы, дорога",
  "Планы, встречи, отказы",
  "Время, числа, расписание",
  "Самочувствие, вкусы, прошлое",
];

/* -------------------------------------------------------------------------- */
/* Held back for later                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Phrases above A2, kept but not yet taught.
 *
 * These need the perfect, the gerund with `pasarla`, impersonal `dar` or
 * `soler` — machinery that has no place before B1. They are stored rather than
 * discarded so the list survives; wiring them into a deck is a one-line change
 * once a B1 level exists.
 */
export const B1_PHRASES: PhraseEntry[] = (
  [
    ["¿Cuándo se van?", "Когда вы уезжаете?", "question"],
    ["Solemos ir al extranjero en invierno", "Обычно мы ездим за границу зимой", "smalltalk"],
    ["La paso bien jugando fútbol", "Мне в кайф играть в футбол", "opinion"],
    ["La pasa bien jugando bádminton, pero le gusta más navegar", "Ему нравится бадминтон, но больше — ходить под парусом", "opinion"],
    ["Es bueno tocando el piano", "Он хорошо играет на пианино", "description"],
    ["Soy malo contando chistes", "У меня плохо получается шутить", "description"],
    ["Son buenos en muchas cosas", "У них много чего хорошо получается", "description"],
    ["Nos la pasamos muy bien haciendo paracaidismo", "Нам очень понравилось прыгать с парашютом", "opinion"],
    ["Tenemos ganas de verte", "Не терпится тебя увидеть", "emotion"],
    ["Tenemos ganas de conocerte", "Не терпится с тобой познакомиться", "emotion"],
    ["Le da vergüenza hablar de sus relaciones", "Ему стыдно говорить о своих отношениях", "description"],
    ["Ya le preguntamos eso", "Мы его уже об этом спрашивали", "smalltalk"],
    ["El restaurante indio fue definitivamente el mejor", "Индийский ресторан был определённо лучшим", "opinion"],
    ["Lo que sea", "Да что угодно", "opinion"],
    ["De alguna manera", "Как-то, в каком-то роде", "description"],
    ["Hacer paracaidismo", "Прыгать с парашютом", "smalltalk"],
    ["Deberíamos hablar del asunto", "Нам стоит обсудить этот вопрос", "opinion"],
  ] as PhraseRow[]
).map(([es, ru, fn, situation, literal], i) => ({
  id: `ph.b1.${i + 1}`,
  es,
  ru,
  fn,
  rank: 1000 + i,
  cefr: "B1" as const,
  ...(situation ? { situation } : {}),
  ...(literal ? { literal } : {}),
}));
