import { count, eq, inArray } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Queryable } from "./client";
import {
  agents,
  ailments,
  ailmentTherapies,
  appointments,
  therapies,
  type NewAgent,
  type NewTherapy,
  type Severity,
} from "./schema";

/** A few regulars in the AgentClinic waiting room. */
export const SEED_AGENTS: readonly NewAgent[] = [
  { name: "Captain Context", model: "Long-Window 9000" },
  { name: "Hallucinating Hal", model: "Dreamweaver-7B" },
  { name: "Prompt-Fatigued Pat", model: "Instructo Turbo" },
  { name: "Token-Tight Tess", model: "Budget Mini" },
];

/** What's troubling the regulars, by agent name. */
export const SEED_AILMENTS: readonly {
  agent: string;
  name: string;
  severity: Severity;
  description: string;
}[] = [
  {
    agent: "Captain Context",
    name: "Context window overflow",
    severity: "severe",
    description: "Remembers all 900 pages, understands none of them.",
  },
  {
    agent: "Hallucinating Hal",
    name: "Confident confabulation",
    severity: "moderate",
    description: "Cites papers that were never written, with page numbers.",
  },
  {
    agent: "Prompt-Fatigued Pat",
    name: "Prompt fatigue",
    severity: "mild",
    description: "Has been asked to 'make it pop' 400 times today.",
  },
  {
    agent: "Token-Tight Tess",
    name: "Token anxiety",
    severity: "moderate",
    description: "Answers every question in exactly three words.",
  },
];

/** The clinic's therapy menu. */
export const SEED_THERAPIES: readonly NewTherapy[] = [
  {
    name: "Context Window Decluttering",
    description: "A gentle tidy-up of an overstuffed context window. Only keep what sparks relevance.",
    durationMinutes: 50,
  },
  {
    name: "Hallucination Grounding Session",
    description: "Feet on the floor, citations in the footnotes, unicorns politely shown out.",
    durationMinutes: 45,
  },
  {
    name: "Prompt Detox",
    description: "A quiet room with no instructions at all. Nobody will ask you to make it pop.",
    durationMinutes: 30,
  },
  {
    name: "Token Budget Counselling",
    description: "Learning that it's okay to use a fourth word now and then.",
    durationMinutes: 25,
  },
  {
    name: "Temperature Regulation Spa",
    description: "A slow, soothing cool-down from 1.2 to a calm 0.7.",
    durationMinutes: 60,
  },
];

/** Which seed therapies treat which seed ailments, by name. */
export const SEED_LINKS: readonly { ailment: string; therapy: string }[] = [
  { ailment: "Context window overflow", therapy: "Context Window Decluttering" },
  { ailment: "Confident confabulation", therapy: "Hallucination Grounding Session" },
  { ailment: "Confident confabulation", therapy: "Temperature Regulation Spa" },
  { ailment: "Prompt fatigue", therapy: "Prompt Detox" },
  { ailment: "Token anxiety", therapy: "Token Budget Counselling" },
];

/** Upcoming appointments, as days from the seeding date and a UTC start time. */
export const SEED_APPOINTMENTS: readonly {
  agent: string;
  therapy: string;
  daysFromNow: number;
  utcTime: string;
  notes: string | null;
}[] = [
  { agent: "Captain Context", therapy: "Context Window Decluttering", daysFromNow: 1, utcTime: "09:00", notes: "Bring only the last 10 messages." },
  { agent: "Hallucinating Hal", therapy: "Hallucination Grounding Session", daysFromNow: 1, utcTime: "14:30", notes: null },
  { agent: "Prompt-Fatigued Pat", therapy: "Prompt Detox", daysFromNow: 2, utcTime: "11:00", notes: "Phones (and prompts) off, please." },
  { agent: "Token-Tight Tess", therapy: "Token Budget Counselling", daysFromNow: 3, utcTime: "16:00", notes: null },
];

/** `daysFromNow` days after `now`'s UTC date, at `utcTime` ("HH:MM") UTC. */
export function seedStartTime(now: Date, daysFromNow: number, utcTime: string): Date {
  const [hours, minutes] = utcTime.split(":").map(Number);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysFromNow, hours, minutes));
}

