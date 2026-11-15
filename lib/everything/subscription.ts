/**
 * 📄 lib/everything/subscription.ts
 * ==================================================================
 * Free plan er apply limit — ek jaygay.
 *
 *   FREE_APPLICATION_LIMIT       -> maximum free application
 *   hasReachedApplicationLimit() -> limit sesh kina
 *   remainingFreeApplications()  -> ar koyta baki
 *
 * Plan (free/professional) ekhane nei — seta backend er user.payment
 * flag theke ashe (lib/SheareAction/SeekerAction/plan.ts).
 * ==================================================================
 */

/**
 * .env: NEXT_PUBLIC_FREE_APPLICATION_LIMIT=2
 * value na thakle / vul thakle 2 dhora hoy.
 */
const DEFAULT_FREE_APPLICATION_LIMIT = 2

function resolveFreeApplicationLimit(): number {
  const raw = process.env.NEXT_PUBLIC_FREE_APPLICATION_LIMIT
  if (!raw) return DEFAULT_FREE_APPLICATION_LIMIT

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_FREE_APPLICATION_LIMIT
  }

  return Math.floor(parsed)
}

/** free plan er apply limit (default 2) */
export const FREE_APPLICATION_LIMIT = resolveFreeApplicationLimit()

/** used = user ekhon porjonto koyta application joma diyeche */
export function hasReachedApplicationLimit(used: number): boolean {
  return used >= FREE_APPLICATION_LIMIT
}

/** free plan e ar koyta apply baki (kokhono rinatok hobe na) */
export function remainingFreeApplications(used: number): number {
  return Math.max(FREE_APPLICATION_LIMIT - used, 0)
}
