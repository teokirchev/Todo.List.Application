export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export type TodoStore = ReturnType<typeof createTodoStore>;

const EMPTY: Todo[] = [];

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

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * A todo list persisted in localStorage under `storageKey`.
 * When `legacyKey` is given and `storageKey` is empty, its data is moved over once.
 */
export function createTodoStore(storageKey: string, legacyKey?: string) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: Todo[] = EMPTY;
  let migrated = !legacyKey;

  function migrate() {
    migrated = true;
    try {
      const legacy = localStorage.getItem(legacyKey!);
      if (legacy !== null && localStorage.getItem(storageKey) === null) {
        localStorage.setItem(storageKey, legacy);
      }
      localStorage.removeItem(legacyKey!);
    } catch {
      // Storage unavailable: nothing to migrate.
    }
  }

  function read(): Todo[] {
    if (!migrated) migrate();
    let raw: string | null;
    try {
      raw = localStorage.getItem(storageKey);
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
      localStorage.setItem(storageKey, raw);
      cachedRaw = raw;
    } catch {
      // Storage unavailable (private mode, quota): keep the in-memory state only.
    }
    listeners.forEach((listener) => listener());
  }

  const store = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      // Keep several open tabs in sync.
      const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey || e.key === null) listener();
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
        store.remove(id);
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

  return store;
}

// The single list used to live under "todos"; those todos become the work list.
export const workTodos = createTodoStore("todos-work", "todos");
export const personalTodos = createTodoStore("todos-personal");
