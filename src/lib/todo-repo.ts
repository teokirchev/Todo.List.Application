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
  completed_at: string | Date | null;
};

function toTodo(row: Row): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
  };
}

export async function getTodoLists(userId: string): Promise<TodoLists> {
  const sql = await db();
  const rows = (await sql`
    select id, list, title, completed, created_at, completed_at from todos
    where user_id = ${userId}
    order by position nulls last, created_at, id
  `) as Row[];
  const lists: TodoLists = { work: [], personal: [] };
  for (const row of rows) lists[row.list].push(toTodo(row));
  return lists;
}

export async function getList(userId: string, list: ListName): Promise<Todo[]> {
  const sql = await db();
  const rows = (await sql`
    select id, list, title, completed, created_at, completed_at from todos
    where user_id = ${userId} and list = ${list}
    order by position nulls last, created_at, id
  `) as Row[];
  return rows.map(toTodo);
}

/** New todos go to the top of their list (positions may go below 1; a swap renumbers 1..n). */
export async function insertTodo(userId: string, list: ListName, id: string, title: string) {
  const sql = await db();
  await sql`
    insert into todos (id, user_id, list, title, position)
    values (${id}, ${userId}, ${list}, ${title},
            coalesce((select min(position) from todos where user_id = ${userId} and list = ${list}), 1) - 1)
    on conflict (id) do nothing
  `;
}

/**
 * Swaps the priority of two todos in the same list. The list is renumbered 1..n first,
 * so ties (e.g. from two tabs adding at once) can never make the swap a no-op.
 */
export async function swapPositions(userId: string, list: ListName, a: string, b: string) {
  const sql = await db();
  await sql.transaction([
    sql`
      update todos set position = ranked.rn
      from (
        select id, row_number() over (order by position nulls last, created_at, id) as rn
        from todos where user_id = ${userId} and list = ${list}
      ) ranked
      where todos.id = ranked.id
    `,
    sql`
      update todos t set position = case
          when t.id = ${a} then (select position from todos where id = ${b} and user_id = ${userId} and list = ${list})
          else (select position from todos where id = ${a} and user_id = ${userId} and list = ${list})
        end
      where t.id in (${a}, ${b}) and t.user_id = ${userId} and t.list = ${list}
        and (select count(*) from todos where id in (${a}, ${b}) and user_id = ${userId} and list = ${list}) = 2
    `,
  ]);
}

export async function updateCompleted(userId: string, list: ListName, id: string, completed: boolean) {
  const sql = await db();
  // completed_at is stamped when a todo is ticked off and cleared when it is reopened.
  await sql`
    update todos set
      completed = ${completed}::boolean,
      completed_at = case when not ${completed}::boolean then null when completed then completed_at else now() end
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
  // Todos that were already done keep their original completed_at.
  await sql`
    update todos set
      completed = ${completed}::boolean,
      completed_at = case when not ${completed}::boolean then null when completed then completed_at else now() end
    where user_id = ${userId} and list = ${list}
  `;
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
        insert into todos (id, user_id, list, title, completed, created_at, position)
        values (${newId()}, ${userId}, ${item.list}, ${item.title}, ${item.completed},
                to_timestamp(${item.createdAt / 1000}),
                coalesce((select max(position) from todos where user_id = ${userId} and list = ${item.list}), 0) + 1)
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
