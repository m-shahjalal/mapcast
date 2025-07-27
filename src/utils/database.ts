import { createId } from "@paralleldrive/cuid2";
import {
  and,
  asc,
  Column,
  desc,
  getTableColumns,
  is,
  isSQLWrapper,
  or,
  sql,
  Table,
  type Query,
  type SQL,
} from "drizzle-orm";
import {
  date,
  PgDialect,
  text,
  timestamp,
  type PgColumn,
  type PgTable,
  type PgTimestampConfig,
  type ReferenceConfig,
} from "drizzle-orm/pg-core";

import { varchar } from "drizzle-orm/pg-core";

export const primaryColumn = (name: string = "id") => {
  return varchar(name, { length: 63 })
    .$defaultFn(() => createId())
    .primaryKey();
};

export const createdAt = (
  name: string = "created_at",
  config: PgTimestampConfig<"string" | "date"> | undefined = {
    mode: "date",
  }
) => timestamp(name, config).defaultNow().notNull();

export const updatedAt = (
  name: string = "updated_at",
  config: PgTimestampConfig<"string" | "date"> | undefined = {
    mode: "date",
  }
) =>
  timestamp(name, config)
    .defaultNow()
    .$onUpdateFn(() => new Date());

export const deletedAt = (
  name: string = "deleted_at",
  config: PgTimestampConfig<"string" | "date"> | undefined = {
    mode: "date",
  }
) => timestamp(name, config).$defaultFn(() => sql`NULL`);

export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
};

export const onlyDate = (name: string = "date") => date(name, { mode: "date" });

export const foreignId = (
  name: string,
  column: ReferenceConfig["ref"],
  action: ReferenceConfig["actions"] = {
    onDelete: "cascade",
    onUpdate: "cascade",
  }
) => text(name).references(column, action);

export const printQuery = (query: SQL | Query, name = "") => {
  if (isSQLWrapper(query)) {
    const pgDialect = new PgDialect();
    query = pgDialect.sqlToQuery(query.getSQL());
  }

  const fullQuery = mapSqlTemplate(query as Query);

  console.info(`\n--------- ${name} Query ---------\n`);
  console.info(fullQuery);
  console.info(`\n--------- ${name} Query ---------\n`);
};

export const mapSqlTemplate = (query: Query): string => {
  const { sql, params } = query;

  // Loop through each value and replace the placeholder $1, $2, etc.
  try {
    return sql.replace(/\$(\d+)/g, (match, index) => {
      const value = params[parseInt(index) - 1]; // Adjust index (1-based to 0-based)

      // If the value is a boolean, convert it to SQL's TRUE/FALSE
      if (typeof value === "boolean") {
        return value ? "TRUE" : "FALSE";
      }

      // If it's a string, ensure proper quoting
      if (typeof value === "string") {
        return `'${value}'`;
      }

      // For numbers, return them as is
      return String(value);
    });
  } catch (error) {
    console.info(`--------- SQL ---------`);
    console.info(sql);
    console.info(`--------- PARAMS ---------`);
    console.info(params);
    return "";
  }
};

export function generateEnum<T extends readonly [string, ...string[]]>(
  values: T
) {
  return (name: string) => text(name, { enum: values }).$type<T[number]>();
}

type BuildWhereReturnType = {
  conditions: SQL<unknown>[];
  add: (condition: SQL<unknown> | undefined) => void;
  and: () => SQL<unknown> | undefined;
  or: () => SQL<unknown> | undefined;
};

export const buildWhere = (): BuildWhereReturnType => {
  const conditions: SQL<unknown>[] = [sql.empty()];

  return {
    conditions: conditions.filter(Boolean),
    add: (condition: SQL<unknown> | undefined) => {
      if (condition) {
        conditions.push(condition);
      }
    },
    and: () => {
      return and(...(conditions.filter(Boolean) as SQL<unknown>[]));
    },
    or: () => {
      return or(...(conditions.filter(Boolean) as SQL<unknown>[]));
    },
  };
};

export const buildWhereWithAlias = (alias: PgTable) => {
  const conditions: SQL<unknown>[] = [sql.empty()];

  return {
    conditions: conditions.filter(Boolean),
    add: (condition: SQL<unknown> | undefined) => {
      if (condition) {
        conditions.push(condition);
      }
    },
    and: () => {
      return and(...(conditions.filter(Boolean) as SQL<unknown>[]));
    },
    or: () => {
      return or(...(conditions.filter(Boolean) as SQL<unknown>[]));
    },
  };
};

export function buildSortByOrder<T extends PgTable>(
  table: T,
  order: "asc" | "desc"
) {
  const columns = getTableColumns(table);

  const orderFn = (key: keyof T["_"]["columns"]) => {
    const column = columns[key];
    if (!column) return undefined;
    return order === "asc" ? asc(column) : desc(column);
  };

  const sortByObject = Object.fromEntries(
    Object.keys(columns).map((key) => [key, orderFn(key)])
  );
  return sortByObject;
}

export function buildSortingQuery<
  T extends PgTable,
  U extends keyof T["_"]["columns"] | PgColumn | string
>(table: T, order: "asc" | "desc", sort: U) {
  // let sortBy: SQL<unknown> | undefined;

  if (!is(table, Table)) {
    return undefined;
  }

  if (is(sort, Column)) {
    return order === "asc" ? asc(sort) : desc(sort);
  }

  const columns = getTableColumns(table);

  const column = columns[sort as keyof T["_"]["columns"]];

  if (is(column, Column)) {
    return order === "asc" ? asc(column) : desc(column);
  }

  return undefined;
}
