"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { MAX_TITLE_LENGTH } from "@/lib/todos";

/**
 * A textarea that grows with its content.
 * Enter submits; Shift+Enter or Ctrl+Enter adds a new line; Esc cancels.
 */
export function MultilineInput({
  id,
  value,
  onChange,
  onSubmit,
  onCancel,
  onBlur,
  placeholder,
  autoFocus,
  disabled,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow (and shrink) with the text; past the max height it scrolls.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  /** Inserts a line break at the cursor (Ctrl+Enter does not do that on its own). */
  function insertNewLine() {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = value.slice(0, start) + "\n" + value.slice(end);
    if (next.length > MAX_TITLE_LENGTH) return;
    onChange(next);
    requestAnimationFrame(() => el.setSelectionRange(start + 1, start + 1));
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      if (e.shiftKey) return; // the browser inserts the new line
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) insertNewLine();
      else onSubmit();
    } else if (e.key === "Escape" && onCancel) {
      e.preventDefault();
      onCancel();
    }
  }

  return (
    <textarea
      ref={ref}
      id={id}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      maxLength={MAX_TITLE_LENGTH}
      autoComplete="off"
      className={`block max-h-60 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent outline-none placeholder:text-zinc-400 disabled:cursor-wait ${className}`}
    />
  );
}
