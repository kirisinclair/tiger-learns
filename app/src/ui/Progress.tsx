import { useMemo } from "react";
import { CONTENT } from "../content";
import {
  dueForecast,
  goalStreak,
  grammarProgress,
  hardCards,
  knownCount,
  levelEstimate,
  recentDays,
  vocabularyProgress,
  type Buckets,
} from "../domain/progress";
import type { CardState } from "../domain/srs";
import type { DayRecord, Settings, Stats } from "../storage/progressStore";

interface Props {
  cards: Map<string, CardState>;
  stats: Stats;
  history: DayRecord[];
  settings: Settings;
}

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** A bar split into learned / learning / untouched. */
function BucketBar({ buckets }: { buckets: Buckets }) {
  if (buckets.total === 0) return null;
  const pct = (n: number) => `${(n / buckets.total) * 100}%`;
  return (
    <div className="bucket-bar" role="img" aria-label={`${knownCount(buckets)} из ${buckets.total}`}>
      {/* Switched off first: it is the most settled part of the bar, and
          showing it in grey keeps green meaning "earned here". */}
      <span className="bucket-bar__retired" style={{ width: pct(buckets.retired) }} />
      <span className="bucket-bar__mature" style={{ width: pct(buckets.mature) }} />
      <span className="bucket-bar__young" style={{ width: pct(buckets.young) }} />
      <span className="bucket-bar__learning" style={{ width: pct(buckets.learning) }} />
    </div>
  );
}

/**
 * The one screen that answers "am I getting anywhere".
 *
 * Everything here except the daily history is derived from the cards on the
 * spot, so it cannot drift out of step with them. The history is the only
 * stored part, because yesterday is the one thing today cannot be asked about.
 */
