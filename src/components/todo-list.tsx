"use client";

import Image from "next/image";
import { useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronsDown,
  Eraser,
  HouseHeart,
  ListChecks,
  PartyPopper,
  Pencil,
  Plus,
  Trash,
  type LucideIcon,
} from "lucide-react";
import { personalTodos, workTodos, type Todo, type TodoStore } from "@/lib/todo-store";

type Theme = {
  store: TodoStore;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  image: string;
  /** Tailwind classes must be complete literals so the compiler can see them. */
  header: string;
  badge: string;
  button: string;
  progress: string;
  focus: string;
  checkbox: string;
  filterActive: string;
  accentText: string;
  hover: string;
};

const LISTS = {
  work: {
    store: workTodos,
    title: "Работни",
    subtitle: "Проекти, срещи и срокове",
    icon: BriefcaseBusiness,
    image: "/illustrations/work.svg",
    header: "from-indigo-50 via-violet-50 to-white dark:from-indigo-950/60 dark:via-violet-950/40 dark:to-zinc-900",
    badge: "from-indigo-500 to-violet-500 shadow-indigo-500/30",
    button: "from-indigo-500 to-violet-500 shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600",
    progress: "from-indigo-500 to-violet-500",
    focus: "focus-within:border-indigo-400 focus-within:ring-indigo-500/20 dark:focus-within:border-indigo-500",
    checkbox: "border-indigo-300 hover:border-indigo-500 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:ring-indigo-500/40 dark:border-indigo-700",
    filterActive: "aria-pressed:bg-indigo-100 aria-pressed:text-indigo-700 dark:aria-pressed:bg-indigo-500/20 dark:aria-pressed:text-indigo-300",
    accentText: "text-indigo-600 dark:text-indigo-400",
    hover: "hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5",
  },
  personal: {
    store: personalTodos,
    title: "Лични",
    subtitle: "Дом, семейство и свободно време",
    icon: HouseHeart,
    image: "/illustrations/personal.svg",
    header: "from-rose-50 via-orange-50 to-white dark:from-rose-950/60 dark:via-orange-950/30 dark:to-zinc-900",
    badge: "from-rose-500 to-orange-400 shadow-rose-500/30",
    button: "from-rose-500 to-orange-400 shadow-rose-500/30 hover:from-rose-600 hover:to-orange-500",
    progress: "from-rose-500 to-orange-400",
    focus: "focus-within:border-rose-400 focus-within:ring-rose-500/20 dark:focus-within:border-rose-500",
    checkbox: "border-rose-300 hover:border-rose-500 checked:border-rose-500 checked:bg-rose-500 focus-visible:ring-rose-500/40 dark:border-rose-800",
    filterActive: "aria-pressed:bg-rose-100 aria-pressed:text-rose-700 dark:aria-pressed:bg-rose-500/20 dark:aria-pressed:text-rose-300",
    accentText: "text-rose-600 dark:text-rose-400",
    hover: "hover:bg-rose-50/60 dark:hover:bg-rose-500/5",
  },
} satisfies Record<string, Theme>;

export type ListName = keyof typeof LISTS;

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Всички" },
  { value: "active", label: "Активни" },
  { value: "completed", label: "Завършени" },
];

function remainingLabel(count: number) {
  if (count === 0) return "Няма оставащи";
  return count === 1 ? "1 оставаща" : `${count} оставащи`;
}

