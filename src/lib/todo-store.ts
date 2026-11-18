export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "todos";
const EMPTY: Todo[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: Todo[] = EMPTY;

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "number"
  );
}

function read(): Todo[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cached;
  }
  // useSyncExternalStore needs a stable reference while the data is unchanged.
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter(isTodo) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(todos: Todo[]) {
  cached = todos;
  const raw = JSON.stringify(todos);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
  } catch {
    // Storage unavailable (private mode, quota): keep the in-memory state only.
  }
  listeners.forEach((listener) => listener());
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const todoStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    // Keep several open tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  // Nothing is known on the server; the client renders the list after hydration.
  getServerSnapshot: (): Todo[] | null => null,

  add(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    write([
      ...read(),
      { id: newId(), title: trimmed, completed: false, createdAt: Date.now() },
    ]);
  },
  toggle(id: string) {
    write(read().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  },
  rename(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      todoStore.remove(id);
      return;
    }
    write(read().map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
  },
  remove(id: string) {
    write(read().filter((t) => t.id !== id));
  },
  setAll(completed: boolean) {
    write(read().map((t) => ({ ...t, completed })));
  },
  clearCompleted() {
    write(read().filter((t) => !t.completed));
  },
};