export function Progress({ cards, stats, history, settings }: Props) {
  const now = Date.now();

  const vocab = useMemo(() => vocabularyProgress(CONTENT, cards), [cards]);
  const grammar = useMemo(() => grammarProgress(cards), [cards]);
  const hard = useMemo(() => hardCards(CONTENT, cards, 8), [cards]);
  const forecast = useMemo(() => dueForecast(cards, now, 7), [cards, now]);
  const days = useMemo(() => recentDays(history, now, 30), [history, now]);

  const goal = settings.dailyGoal;
  const done = Math.min(stats.reviewsToday, goal);
  const ringPct = goal > 0 ? Math.min(1, stats.reviewsToday / goal) : 0;
  const streakByGoal = goalStreak(history, goal, now);

  const known = knownCount(vocab.both);
  // On words alone: the published thresholds are about words, and they are the
  // half of the count that compares to anything outside this app.
  const level = levelEstimate(knownCount(vocab.words));
  const busiest = Math.max(1, ...days.map((d) => d.reviews));
  const maxDue = Math.max(1, ...forecast);
  const accuracy =
    stats.totalReviews > 0 ? Math.round((stats.totalCorrect / stats.totalReviews) * 100) : 0;

  return (
    <div className="progress">
      {/* Today, and whether the day counts. */}
      <section className="progress__today">
        <div
          className="goal-ring"
          style={{ ["--fill" as string]: `${ringPct * 360}deg` }}
          role="img"
          aria-label={`${stats.reviewsToday} из ${goal} за сегодня`}
        >
          <div className="goal-ring__inner">
            <span className="goal-ring__value">{stats.reviewsToday}</span>
            <span className="goal-ring__goal">из {goal}</span>
          </div>
        </div>

        <div className="progress__today-text">
          <p className="progress__headline">
            {stats.reviewsToday >= goal
              ? "Норма на сегодня сделана"
              : `Осталось ${goal - done} ${plural(goal - done, "повтор", "повтора", "повторов")}`}
          </p>
          <p className="progress__muted">
            Норма подряд: {streakByGoal} {plural(streakByGoal, "день", "дня", "дней")} · дней
            занятий подряд: {stats.streak} · рекорд {stats.bestStreak}
          </p>
          <p className="progress__muted">
            Всего ответов: {stats.totalReviews} · верных {accuracy}%
          </p>
        </div>
      </section>

      {/* The headline number: things that can be said. */}
      <section className="progress__card">
        <h2 className="progress__title">Словарный запас</h2>
        <p className="progress__big">
          {known}
          <span className="progress__big-unit">
            {" "}
            {plural(known, "единица", "единицы", "единиц")} из {vocab.both.total} уверенно
            {/* Named rather than hidden: these are known words too, and a
                reader who has just switched twenty off should be able to see
                where they went. */}
            {vocab.both.retired > 0 ? ` (${vocab.both.retired} выключено)` : ""}
          </span>
        </p>
        <p className="progress__level">
          Примерный уровень: <strong>{level.level}</strong>
          {level.next ? ` · до ${level.next} ещё ${level.remaining} ${plural(level.remaining, "слово", "слова", "слов")}` : ""}
        </p>
        <p className="progress__muted">
          Оценка по числу известных слов, и только по нему: грамматика в неё не входит, а
          выученное вне приложения ему не видно. Поэтому это ориентир, а не диагноз.
        </p>
        <p className="progress__muted">
          Считаются слова и фразы, отвеченные верно дважды подряд и вышедшие на интервальное
          повторение, плюс выключенные вручную — их выключают как раз потому, что уже знают.
          Спряжения сюда не входят — они ниже, отдельно.
        </p>

        <div className="progress__rows">
          <div className="progress__row">
            <span className="progress__row-label">Слова</span>
            <BucketBar buckets={vocab.words} />
            <span className="progress__row-value">
              {knownCount(vocab.words)} / {vocab.words.total}
            </span>
          </div>
          <div className="progress__row">
            <span className="progress__row-label">Фразы</span>
            <BucketBar buckets={vocab.phrases} />
            <span className="progress__row-value">
              {knownCount(vocab.phrases)} / {vocab.phrases.total}
            </span>
          </div>
          <div className="progress__row">
            <span className="progress__row-label">Из частотных</span>
            <span className="progress__row-value progress__row-value--wide">
              {vocab.frequencyKnown} из {vocab.frequencyTotal}
            </span>
          </div>
        </div>

        <p className="progress__legend">
          <span className="legend-dot legend-dot--mature" /> знаю уверенно
          <span className="legend-dot legend-dot--young" /> держится
          <span className="legend-dot legend-dot--learning" /> учится
          <span className="legend-dot legend-dot--retired" /> выключено
        </p>
      </section>

      {/* Grammar, counted as work rather than as territory. */}
      <section className="progress__card">
        <h2 className="progress__title">Спряжения</h2>
        <p className="progress__big">
          {grammar.reps}
          <span className="progress__big-unit">
            {" "}
            {plural(grammar.reps, "повтор", "повтора", "повторов")}
          </span>
        </p>
        <p className="progress__muted">
          Здесь считается работа, а не покрытие: форм в языке тысячи, и доля от них ничего не
          говорит о том, легло ли настоящее время. {grammar.verbs}{" "}
          {plural(grammar.verbs, "глагол", "глагола", "глаголов")} в работе, {grammar.formsHeld}{" "}
          {plural(grammar.formsHeld, "форма держится", "формы держатся", "форм держатся")} из{" "}
          {grammar.formsMet} встреченных.
        </p>
      </section>

      {/* The last month of work. */}
      <section className="progress__card">
        <h2 className="progress__title">Последние 30 дней</h2>
        {history.length === 0 ? (
          <p className="progress__muted">
            История ведётся с сегодняшнего дня — за прошлое взять неоткуда. Через неделю здесь
            будет виден график.
          </p>
        ) : (
          <>
            <div className="day-chart">
              {days.map((day) => (
                <div
                  className="day-chart__col"
                  key={day.day}
                  title={`${day.day}: ${day.reviews} повторов, верных ${day.correct}`}
                >
                  <span
                    className={`day-chart__bar${day.reviews >= goal ? " day-chart__bar--goal" : ""}`}
                    style={{ height: `${(day.reviews / busiest) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="progress__muted">
              Столбик закрашен полностью, когда норма за тот день сделана. Наведи курсор, чтобы
              увидеть числа.
            </p>
          </>
        )}
      </section>

      {/* What the next week will ask for. */}
      <section className="progress__card">
        <h2 className="progress__title">Что созреет</h2>
        <div className="forecast">
          {forecast.map((count, offset) => {
            const date = new Date(now + offset * 24 * 60 * 60 * 1000);
            return (
              <div className="forecast__col" key={offset}>
                <span className="forecast__count">{count}</span>
                <span
                  className="forecast__bar"
                  style={{ height: `${(count / maxDue) * 100}%` }}
                />
                <span className="forecast__day">
                  {offset === 0 ? "сегодня" : WEEKDAYS[(date.getDay() + 6) % 7]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trouble spots, if any have earned the name. */}
      {hard.length > 0 && (
        <section className="progress__card">
          <h2 className="progress__title">Не даётся</h2>
          <ul className="hard-list">
            {hard.map((row) => (
              <li className="hard-list__item" key={row.id}>
                <span className="hard-list__text">{describe(row.ref)}</span>
                <span className="hard-list__count">
                  забыто {row.lapses} {plural(row.lapses, "раз", "раза", "раз")}
                </span>
              </li>
            ))}
          </ul>
          <p className="progress__muted">
            Это не приговор карточке: пара забываний — норма для нового слова. В списке те,
            которые возвращаются чаще прочих.
          </p>
        </section>
      )}
    </div>
  );
}

/** A card named the way the learner met it, not by its internal id. */
function describe(ref: { kind: string } & Record<string, unknown>): string {
  switch (ref.kind) {
    case "lexeme": {
      const lex = CONTENT.lexemes.get(ref.lexemeId as string);
      return lex ? `${lex.es} — ${lex.ru[0]}` : String(ref.lexemeId);
    }
    case "phrase": {
      const phrase = CONTENT.phrases.get(ref.phraseId as string);
      return phrase ? phrase.es : String(ref.phraseId);
    }
    case "verbMeaning": {
      const verb = CONTENT.verbs.get(ref.verbId as string);
      return verb ? `${verb.infinitive} — ${verb.ru[0]}` : String(ref.verbId);
    }
    case "conjugation": {
      const verb = CONTENT.verbs.get(ref.verbId as string);
      return verb ? `${verb.infinitive}, ${ref.person}` : String(ref.verbId);
    }
    default:
      return "";
  }
}