export function TodoList({ list, autoFocus = false }: { list: ListName; autoFocus?: boolean }) {
  const theme: Theme = LISTS[list];
  const { store, icon: Icon } = theme;
  const inputId = useId();
  const headingId = useId();
  const todos = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    store.add(draft);
    setDraft("");
  }

  const loaded = todos !== null;
  const items = todos ?? [];
  const activeCount = items.filter((t) => !t.completed).length;
  const completedCount = items.length - activeCount;
  const percent = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);
  const allDone = items.length > 0 && activeCount === 0;
  const visible = items.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.completed : t.completed,
  );

  return (
    <section
      aria-labelledby={headingId}
      className="w-full min-w-0 overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-900/5 backdrop-blur dark:border-white/5 dark:bg-zinc-900/80 dark:ring-white/10"
    >
      <header className={`relative flex items-end gap-4 bg-linear-to-br px-6 pt-6 pb-5 ${theme.header}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg ${theme.badge}`}>
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id={headingId} className="text-xl font-semibold tracking-tight">
                {theme.title}
              </h2>
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{theme.subtitle}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span>
                {loaded ? `${completedCount} от ${items.length} завършени` : " "}
              </span>
              <span className={theme.accentText}>{loaded ? `${percent}%` : ""}</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Прогрес: ${theme.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-2 overflow-hidden rounded-full bg-zinc-900/5 dark:bg-white/10"
            >
              <div
                className={`h-full rounded-full bg-linear-to-r transition-[width] duration-500 ease-out ${theme.progress}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <Image
          src={theme.image}
          alt=""
          width={200}
          height={160}
          loading="eager"
          className="hidden w-32 shrink-0 drop-shadow-sm sm:block"
        />
      </header>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pt-4">
        <div
          className={`flex min-w-0 flex-1 items-center gap-1 rounded-2xl border border-zinc-200 bg-white pl-1 ring-4 ring-transparent transition dark:border-zinc-700 dark:bg-zinc-950 ${theme.focus}`}
        >
          <button
            type="button"
            onClick={() => store.setAll(activeCount > 0)}
            disabled={items.length === 0}
            aria-label={activeCount > 0 ? "Маркирай всички като завършени" : "Маркирай всички като активни"}
            title={activeCount > 0 ? "Маркирай всички като завършени" : "Маркирай всички като активни"}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-0 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <ChevronsDown className="size-5" aria-hidden />
          </button>
          <label htmlFor={inputId} className="sr-only">
            Нова задача: {theme.title}
          </label>
          <input
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Добави нова задача…"
            autoComplete="off"
            autoFocus={autoFocus}
            className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-base outline-none placeholder:text-zinc-400"
          />
        </div>
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Добави"
          className={`flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-linear-to-r px-4 font-medium text-white shadow-lg transition active:scale-95 disabled:opacity-40 disabled:shadow-none ${theme.button}`}
        >
          <Plus className="size-5" aria-hidden />
          <span className="hidden sm:inline">Добави</span>
        </button>
      </form>

      {loaded && items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/60" role="group" aria-label={`Филтър: ${theme.title}`}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`rounded-lg px-3 py-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 aria-pressed:shadow-sm dark:text-zinc-400 dark:hover:text-zinc-100 ${theme.filterActive}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{remainingLabel(activeCount)}</span>
        </div>
      )}

      <div className="px-2 py-3">
        {!loaded ? (
          <div className="space-y-2 px-2 py-1" aria-label="Зареждане">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : allDone && filter !== "completed" ? (
          <>
            <div className={`mx-2 mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${theme.accentText} bg-zinc-50 dark:bg-zinc-800/50`}>
              <PartyPopper className="size-4" aria-hidden />
              Браво! Всичко е свършено.
            </div>
            {filter === "all" && <Items items={visible} theme={theme} />}
          </>
        ) : visible.length === 0 ? (
          <EmptyState theme={theme} hasItems={items.length > 0} filter={filter} />
        ) : (
          <Items items={visible} theme={theme} />
        )}
      </div>

      {loaded && completedCount > 0 && (
        <footer className="flex justify-end border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => store.clearCompleted()}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Eraser className="size-4" aria-hidden />
            Изчисти завършените ({completedCount})
          </button>
        </footer>
      )}
    </section>
  );
}

function EmptyState({ theme, hasItems, filter }: { theme: Theme; hasItems: boolean; filter: Filter }) {
  const Icon = hasItems ? ListChecks : theme.icon;
  const text = !hasItems
    ? "Няма задачи. Добави първата отгоре."
    : filter === "completed"
      ? "Още нищо не е завършено."
      : "Няма задачи тук.";
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className={`size-7 ${theme.accentText}`} aria-hidden />
      </span>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
    </div>
  );
}

function Items({ items, theme }: { items: Todo[]; theme: Theme }) {
  return (
    <ul className="space-y-1">
      {items.map((todo) => (
        <TodoItem key={todo.id} todo={todo} theme={theme} />
      ))}
    </ul>
  );
}

function TodoItem({ todo, theme }: { todo: Todo; theme: Theme }) {
  const { store } = theme;
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
    if (commit && text.trim() !== todo.title) store.rename(todo.id, text);
  }

  if (editing) {
    return (
      <li className="px-2 py-1">
        <label htmlFor={`edit-${todo.id}`} className="sr-only">
          Редактирай задачата
        </label>
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
          className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 outline-none ring-4 ring-transparent dark:border-zinc-700 dark:bg-zinc-950 ${theme.focus}`}
        />
      </li>
    );
  }

  return (
    <li className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors motion-safe:animate-todo-in ${theme.hover}`}>
      <span className="relative flex size-6 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => store.toggle(todo.id)}
          aria-label={`Завършена: ${todo.title}`}
          className={`peer size-6 cursor-pointer appearance-none rounded-full border-2 outline-none ring-offset-2 transition focus-visible:ring-4 dark:ring-offset-zinc-900 ${theme.checkbox}`}
        />
        <Check
          className="pointer-events-none absolute size-3.5 scale-50 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
          strokeWidth={3.5}
          aria-hidden
        />
      </span>
      <span
        onDoubleClick={startEditing}
        title="Двоен клик за редакция"
        className={`min-w-0 flex-1 wrap-break-word transition-colors ${
          todo.completed ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600" : ""
        }`}
      >
        {todo.title}
      </span>
      <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Редактирай: ${todo.title}`}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => store.remove(todo.id)}
          aria-label={`Изтрий: ${todo.title}`}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Trash className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
