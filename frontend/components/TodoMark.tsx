import { isTodo } from "@/config/legal";

/**
 * A regulated value that has not been supplied yet, rendered loudly.
 *
 * An unsupplied company number or APR must fail in review rather than pass as
 * something deliberate, so the marker names the exact token and is impossible
 * to miss.
 *
 * The local preview flag HIDE_UNFILLED does not change this rendering: it
 * removes the surrounding row before it ever reaches here. So there is one
 * appearance for a missing value, and it is the loud one.
 */
export function TodoMark({ value }: { value: string }) {
  if (!isTodo(value)) return <>{value}</>;
  return (
    <mark className="mx-0.5 rounded bg-red-500 px-1.5 py-0.5 font-mono text-[0.8em] font-bold text-white">
      {value}
    </mark>
  );
}
