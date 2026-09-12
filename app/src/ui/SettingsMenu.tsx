import { useEffect, useRef, useState } from "react";
import type { Settings } from "../storage/progressStore";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  /** Writes the whole progress file to disk. */
  onExport: () => void;
  onImport: (file: File) => void;
}

/**
 * The one place where everything about the session lives.
 *
 * It used to be a flag next to the logo, which said "language" and meant
 * "settings" — nobody would look there for how exercises advance. A hamburger
 * after the stats says what it is, and the flag menu's contents moved in with
 * it rather than staying behind as a second, half-empty menu.
 */
export function SettingsMenu({ settings, onChange, onExport, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Escape closes it, like every other menu on the machine.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="settings-menu">
      <button
        className="settings-menu__button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Настройки"
        title="Настройки"
      >
        ☰
      </button>

      {open && (
        <>
          {/* Catches the click that closes the menu, so it never covers
              anything the next click was aimed at. */}
          <div className="settings-menu__backdrop" onClick={() => setOpen(false)} />

          <div className="settings-menu__panel" role="menu">
            <p className="settings-menu__heading">Настройки сессии</p>

            {/*
              One choice shown as two switches.
              They are the two halves of the same decision — turning one off is
              turning the other on — so both are always visible and the state
              of each says what will happen.
            */}
            <label className="settings-menu__toggle">
              <input
                type="checkbox"
                checked={settings.advance === "auto"}
                onChange={() => onChange({ advance: "auto" })}
              />
              <span>Автоматическое переключение упражнений</span>
            </label>
            <label className="settings-menu__toggle">
              <input
                type="checkbox"
                checked={settings.advance === "enter"}
                onChange={() => onChange({ advance: "enter" })}
              />
              <span>Переключение упражнений по Enter</span>
            </label>
            <p className="settings-menu__note">
              {settings.advance === "auto"
                ? "Верный ответ — через секунду, неверный — через три."
                : "Ответ остаётся на экране, пока ты не нажмёшь Enter. При вводе с клавиатуры первый Enter проверяет, второй переключает."}
            </p>

            <hr className="settings-menu__rule" />

            {/*
              A target, not a limit: passing it closes the ring and nothing
              stops. Editable because the right number is personal — ten
              minutes for one person is thirty answers and for another sixty.
            */}
            <label className="settings-menu__goal">
              <span>Норма повторов в день</span>
              <input
                type="number"
                min={5}
                max={500}
                step={5}
                value={settings.dailyGoal}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  // An empty box parses as 0; keeping the old value means the
                  // field can be cleared and retyped without the goal jumping
                  // to nothing in between.
                  if (Number.isFinite(value) && value > 0) {
                    onChange({ dailyGoal: Math.min(500, Math.round(value)) });
                  }
                }}
              />
            </label>

            <hr className="settings-menu__rule" />

            <button
              className="settings-menu__option"
              onClick={() => onChange({ soundEnabled: !settings.soundEnabled })}
            >
              <span>{settings.soundEnabled ? "🔊" : "🔇"}</span>
              <span>{settings.soundEnabled ? "Выключить озвучку" : "Включить озвучку"}</span>
            </button>
            <button
              className="settings-menu__option"
              onClick={() => {
                onExport();
                setOpen(false);
              }}
            >
              <span>💾</span>
              <span>Сохранить прогресс в файл</span>
            </button>
            <button className="settings-menu__option" onClick={() => fileRef.current?.click()}>
              <span>📂</span>
              <span>Загрузить прогресс из файла</span>
            </button>
            <button className="settings-menu__option" aria-disabled="true">
              <span>🇲🇽</span>
              <span>Испанский, ЛА</span>
            </button>
            <button className="settings-menu__option" aria-disabled="true">
              <span>🇬🇧</span>
              <span>Другие языки — позже</span>
            </button>
          </div>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onImport(file);
            setOpen(false);
          }
          // Allows re-selecting the same file after a failed attempt.
          event.target.value = "";
        }}
      />
    </div>
  );
}
