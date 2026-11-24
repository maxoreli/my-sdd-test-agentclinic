import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

export const therapies = sqliteTable("therapies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

export type Therapy = typeof therapies.$inferSelect;
export type NewTherapy = typeof therapies.$inferInsert;

/** Which therapies treat which ailments (many to many). */
export const ailmentTherapies = sqliteTable(
  "ailment_therapies",
  {
    ailmentId: integer("ailment_id")
      .notNull()
      .references(() => ailments.id),
    therapyId: integer("therapy_id")
      .notNull()
      .references(() => therapies.id),
  },
  (table) => [
    primaryKey({ columns: [table.ailmentId, table.therapyId] }),
    index("ailment_therapies_therapy_id_idx").on(table.therapyId),
  ],
);

export const appointments = sqliteTable(
  "appointments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    agentId: integer("agent_id")
      .notNull()
      .references(() => agents.id),
    therapyId: integer("therapy_id")
      .notNull()
      .references(() => therapies.id),
    /** Start time, stored as a UTC instant. */
    startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [
    // An agent can't be in two places at once.
    uniqueIndex("appointments_agent_starts_at_unique").on(table.agentId, table.startsAt),
    index("appointments_starts_at_idx").on(table.startsAt),
  ],
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
