import "server-only";
import { db } from "@/lib/db";
import { newId, type ListName, type Todo, type TodoLists } from "@/lib/todos";

// Every query is scoped by user_id, so a user can only ever touch their own rows.

type Row = {
  id: string;
  list: ListName;
  title: string;
  completed: boolean;
  created_at: string | Date;
};

function toTodo(row: Row): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getTodoLists(userId: string): Promise<TodoLists> {
  const sql = await db();
  const rows = (await sql`
    select id, list, title, completed, created_at from todos
    where user_id = ${userId}
    order by created_at, id
  `) as Row[];
  const lists: TodoLists = { work: [], personal: [] };
  for (const row of rows) lists[row.list].push(toTodo(row));
  return lists;
}

export async function getList(userId: string, list: ListName): Promise<Todo[]> {
  const sql = await db();
  const rows = (await sql`
    select id, list, title, completed, created_at from todos
    where user_id = ${userId} and list = ${list}
    order by created_at, id
  `) as Row[];
  return rows.map(toTodo);
}

export async function insertTodo(userId: string, list: ListName, id: string, title: string) {
  const sql = await db();
  await sql`
    insert into todos (id, user_id, list, title)
    values (${id}, ${userId}, ${list}, ${title})
    on conflict (id) do nothing
  `;
}

export async function updateCompleted(userId: string, list: ListName, id: string, completed: boolean) {
  const sql = await db();
  await sql`
    update todos set completed = ${completed}
    where id = ${id} and user_id = ${userId} and list = ${list}
  `;
}

export async function updateTitle(userId: string, list: ListName, id: string, title: string) {
  const sql = await db();
  await sql`
    update todos set title = ${title}
    where id = ${id} and user_id = ${userId} and list = ${list}
  `;
}

export async function deleteTodo(userId: string, list: ListName, id: string) {
  const sql = await db();
  await sql`delete from todos where id = ${id} and user_id = ${userId} and list = ${list}`;
}

export async function updateAllCompleted(userId: string, list: ListName, completed: boolean) {
  const sql = await db();
  await sql`update todos set completed = ${completed} where user_id = ${userId} and list = ${list}`;
}

export async function deleteCompleted(userId: string, list: ListName) {
  const sql = await db();
  await sql`delete from todos where user_id = ${userId} and list = ${list} and completed`;
}

export type ImportItem = { list: ListName; title: string; completed: boolean; createdAt: number };

export async function importTodos(userId: string, items: ImportItem[]) {
  if (items.length === 0) return;
  const sql = await db();
  await sql.transaction(
    items.map(
      (item) => sql`
        insert into todos (id, user_id, list, title, completed, created_at)
        values (${newId()}, ${userId}, ${item.list}, ${item.title}, ${item.completed},
                to_timestamp(${item.createdAt / 1000}))
      `,
    ),
  );
}

/** Creates the user on first sign-in, refreshes name and email afterwards. Returns the user id. */
export async function upsertUser(googleSub: string, email: string, name: string): Promise<string> {
  const sql = await db();
  const rows = (await sql`
    insert into users (google_sub, email, name)
    values (${googleSub}, ${email}, ${name})
    on conflict (google_sub) do update set email = excluded.email, name = excluded.name
    returning id
  `) as { id: string }[];
  return rows[0].id;
}
