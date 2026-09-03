/**
 * Two badges, two claims. See the table in plan/02-data-model.md.
 *
 * The distinction is load-bearing, not cosmetic. A dashboard that badges
 * everything `demo data` reads as a mockup; one that badges everything
 * `measured` is lying about its numbers. So the wording and the colour are
 * deliberately far apart — amber and the words "demo data" for anything nobody
 * observed, teal and "measured" for anything a committed script derives from a
 * file in this repo. If a viewer has to read carefully to tell them apart, they
 * do no work.
 *
 * Never both on one value. Never neither.
 */

export function DemoBadge({ what }: { what?: string }) {
  return (
    <span
      className="badge badge-demo"
      data-testid="demo-badge"
      title={
        what
          ? `${what} is invented for this demo. Nobody observed it.`
          : 'Invented for this demo. Nobody observed this number.'
      }
    >
      demo data
    </span>
  )
}

export function MeasuredBadge({ what }: { what?: string }) {
  return (
    <span
      className="badge badge-measured"
      data-testid="measured-badge"
      title={
        what
          ? `${what} is derived from a file in this repo by a committed script, and can be re-run.`
          : 'Derived from a file in this repo by a committed script. Re-runnable.'
      }
    >
      measured
    </span>
  )
}
