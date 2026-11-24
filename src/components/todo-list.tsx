"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  Eraser,
  CalendarPlus,
  Goal,
  Info,
  MoreVertical,
  X,
  Pencil,
  Plus,
  Shirt,
  Trash,
  Trophy,
} from "lucide-react";
import { fireCannon } from "@/components/cannon-shot";
import { celebrateVictory } from "@/components/victory";
import { MultilineInput } from "@/components/multiline-input";
import { Cannon, FootballIcon } from "@/components/club-emblem";
import type { ListName, Todo } from "@/lib/todos";

export type ListActions = {
  add(title: string): void;
  setCompleted(id: string, completed: boolean): void;
  /** An empty title deletes the todo. */
  rename(id: string, title: string): void;
  remove(id: string): void;
  setAll(completed: boolean): void;
  clearCompleted(): void;
  /** Exchanges the priority of two todos. */
  swap(id: string, otherId: string): void;
};

type Theme = {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  image: string;
  /** Tailwind classes must be complete literals so the compiler can see them. */
  header: string;
  badge: string;
  bar: string;
  button: string;
  focus: string;
  checkRing: string;
  filterActive: string;
  accentText: string;
  hover: string;
  /** Left stripe on each todo: faint while open, full colour once done. */
  stripe: string;
  stripeFaint: string;
};

const LISTS = {
  work: {
    title: "Работни",
    subtitle: "Emirates: проекти и срокове",
    icon: Cannon,
    image: "/illustrations/tactics.svg",
    header: "from-club-red to-club-red-dark",
    badge: "bg-white text-club-gold",
    bar: "bg-white",
    button: "bg-club-red shadow-club-red/30 hover:bg-club-red-dark",
    focus:
      "focus-within:border-club-red focus-within:ring-club-red/15 dark:focus-within:border-club-red",
    checkRing: "focus-visible:ring-club-red/40",
    filterActive: "aria-pressed:bg-club-red aria-pressed:text-white",
    accentText: "text-club-red dark:text-red-400",
    hover: "hover:bg-red-50/70 dark:hover:bg-red-500/5",
    stripe: "border-l-club-red",
    stripeFaint: "border-l-club-red/20",
  },
  personal: {
    title: "Лични",
    subtitle: "Извън Emirates: дом и семейство",
    icon: Shirt,
    image: "/illustrations/goal.svg",
    header: "from-club-navy to-club-navy-dark",
    badge: "bg-club-gold text-club-navy-dark",
    bar: "bg-club-gold",
    button:
      "bg-club-navy shadow-club-navy/30 hover:bg-club-navy-dark dark:bg-club-gold dark:text-club-navy-dark dark:shadow-club-gold/20 dark:hover:bg-[#b8933d]",
    focus:
      "focus-within:border-club-navy focus-within:ring-club-navy/15 dark:focus-within:border-club-gold dark:focus-within:ring-club-gold/15",
    checkRing:
      "focus-visible:ring-club-navy/40 dark:focus-visible:ring-club-gold/40",
    filterActive:
      "aria-pressed:bg-club-navy aria-pressed:text-white dark:aria-pressed:bg-club-gold dark:aria-pressed:text-club-navy-dark",
    accentText: "text-club-navy dark:text-club-gold",
    hover: "hover:bg-blue-50/70 dark:hover:bg-blue-500/5",
    stripe: "border-l-club-navy dark:border-l-club-gold",
    stripeFaint: "border-l-club-navy/20 dark:border-l-club-gold/25",
  },
} satisfies Record<ListName, Theme>;

/** Fixed-position placement of a todo's ⋮ menu (px from the viewport edges). */
type MenuPosition = { right: number; top?: number; bottom?: number };
/** Height of the ⋮ menu (three 44px items plus padding), to decide whether it fits below the button. */
const MENU_HEIGHT = 140;

const DATE_TIME = new Intl.DateTimeFormat("bg-BG", { dateStyle: "long", timeStyle: "short" });

/** The move and ⋮ buttons on each todo: grey box, darker grey on hover (and while its menu is open). */
const CONTROL_BUTTON =
  "flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 active:scale-90 aria-expanded:bg-zinc-200 aria-expanded:text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:aria-expanded:bg-zinc-800";

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

const NO_ACTIONS: ListActions = {
  add() {},
  setCompleted() {},
  rename() {},
  remove() {},
  setAll() {},
  clearCompleted() {},
  swap() {},
};

