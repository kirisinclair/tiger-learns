import { useEffect } from "react";

/**
 * Closes an overlay on Escape.
 *
 * Every dialog needs this and none of them should have to remember it, so it
 * lives here rather than being copied into each one. The listener is capturing:
 * the practice screen also watches for keys on the window, and a dialog on top
 * of it should swallow the key rather than let it reach the exercise
 * underneath.
 */
export function useEscape(onClose: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);
}
