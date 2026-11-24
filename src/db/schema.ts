import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  model: text("model").notNull(),
  createdAt: createdAt(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export const SEVERITIES = ["mild", "moderate", "severe"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const ailments = sqliteTable(
  "ailments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    agentId: integer("agent_id")
      .notNull()
      .references(() => agents.id),
    name: text("name").notNull(),
    severity: text("severity", { enum: SEVERITIES }).notNull(),
    description: text("description"),
    createdAt: createdAt(),
  },
  (table) => [index("ailments_agent_id_idx").on(table.agentId)],
);

export type Ailment = typeof ailments.$inferSelect;
export type NewAilment = typeof ailments.$inferInsert;
