"use server";

import { redirect } from "next/navigation";
import { getSession, requireUser } from "@/lib/auth";
import {
  deleteCompleted,
  deleteTodo,
  getList,
  getTodoLists,
  importTodos,
  insertTodo,
  updateAllCompleted,
  updateCompleted,
  updateTitle,
  type ImportItem,
} from "@/lib/todo-repo";
import { isListName, isTodo, isUuid, normalizeTitle, type ListName, type Todo, type TodoLists } from "@/lib/todos";

// Server Actions are public endpoints: every one re-checks the session and validates its input.

function parseList(value: unknown): ListName {
  if (!isListName(value)) throw new Error("Invalid list");
  return value;
}

function parseId(value: unknown): string {
  if (!isUuid(value)) throw new Error("Invalid id");
  return value;
}

function parseTitle(value: unknown): string {
  const title = normalizeTitle(value);
  if (!title) throw new Error("Invalid title");
  return title;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Invalid flag");
  return value;
}

export async function addTodo(list: ListName, id: string, title: string): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await insertTodo(user.id, l, parseId(id), parseTitle(title));
  return getList(user.id, l);
}

export async function setTodoCompleted(list: ListName, id: string, completed: boolean): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await updateCompleted(user.id, l, parseId(id), parseBoolean(completed));
  return getList(user.id, l);
}

export async function renameTodo(list: ListName, id: string, title: string): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await updateTitle(user.id, l, parseId(id), parseTitle(title));
  return getList(user.id, l);
}

export async function removeTodo(list: ListName, id: string): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await deleteTodo(user.id, l, parseId(id));
  return getList(user.id, l);
}

export async function setAllCompleted(list: ListName, completed: boolean): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await updateAllCompleted(user.id, l, parseBoolean(completed));
  return getList(user.id, l);
}

export async function clearCompleted(list: ListName): Promise<Todo[]> {
  const user = await requireUser();
  const l = parseList(list);
  await deleteCompleted(user.id, l);
  return getList(user.id, l);
}

export async function reloadTodos(): Promise<TodoLists> {
  const user = await requireUser();
  return getTodoLists(user.id);
}

const MAX_IMPORT = 500;

/** One-time import of todos that were kept in the browser before sign-in existed. */
export async function importLocalTodos(input: unknown): Promise<TodoLists> {
  const user = await requireUser();
  const items: ImportItem[] = [];
  if (typeof input === "object" && input !== null) {
    for (const [list, todos] of Object.entries(input)) {
      if (!isListName(list) || !Array.isArray(todos)) continue;
      for (const todo of todos) {
        const title = isTodo(todo) ? normalizeTitle(todo.title) : null;
        if (!title || items.length >= MAX_IMPORT) continue;
        const createdAt = Number.isFinite(todo.createdAt) && todo.createdAt > 0 ? todo.createdAt : Date.now();
        items.push({ list, title, completed: todo.completed, createdAt });
      }
    }
  }
  await importTodos(user.id, items);
  return getTodoLists(user.id);
}

export async function signOut() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