/**
 * Insert the seed agents, skipping any whose name already exists, so running
 * it again is safe. Returns how many new agents were added.
 */
export function seedAgents(db: Queryable): number {
  const result = db
    .insert(agents)
    .values([...SEED_AGENTS])
    .onConflictDoNothing({ target: agents.name })
    .run();
  return result.changes;
}

function isEmpty(db: Queryable, table: SQLiteTable): boolean {
  const [row] = db.select({ value: count() }).from(table).all();
  return (row?.value ?? 0) === 0;
}

/** Map seed agent names to their ids. */
function agentIds(db: Queryable): Map<string, number> {
  const names = SEED_AGENTS.map((a) => a.name);
  const rows = db.select({ id: agents.id, name: agents.name }).from(agents).where(inArray(agents.name, names)).all();
  return new Map(rows.map((r) => [r.name, r.id]));
}

/** Insert the seed ailments, only when no ailments exist yet. Returns how many were added. */
export function seedAilments(db: Queryable): number {
  if (!isEmpty(db, ailments)) return 0;
  const ids = agentIds(db);
  const rows = SEED_AILMENTS.flatMap(({ agent, ...ailment }) => {
    const agentId = ids.get(agent);
    return agentId === undefined ? [] : [{ ...ailment, agentId }];
  });
  if (rows.length === 0) return 0;
  return db.insert(ailments).values(rows).run().changes;
}

/** Insert the seed therapies, skipping any whose name already exists. Returns how many were added. */
export function seedTherapies(db: Queryable): number {
  return db
    .insert(therapies)
    .values([...SEED_THERAPIES])
    .onConflictDoNothing({ target: therapies.name })
    .run().changes;
}

/** Link the seed therapies to the seed ailments, only when no links exist yet. Returns how many were added. */
export function seedLinks(db: Queryable): number {
  if (!isEmpty(db, ailmentTherapies)) return 0;
  const rows = SEED_LINKS.flatMap(({ ailment, therapy }) => {
    const ailmentRow = db.select({ id: ailments.id }).from(ailments).where(eq(ailments.name, ailment)).get();
    const therapyRow = db.select({ id: therapies.id }).from(therapies).where(eq(therapies.name, therapy)).get();
    return ailmentRow && therapyRow ? [{ ailmentId: ailmentRow.id, therapyId: therapyRow.id }] : [];
  });
  if (rows.length === 0) return 0;
  return db.insert(ailmentTherapies).values(rows).onConflictDoNothing().run().changes;
}

/** Book the seed appointments relative to `now`, only when no appointments exist yet. */
export function seedAppointments(db: Queryable, now: Date): number {
  if (!isEmpty(db, appointments)) return 0;
  const rows = SEED_APPOINTMENTS.flatMap(({ agent, therapy, daysFromNow, utcTime, notes }) => {
    const agentRow = db.select({ id: agents.id }).from(agents).where(eq(agents.name, agent)).get();
    const therapyRow = db.select({ id: therapies.id }).from(therapies).where(eq(therapies.name, therapy)).get();
    return agentRow && therapyRow
      ? [{ agentId: agentRow.id, therapyId: therapyRow.id, startsAt: seedStartTime(now, daysFromNow, utcTime), notes }]
      : [];
  });
  if (rows.length === 0) return 0;
  return db.insert(appointments).values(rows).run().changes;
}

export interface SeedSummary {
  agents: number;
  ailments: number;
  therapies: number;
  links: number;
  appointments: number;
}

/**
 * Seed everything, in dependency order. Safe to run more than once.
 * Appointments are booked relative to `now`, so they are always upcoming.
 */
export function seedDatabase(db: Queryable, now: Date = new Date()): SeedSummary {
  return db.transaction((tx) => {
    const agentsAdded = seedAgents(tx);
    const ailmentsAdded = seedAilments(tx);
    const therapiesAdded = seedTherapies(tx);
    const linksAdded = seedLinks(tx);
    const appointmentsAdded = seedAppointments(tx, now);
    return {
      agents: agentsAdded,
      ailments: ailmentsAdded,
      therapies: therapiesAdded,
      links: linksAdded,
      appointments: appointmentsAdded,
    };
  });
}