/** `todos` is null while the list is still loading; it then renders as a placeholder. */
export function TodoList({
  list,
  todos,
  actions = NO_ACTIONS,
  autoFocus = false,
}: {
  list: ListName;
  todos: Todo[] | null;
  actions?: ListActions;
  autoFocus?: boolean;
}) {
  const theme: Theme = LISTS[list];
  const { icon: Icon } = theme;
  const inputId = useId();
  const headingId = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");

  function submitDraft() {
    if (!draft.trim()) return;
    actions.add(draft);
    setDraft("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitDraft();
  }

  const loaded = todos !== null;
  const items = todos ?? [];
  const activeCount = items.filter((t) => !t.completed).length;
  const completedCount = items.length - activeCount;
  const percent =
    items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);
  const allDone = items.length > 0 && activeCount === 0;
  const visible = items.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.completed : t.completed,
  );

  return (
    <section
      aria-labelledby={headingId}
      className='w-full min-w-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-black/25 dark:border-zinc-800 dark:bg-zinc-950'
    >
      <header
        className={`relative flex items-center gap-4 overflow-hidden bg-linear-to-br px-6 pt-6 pb-5 text-white ${theme.header}`}
      >
        {/* Subtle diagonal kit stripes */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_14px,transparent_14px_28px)]'
        />
        <div className='relative min-w-0 flex-1'>
          <div className='flex items-center gap-3'>
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg ${theme.badge}`}
            >
              <Icon className='size-7' />
            </span>
            <div className='min-w-0'>
              <h2
                id={headingId}
                className='font-display text-2xl leading-tight font-semibold tracking-wide uppercase'
              >
                {theme.title}
              </h2>
              <p className='truncate text-sm text-white/75'>{theme.subtitle}</p>
            </div>
          </div>

          <div className='mt-4 flex items-center gap-4'>
            <div
              className='flex items-center gap-2 rounded-xl bg-black/30 px-3 py-1.5 font-display ring-1 ring-white/10'
              aria-label={
                loaded
                  ? `${completedCount} завършени, ${activeCount} оставащи`
                  : undefined
              }
            >
              <ScoreCell
                value={loaded ? completedCount : null}
                label='Готови'
              />
              <span className='pb-3 text-2xl text-white/50'>:</span>
              <ScoreCell value={loaded ? activeCount : null} label='Остават' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 text-right font-display text-sm tracking-wide text-white/80'>
                {loaded ? `${percent}%` : " "}
              </div>
              <div
                role='progressbar'
                aria-label={`Прогрес: ${theme.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className='h-2 overflow-hidden rounded-full bg-black/25'
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${theme.bar}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <Image
          src={theme.image}
          alt=''
          width={200}
          height={160}
          loading='eager'
          className='relative hidden w-32 shrink-0 drop-shadow-lg sm:block'
        />
      </header>

      <form
        onSubmit={handleSubmit}
        className='flex items-start gap-2 px-4 pt-4'
      >
        <div
          className={`flex min-w-0 flex-1 items-start gap-1 rounded-2xl border border-zinc-200 bg-white pl-1 ring-4 ring-transparent transition dark:border-zinc-800 dark:bg-zinc-900 ${theme.focus}`}
        >
          <button
            type='button'
            onClick={() => {
              // Marking all as done finishes the list too.
              if (activeCount > 0) celebrateVictory(list);
              actions.setAll(activeCount > 0);
            }}
            disabled={items.length === 0}
            aria-label={
              activeCount > 0
                ? "Маркирай всички като завършени"
                : "Маркирай всички като активни"
            }
            title={
              activeCount > 0
                ? "Маркирай всички като завършени"
                : "Маркирай всички като активни"
            }
            className='mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-0 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
          >
            <ChevronsDown className='size-5' aria-hidden />
          </button>
          <label htmlFor={inputId} className='sr-only'>
            Нова задача: {theme.title}
          </label>
          <MultilineInput
            id={inputId}
            value={draft}
            onChange={setDraft}
            onSubmit={submitDraft}
            onCancel={() => setDraft("")}
            placeholder='Добави нова задача…'
            autoFocus={autoFocus}
            disabled={!loaded}
            className='py-3 pr-3 text-base'
          />
        </div>
        <button
          type='submit'
          disabled={!draft.trim()}
          aria-label='Добави'
          className={`flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-4 font-display font-medium tracking-wide text-white uppercase shadow-lg transition active:scale-95 disabled:opacity-40 disabled:shadow-none ${theme.button}`}
        >
          <Plus className='size-5' aria-hidden />
          <span className='hidden sm:inline'>Добави</span>
        </button>
      </form>

      {loaded && items.length > 0 && (
        <div className='flex flex-wrap items-center justify-between gap-2 px-4 pt-4'>
          <div
            className='flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900'
            role='group'
            aria-label={`Филтър: ${theme.title}`}
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type='button'
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`rounded-lg px-3 py-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 aria-pressed:shadow-sm dark:text-zinc-400 dark:hover:text-zinc-100 ${theme.filterActive}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className='text-sm text-zinc-500 dark:text-zinc-400'>
            {remainingLabel(activeCount)}
          </span>
        </div>
      )}

      <div className='px-2 py-3'>
        {!loaded ? (
          <div className='space-y-2 px-2 py-1' aria-label='Зареждане'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900'
              />
            ))}
          </div>
        ) : allDone && filter !== "completed" ? (
          <>
            <div className='mx-2 mb-2 flex items-center gap-2 rounded-xl bg-club-gold/15 px-3 py-2 font-display tracking-wide text-[#8a6d24] uppercase dark:text-club-gold'>
              <Trophy className='size-5' aria-hidden />
              Победа! Всичко е свършено. COYG!
            </div>
            {filter === "all" && (
              <Items list={list} items={visible} activeCount={activeCount} theme={theme} actions={actions} />
            )}
          </>
        ) : visible.length === 0 ? (
          <EmptyState
            theme={theme}
            hasItems={items.length > 0}
            filter={filter}
          />
        ) : (
          <Items list={list} items={visible} activeCount={activeCount} theme={theme} actions={actions} />
        )}
      </div>

      {loaded && completedCount > 0 && (
        <footer className='flex justify-end border-t border-zinc-100 px-4 py-2 dark:border-zinc-900'>
          <button
            type='button'
            onClick={() => actions.clearCompleted()}
            className='flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
          >
            <Eraser className='size-4' aria-hidden />
            Изчисти завършените ({completedCount})
          </button>
        </footer>
      )}
    </section>
  );
}

function ScoreCell({ value, label }: { value: number | null; label: string }) {
  return (
    <div className='flex min-w-10 flex-col items-center' aria-hidden>
      <span className='text-3xl leading-none font-semibold tabular-nums'>
        {value ?? "–"}
      </span>
      <span className='mt-0.5 text-[10px] tracking-widest text-white/60 uppercase'>
        {label}
      </span>
    </div>
  );
}

function EmptyState({
  theme,
  hasItems,
  filter,
}: {
  theme: Theme;
  hasItems: boolean;
  filter: Filter;
}) {
  const text = !hasItems
    ? "Няма задачи – мачът още не е започнал."
    : filter === "completed"
      ? "Още няма отбелязани голове."
      : "Няма задачи тук.";
  return (
    <div className='flex flex-col items-center gap-3 px-6 py-8 text-center'>
      <span className='flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900'>
        <Goal className={`size-7 ${theme.accentText}`} aria-hidden />
      </span>
      <p className='text-sm text-zinc-500 dark:text-zinc-400'>{text}</p>
    </div>
  );
}

/**
 * `items` are the todos on screen (after filtering), already in priority order.
 * The arrows swap a todo with its neighbour on screen.
 */
function Items({
  list,
  items,
  activeCount,
  theme,
  actions,
}: {
  list: ListName;
  items: Todo[];
  /** Open todos in the whole list (not just on screen). */
  activeCount: number;
  theme: Theme;
  actions: ListActions;
}) {
  return (
    <ul className='space-y-2 px-2'>
      {items.map((todo, i) => (
        <TodoItem
          key={todo.id}
          list={list}
          todo={todo}
          isLastOpen={!todo.completed && activeCount === 1}
          prevId={items[i - 1]?.id}
          nextId={items[i + 1]?.id}
          theme={theme}
          actions={actions}
        />
      ))}
    </ul>
  );
}

function TodoItem({
  list,
  todo,
  isLastOpen,
  prevId,
  nextId,
  theme,
  actions,
}: {
  list: ListName;
  todo: Todo;
  /** Ticking this one off finishes the whole list. */
  isLastOpen: boolean;
  prevId?: string;
  nextId?: string;
  theme: Theme;
  actions: ListActions;
}) {
  const [editing, setEditing] = useState(false);
  /** Screen position of the open ⋮ menu, or null when closed. */
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // The menu is fixed on screen, so close it rather than let it drift when the page scrolls or resizes.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);
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
    if (commit && text.trim() !== todo.title) actions.rename(todo.id, text);
  }

  if (editing) {
    return (
      <li className='px-2 py-1'>
        <label htmlFor={`edit-${todo.id}`} className='sr-only'>
          Редактирай задачата
        </label>
        <div
          className={`rounded-xl border border-zinc-200 bg-white px-3 ring-4 ring-transparent dark:border-zinc-800 dark:bg-zinc-900 ${theme.focus}`}
        >
          <MultilineInput
            id={`edit-${todo.id}`}
            value={text}
            onChange={setText}
            onSubmit={() => finish(true)}
            onCancel={() => finish(false)}
            onBlur={() => finish(true)}
            autoFocus
            className='w-full py-2'
          />
        </div>
      </li>
    );
  }

  return (
    <li
      // Each todo is its own card: thin border and a left stripe that is faint while open and lights up in the list colour once done.
      className={`group flex items-center gap-3 rounded-xl border border-l-4 border-zinc-200 bg-white py-2 pr-1.5 pl-3 shadow-xs transition-colors duration-300 motion-safe:animate-todo-in dark:border-zinc-800 dark:bg-zinc-950 ${
        todo.completed ? theme.stripe : theme.stripeFaint
      } ${theme.hover}`}
    >
      {/* The checkbox is a football: faint while open, solid and rolled in once done. */}
      <span className='relative flex size-6 shrink-0 items-center justify-center'>
        <input
          type='checkbox'
          checked={todo.completed}
          onChange={(e) => {
            if (!todo.completed) {
              // Celebrate: fire across the row, from the checkbox to the action buttons.
              const box = e.currentTarget.getBoundingClientRect();
              const row = e.currentTarget
                .closest("li")
                ?.getBoundingClientRect();
              fireCannon(box, row ? row.right - box.left - 90 : 200);
              if (isLastOpen) celebrateVictory(list);
            }
            actions.setCompleted(todo.id, !todo.completed);
          }}
          aria-label={`Завършена: ${todo.title}`}
          className={`peer absolute inset-0 z-10 size-6 cursor-pointer appearance-none rounded-full outline-none ring-offset-2 focus-visible:ring-4 dark:ring-offset-zinc-950 ${theme.checkRing}`}
        />
        <FootballIcon className='pointer-events-none size-6 opacity-25 transition duration-200 peer-hover:opacity-55 peer-checked:opacity-100 peer-checked:drop-shadow-md motion-safe:peer-checked:animate-ball-in' />
      </span>
      <span
        onDoubleClick={startEditing}
        title='Двоен клик за редакция'
        className={`min-w-0 flex-1 font-medium whitespace-pre-wrap wrap-break-word transition-colors ${
          todo.completed
            ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600"
            : ""
        }`}
      >
        {todo.title}
      </span>
      {/* Move buttons (40px, finger-sized) side by side; edit/delete behind a ⋮ menu. Same on every screen. */}
      <div className='flex shrink-0 items-center gap-1'>
        <button
          type='button'
          onClick={() => prevId && actions.swap(todo.id, prevId)}
          disabled={!prevId}
          aria-label={`Премести нагоре: ${todo.title}`}
          className={`${CONTROL_BUTTON} disabled:opacity-25`}
        >
          <ArrowUp className='size-5' strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type='button'
          onClick={() => nextId && actions.swap(todo.id, nextId)}
          disabled={!nextId}
          aria-label={`Премести надолу: ${todo.title}`}
          className={`${CONTROL_BUTTON} disabled:opacity-25`}
        >
          <ArrowDown className='size-5' strokeWidth={2.5} aria-hidden />
        </button>
        <div>
          <button
            type='button'
            onClick={(e) => {
              if (menu) {
                setMenu(null);
                return;
              }
              // Place the menu under the button, or above it when there is no room below.
              const r = e.currentTarget.getBoundingClientRect();
              const up = window.innerHeight - r.bottom < MENU_HEIGHT + 8;
              setMenu({
                right: window.innerWidth - r.right,
                ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
              });
            }}
            aria-label={`Още действия: ${todo.title}`}
            aria-expanded={menu !== null}
            aria-haspopup='menu'
            className={CONTROL_BUTTON}
          >
            <MoreVertical className='size-5' aria-hidden />
          </button>
          {/* Rendered into <body> with fixed position, so the list card's rounded overflow cannot clip it. */}
          {menu &&
            createPortal(
            <>
              {/* Tapping anywhere outside closes the menu. */}
              <button
                type='button'
                aria-label='Затвори менюто'
                onClick={() => setMenu(null)}
                className='fixed inset-0 z-70 cursor-default'
              />
              <div
                role='menu'
                style={menu}
                className='fixed z-71 w-44 overflow-hidden rounded-xl bg-white py-1 text-zinc-900 shadow-xl ring-1 ring-black/10 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10'
              >
                <button
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setMenu(null);
                    setShowDetails(true);
                  }}
                  className='flex h-11 w-full items-center gap-3 px-4 text-left text-sm active:bg-zinc-100 dark:active:bg-zinc-800'
                >
                  <Info className='size-4 text-zinc-500' aria-hidden />
                  Детайли
                </button>
                <button
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setMenu(null);
                    startEditing();
                  }}
                  className='flex h-11 w-full items-center gap-3 px-4 text-left text-sm active:bg-zinc-100 dark:active:bg-zinc-800'
                >
                  <Pencil className='size-4 text-zinc-500' aria-hidden />
                  Редактирай
                </button>
                <button
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setMenu(null);
                    actions.remove(todo.id);
                  }}
                  className='flex h-11 w-full items-center gap-3 px-4 text-left text-sm text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-500/10'
                >
                  <Trash className='size-4' aria-hidden />
                  Изтрий
                </button>
              </div>
            </>,
              document.body,
            )}
          {showDetails && <TodoDetails todo={todo} theme={theme} onClose={() => setShowDetails(false)} />}
        </div>
      </div>
    </li>
  );
}

/** Centered dialog with when a todo was created and completed. Closes on Esc, the button, or a click outside. */
function TodoDetails({ todo, theme, onClose }: { todo: Todo; theme: Theme; onClose: () => void }) {
  const titleId = useId();
  const doneWithTime = todo.completed && todo.completedAt !== null;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const completed = !todo.completed
    ? "Още не е завършена"
    : todo.completedAt
      ? DATE_TIME.format(todo.completedAt)
      : "Неизвестно (завършена преди да се пази времето)";

  return createPortal(
    <div
      className='fixed inset-0 z-70 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        // Same look as the list cards: white rim, header band in the list colour with kit stripes.
        className='w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white bg-white text-zinc-900 shadow-2xl shadow-black/40 motion-safe:animate-todo-in dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100'
      >
        <div className={`relative flex items-center gap-3 overflow-hidden bg-linear-to-br px-5 py-4 text-white ${theme.header}`}>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.06)_0_14px,transparent_14px_28px)]'
          />
          <Cannon className='relative w-10 shrink-0 text-club-gold' />
          <h3 id={titleId} className='relative font-display text-2xl font-semibold tracking-wide uppercase'>
            Детайли
          </h3>
          <button
            type='button'
            onClick={onClose}
            aria-label='Затвори'
            autoFocus
            className='relative ml-auto rounded-xl bg-black/20 p-1.5 text-white ring-1 ring-white/20 transition hover:bg-black/30'
          >
            <X className='size-5' aria-hidden />
          </button>
        </div>

        <div className='px-5 pt-4 pb-5'>
          <p className='line-clamp-4 font-medium whitespace-pre-wrap wrap-break-word text-zinc-800 dark:text-zinc-200'>
            {todo.title}
          </p>

          <dl className='mt-4 space-y-2.5'>
            <div className='flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800'>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-950 ${theme.accentText}`}>
                <CalendarPlus className='size-5' aria-hidden />
              </span>
              <div className='min-w-0'>
                <dt className='font-display text-xs tracking-widest text-zinc-400 uppercase'>Създадена</dt>
                <dd className='text-sm font-medium'>{DATE_TIME.format(todo.createdAt)}</dd>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${
                doneWithTime
                  ? "bg-club-gold/10 ring-club-gold/30"
                  : "bg-zinc-50 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                  doneWithTime ? "bg-club-gold text-white" : "bg-white text-zinc-300 dark:bg-zinc-950 dark:text-zinc-600"
                }`}
              >
                <Trophy className='size-5' aria-hidden />
              </span>
              <div className='min-w-0'>
                <dt className='font-display text-xs tracking-widest text-zinc-400 uppercase'>Завършена</dt>
                <dd className={`text-sm font-medium ${doneWithTime ? "" : "text-zinc-500 dark:text-zinc-400"}`}>{completed}</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>,
    document.body,
  );
}
