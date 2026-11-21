// cell.mjs — DriftScore's three answers for the birth check (seed.json, genome/).
//
// judge  a claimed drift score is verified when DriftScore's own kernel (driftScore in kernel.mjs, the code the live
//        page runs byte for byte) recomputes the same total variation distance for the two distributions, to six
//        decimal places; unverified when it does not; refused when there is no number claimed, or the input is not
//        two distributions the kernel can score.
// lane   the kernel's own validation (normalize in kernel.mjs): both distributions must be label-count objects with
//        finite, non-negative counts and a total above zero.
import { driftScore, normalize } from '../kernel.mjs';

export async function inLane(input) {
  return normalize(input?.distA).ok && normalize(input?.distB).ok;
}

export async function judge(input) {
  if (!(await inLane(input)) || typeof input.score !== 'number') return 'refused';
  return Math.round(driftScore(input.distA, input.distB).value * 1e6) === Math.round(input.score * 1e6) ? 'verified' : 'unverified';
}

// health: DriftScore runs in a visitor's browser and sends nothing back, so its use, who depends on it and when it
// last earned its keep cannot be seen from inside the repository: null, said honestly
export async function health() {
  return { used: null, dependedOn: null, lastEarned: null };
}
