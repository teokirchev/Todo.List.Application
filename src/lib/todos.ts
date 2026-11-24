// Shared by the server and the browser: types, validation and pure list updates.

export type ListName = "work" | "personal";
export const LIST_NAMES: readonly ListName[] = ["work", "personal"];

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  /** When it was ticked off (ms); null while open, or for todos completed before this was recorded. */
  completedAt: number | null;
};

export type TodoLists = Record<ListName, Todo[]>;

export const MAX_TITLE_LENGTH = 500;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isListName(value: unknown): value is ListName {
  return value === "work" || value === "personal";
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Trimmed title, or null when it is empty or too long. */
export function normalizeTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const title = value.trim();
  return title && title.length <= MAX_TITLE_LENGTH ? title : null;
}

/** Checks the fields every stored todo has (old browser-saved todos have no completedAt). */
export function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "number"
  );
}

/** RFC 4122 v4 id; works outside secure contexts too. */
export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Mirrors the server: completing stamps the time (unless already done), reopening clears it. */
function withCompleted(todo: Todo, completed: boolean): Todo {
  if (!completed) return { ...todo, completed, completedAt: null };
  return { ...todo, completed, completedAt: todo.completed ? todo.completedAt : Date.now() };
}

/** Pure updates, used for optimistic UI before the server answers. */
export const apply = {
  /** New todos go first. */
  add: (todos: Todo[], todo: Todo) => [todo, ...todos],
  setCompleted: (todos: Todo[], id: string, completed: boolean) =>
    todos.map((t) => (t.id === id ? withCompleted(t, completed) : t)),
  rename: (todos: Todo[], id: string, title: string) =>
    todos.map((t) => (t.id === id ? { ...t, title } : t)),
  remove: (todos: Todo[], id: string) => todos.filter((t) => t.id !== id),
  setAll: (todos: Todo[], completed: boolean) => todos.map((t) => withCompleted(t, completed)),
  clearCompleted: (todos: Todo[]) => todos.filter((t) => !t.completed),
  /** Exchanges the places of two todos (used to move one up or down past its neighbour). */
  swap: (todos: Todo[], a: string, b: string) => {
    const i = todos.findIndex((t) => t.id === a);
    const j = todos.findIndex((t) => t.id === b);
    if (i < 0 || j < 0) return todos;
    const next = [...todos];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  },
};
