"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { todoStore, type Todo } from "@/lib/todo-store";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Всички" },
  { value: "active", label: "Активни" },
  { value: "completed", label: "Завършени" },
];

function pluralTasks(count: number) {
  return count === 1 ? "1 оставаща задача" : `${count} оставащи задачи`;
}

export function TodoApp() {
  const todos = useSyncExternalStore(
    todoStore.subscribe,
    todoStore.getSnapshot,
    todoStore.getServerSnapshot,
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    todoStore.add(draft);
    setDraft("");
  }

  const loaded = todos !== null;
  const list = todos ?? [];
  const activeCount = list.filter((t) => !t.completed).length;
  const completedCount = list.length - activeCount;
  const visible = list.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.completed : t.completed,
  );

  return (
    <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => todoStore.setAll(activeCount > 0)}
          disabled={list.length === 0}
          aria-label={activeCount > 0 ? "Маркирай всички като завършени" : "Маркирай всички като активни"}
          title={activeCount > 0 ? "Маркирай всички като завършени" : "Маркирай всички като активни"}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:invisible dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        <label htmlFor="new-todo" className="sr-only">Нова задача</label>
        <input
          id="new-todo"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Какво трябва да се направи?"
          autoComplete="off"
          autoFocus
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base outline-none placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Добави
        </button>
      </form>

      {!loaded ? (
        <p className="p-6 text-center text-sm text-zinc-400">Зареждане…</p>
      ) : visible.length === 0 ? (
        <p className="p-6 text-center text-sm text-zinc-500">
          {list.length === 0
            ? "Нямаш задачи. Добави първата отгоре."
            : filter === "active"
              ? "Всичко е свършено."
              : "Няма завършени задачи."}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {visible.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}

      {loaded && list.length > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          <span>{pluralTasks(activeCount)}</span>
          <div className="flex gap-1" role="group" aria-label="Филтър">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className="rounded-md px-2 py-1 hover:bg-zinc-100 aria-pressed:bg-zinc-200 aria-pressed:text-zinc-900 dark:hover:bg-zinc-800 dark:aria-pressed:bg-zinc-700 dark:aria-pressed:text-zinc-100"
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => todoStore.clearCompleted()}
            disabled={completedCount === 0}
            className="rounded-md px-2 py-1 hover:bg-zinc-100 hover:text-zinc-900 disabled:invisible dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Изчисти завършените
          </button>
        </footer>
      )}
    </section>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.title);
  // Guards against a blur fired while the input unmounts after Enter/Escape.
  const doneRef = useRef(false);

  function startEditing() {
    doneRef.current = false;
    setText(todo.title);
    setEditing(true);
  }

  function finish(commit: boolean) {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    if (commit && text.trim() !== todo.title) todoStore.rename(todo.id, text);
  }

  if (editing) {
    return (
      <li className="px-4 py-2">
        <label htmlFor={`edit-${todo.id}`} className="sr-only">Редактирай задачата</label>
        <input
          id={`edit-${todo.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => finish(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") finish(true);
            if (e.key === "Escape") finish(false);
          }}
          autoFocus
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700"
        />
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => todoStore.toggle(todo.id)}
        aria-label={`Завършена: ${todo.title}`}
        className="size-5 shrink-0 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
      />
      <span
        onDoubleClick={startEditing}
        title="Двоен клик за редакция"
        className={`min-w-0 flex-1 wrap-break-word ${todo.completed ? "text-zinc-400 line-through" : ""}`}
      >
        {todo.title}
      </span>
      <button
        type="button"
        onClick={startEditing}
        aria-label={`Редактирай: ${todo.title}`}
        className="rounded-md p-1 text-zinc-400 opacity-0 hover:bg-zinc-100 hover:text-zinc-700 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => todoStore.remove(todo.id)}
        aria-label={`Изтрий: ${todo.title}`}
        className="rounded-md p-1 text-zinc-400 opacity-0 hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </li>
  );
}
