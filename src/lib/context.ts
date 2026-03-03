/**
 * context.ts
 *
 * Maps a Saturday date to its liturgical context within Great Lent.
 * Identifies which Lenten week a Saturday falls in, the Octoechos tone,
 * and the Romanian name of the Sunday it prepares.
 */

import { getPascha, getLentStart } from "./pascha";

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface LiturgicalContext {
  /** The Saturday date. */
  date: Date;
  /** Great Lent week number, 1-5. */
  lentWeek: number;
  /** Octoechos tone (glas), 1-8. Calculated from Thomas Sunday cycle. */
  tone: number;
  /** Romanian name of the Sunday this Saturday prepares (Vecernia). */
  sundayName: string;
  /** Days before Pascha (always negative during Lent). */
  paschaOffset: number;
  /** Human-readable date in Romanian format, e.g. "28 februarie 2026". */
  formattedDate: string;
}

export interface PresanctifiedContext {
  /** The date of the Presanctified Liturgy. */
  date: Date;
  /** "miercuri" or "vineri". */
  dayOfWeek: "miercuri" | "vineri";
  /** Great Lent week number, 1-6. */
  lentWeek: number;
  /** Octoechos tone (glas), 1-8. The tone of the current week's Sunday. */
  tone: number;
  /** Human-readable date in Romanian format. */
  formattedDate: string;
  /** Collection slug, e.g. "miercuri-sapt2". */
  slug: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** Romanian month names (lowercase, used in formatted dates). */
const MONTHS_RO: string[] = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

/** Romanian Sunday names for each of the 5 Lenten weeks. Index 0 = week 1. */
const SUNDAY_NAMES: string[] = [
  "Duminica Ortodoxiei",
  "Sf. Grigorie Palama",
  "Închinarea Sfintei Cruci",
  "Sf. Ioan Scărarul",
  "Sf. Maria Egipteanca",
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given a date string (ISO 8601, e.g. "2026-02-28"), returns the
 * LiturgicalContext if the date falls on one of the 5 Great Lent Saturdays,
 * or null otherwise.
 */
export function getContext(dateStr: string): LiturgicalContext | null {
  const parsed = new Date(dateStr + "T00:00:00Z");
  if (isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getUTCFullYear();
  const saturdays = getLentSaturdays(year);

  for (const ctx of saturdays) {
    if (
      ctx.date.getUTCFullYear() === parsed.getUTCFullYear() &&
      ctx.date.getUTCMonth() === parsed.getUTCMonth() &&
      ctx.date.getUTCDate() === parsed.getUTCDate()
    ) {
      return ctx;
    }
  }

  return null;
}

/**
 * Returns all 5 Great Lent Saturday contexts for the given year.
 *
 * The first Saturday of Lent falls on day 5 of Lent (Clean Monday = day 0,
 * so Saturday = Clean Monday + 5). Subsequent Saturdays are 7 days apart.
 */
export function getLentSaturdays(year: number): LiturgicalContext[] {
  const pascha = getPascha(year);
  const lentStart = getLentStart(year); // Clean Monday

  const results: LiturgicalContext[] = [];

  for (let week = 1; week <= 5; week++) {
    // Saturday of week N: Clean Monday + 5 days + (week - 1) * 7 days
    const satDate = new Date(lentStart);
    satDate.setUTCDate(satDate.getUTCDate() + 5 + (week - 1) * 7);

    const paschaOffset = daysBetween(satDate, pascha); // negative

    // Saturday Vespers uses the tone of the Sunday it prepares
    const sundayDate = new Date(satDate);
    sundayDate.setUTCDate(sundayDate.getUTCDate() + 1);
    const tone = getOctoechosTone(sundayDate);

    results.push({
      date: satDate,
      lentWeek: week,
      tone,
      sundayName: SUNDAY_NAMES[week - 1],
      paschaOffset,
      formattedDate: formatDateRo(satDate),
    });
  }

  return results;
}

/**
 * Returns all Presanctified Liturgy days (Wed + Fri) for the given year.
 *
 * Weeks 1-6 of Great Lent: Wednesday and Friday each week.
 * The tone follows the Sunday of that week (not the next Sunday).
 */
export function getPresanctifiedDays(year: number): PresanctifiedContext[] {
  const lentStart = getLentStart(year); // Clean Monday
  const results: PresanctifiedContext[] = [];

  const DAY_NAMES: Record<number, "miercuri" | "vineri"> = {
    3: "miercuri", // Wednesday = UTC day 3
    5: "vineri",   // Friday = UTC day 5
  };

  // Weeks 1 through 6 (week 6 = before Palm Sunday)
  for (let week = 1; week <= 6; week++) {
    for (const dayOffset of [2, 4]) {
      // Wed = Clean Monday + 2, Fri = Clean Monday + 4
      const d = new Date(lentStart);
      d.setUTCDate(d.getUTCDate() + dayOffset + (week - 1) * 7);

      const utcDay = d.getUTCDay();
      const dayOfWeek = DAY_NAMES[utcDay];
      if (!dayOfWeek) continue;

      // Tone: the Sunday of this week (the previous Sunday for the cycle)
      const prevSunday = new Date(d);
      prevSunday.setUTCDate(prevSunday.getUTCDate() - utcDay);
      // For week 1, prevSunday is before Lent — use the next Sunday instead
      const nextSunday = new Date(d);
      nextSunday.setUTCDate(nextSunday.getUTCDate() + (7 - utcDay));
      const tone = getOctoechosTone(nextSunday);

      const slug = `${dayOfWeek}-sapt${week}`;

      results.push({
        date: d,
        dayOfWeek,
        lentWeek: week,
        tone,
        formattedDate: formatDateRo(d),
        slug,
      });
    }
  }

  return results;
}

/**
 * Given a date string (ISO 8601), returns the PresanctifiedContext
 * if it matches a Presanctified Liturgy day, or null otherwise.
 */
export function getPresanctifiedContext(
  dateStr: string,
): PresanctifiedContext | null {
  const parsed = new Date(dateStr + "T00:00:00Z");
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getUTCFullYear();
  const days = getPresanctifiedDays(year);

  for (const ctx of days) {
    if (
      ctx.date.getUTCFullYear() === parsed.getUTCFullYear() &&
      ctx.date.getUTCMonth() === parsed.getUTCMonth() &&
      ctx.date.getUTCDate() === parsed.getUTCDate()
    ) {
      return ctx;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the Octoechos tone (glas, 1-8) for a given Sunday.
 *
 * The 8-tone cycle begins at Thomas Sunday (first Sunday after Pascha).
 * Thomas Sunday = Tone 1, the next Sunday = Tone 2, etc.
 * After Tone 8, the cycle repeats from Tone 1.
 *
 * For dates during Great Lent (before Pascha of the current year),
 * the cycle continues from Thomas Sunday of the PREVIOUS year's Pascha.
 */
function getOctoechosTone(sundayDate: Date): number {
  // Determine which Pascha cycle we're in.
  // If the date is before Pascha of this year, use previous year's Pascha.
  const year = sundayDate.getUTCFullYear();
  const paschaThisYear = getPascha(year);

  let referencePascha: Date;
  if (sundayDate.getTime() < paschaThisYear.getTime()) {
    referencePascha = getPascha(year - 1);
  } else {
    referencePascha = paschaThisYear;
  }

  // Thomas Sunday = Pascha + 7 days = Tone 1
  const thomasSunday = new Date(referencePascha);
  thomasSunday.setUTCDate(thomasSunday.getUTCDate() + 7);

  const days = daysBetween(sundayDate, thomasSunday);
  const weeks = Math.round(days / 7); // weeks since Thomas Sunday (0-based)

  // Thomas Sunday itself (weeks=0) = Tone 1
  const tone = (weeks % 8) + 1;
  return tone;
}

/** Returns the number of days from `a` to `b` (negative if a is before b). */
function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

/** Formats a UTC Date as "DD monthName YYYY" in Romanian. */
function formatDateRo(d: Date): string {
  const day = d.getUTCDate();
  const month = MONTHS_RO[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
