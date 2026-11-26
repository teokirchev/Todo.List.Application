"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  addTodo,
  clearCompleted,
  importLocalTodos,
  reloadTodos,
  removeTodo,
  renameTodo,
  setAllCompleted,
  setTodoCompleted,
  swapTodos,
} from "@/app/actions";
import { CannonLayer } from "@/components/cannon-shot";
import { VictoryLayer } from "@/components/victory";
import { RefereeCardLayer } from "@/components/referee-card";
import { TodoList, type ListActions } from "@/components/todo-list";
import { apply, isTodo, LIST_NAMES, newId, normalizeTitle, type ListName, type Todo, type TodoLists } from "@/lib/todos";

// Before sign-in existed, todos lived in localStorage under these keys ("todos" was the very first single list).
const LEGACY_KEYS: Record<ListName, string[]> = {
  work: ["todos-work", "todos"],
  personal: ["todos-personal"],
};

function readLegacyTodos(): Record<ListName, Todo[]> | null {
  const result: Record<ListName, Todo[]> = { work: [], personal: [] };
  let count = 0;
  try {
    for (const list of LIST_NAMES) {
      for (const key of LEGACY_KEYS[list]) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) continue;
        const todos = parsed.filter(isTodo);
        result[list].push(...todos);
        count += todos.length;
      }
    }
  } catch {
    return null;
  }
  if (count === 0) {
    clearLegacyTodos();
    return null;
  }
  return result;
}

function clearLegacyTodos() {
  try {
    for (const keys of Object.values(LEGACY_KEYS)) keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

export function TodoBoard({ initial }: { initial: TodoLists }) {
  const [lists, setLists] = useState<TodoLists>(initial);
  const [error, setError] = useState<string | null>(null);
  // Only the newest server answer per list may overwrite the optimistic state.
  const latest = useRef<Record<ListName, number>>({ work: 0, personal: 0 });

  const run = useCallback(
    (list: ListName, optimistic: (todos: Todo[]) => Todo[], request: () => Promise<Todo[]>) => {
      setError(null);
      setLists((prev) => ({ ...prev, [list]: optimistic(prev[list]) }));
      const ticket = ++latest.current[list];
      request().then(
        (server) => {
          if (ticket === latest.current[list]) setLists((prev) => ({ ...prev, [list]: server }));
        },
        async () => {
          setError("Промяната не беше запазена. Провери връзката и опитай пак.");
          try {
            setLists(await reloadTodos());
          } catch {
            // Keep what is on screen; the next action will try again.
          }
        },
      );
    },
    [],
  );

  const actions = useMemo(() => {
    const make = (list: ListName): ListActions => ({
      add(title) {
        const clean = normalizeTitle(title);
        if (!clean) return;
        const todo: Todo = { id: newId(), title: clean, completed: false, createdAt: Date.now(), completedAt: null };
        run(list, (t) => apply.add(t, todo), () => addTodo(list, todo.id, clean));
      },
      setCompleted(id, completed) {
        run(list, (t) => apply.setCompleted(t, id, completed), () => setTodoCompleted(list, id, completed));
      },
      rename(id, title) {
        const clean = normalizeTitle(title);
        if (!clean) {
          run(list, (t) => apply.remove(t, id), () => removeTodo(list, id));
          return;
        }
        run(list, (t) => apply.rename(t, id, clean), () => renameTodo(list, id, clean));
      },
      remove(id) {
        run(list, (t) => apply.remove(t, id), () => removeTodo(list, id));
      },
      setAll(completed) {
        run(list, (t) => apply.setAll(t, completed), () => setAllCompleted(list, completed));
      },
      clearCompleted() {
        run(list, apply.clearCompleted, () => clearCompleted(list));
      },
      swap(id, otherId) {
        run(list, (t) => apply.swap(t, id, otherId), () => swapTodos(list, id, otherId));
      },
    });
    return { work: make("work"), personal: make("personal") };
  }, [run]);

  // Move todos that were saved in this browser before sign-in into the database, once.
  const importStarted = useRef(false);
  useEffect(() => {
    if (importStarted.current) return;
    importStarted.current = true;
    const legacy = readLegacyTodos();
    if (!legacy) return;
    importLocalTodos(legacy).then(
      (next) => {
        clearLegacyTodos();
        setLists(next);
      },
      () => setError("Задачите, запазени в браузъра, не бяха прехвърлени. Ще опитаме пак при следващото зареждане."),
    );
  }, []);

  return (
    <>
      <CannonLayer />
      <VictoryLayer />
      <RefereeCardLayer />
      {error && (
        <div
          role="alert"
          className="mb-4 flex w-full max-w-5xl items-start gap-3 rounded-2xl border-2 border-red-500 bg-white px-4 py-3 text-sm text-red-800 shadow-lg dark:bg-zinc-950 dark:text-red-300"
        >
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Затвори"
            className="rounded-md p-0.5 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2">
        <TodoList list="personal" todos={lists.personal} actions={actions.personal} />
        <TodoList list="work" todos={lists.work} actions={actions.work} autoFocus />
      </div>
    </>
  );
}
