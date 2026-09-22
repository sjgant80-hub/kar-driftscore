// kernel.mjs
// DriftScore — pure kernel: total variation distance between two frequency
// distributions. No I/O. Total: malformed input returns {ok:false, why}
// rather than throwing.

function isPlainObject(x) {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function validateDist(dist, label) {
  if (!isPlainObject(dist)) {
    return `${label} must be a plain object of {label: count}`;
  }
  const keys = Object.keys(dist);
  for (const k of keys) {
    const v = dist[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return `${label}.${k} must be a finite number`;
    }
    if (v < 0) {
      return `${label}.${k} is negative (${v}); counts must be >= 0`;
    }
  }
  return null;
}

function total(dist) {
  return Object.values(dist).reduce((sum, v) => sum + v, 0);
}

// normalize(dist) -> {ok:true, value:{label:probability}} | {ok:false, why}
export function normalize(dist) {
  const err = validateDist(dist, 'dist');
  if (err) return { ok: false, why: err };

  const t = total(dist);
  if (t <= 0) {
    return { ok: false, why: 'distribution has zero total count; cannot normalize' };
  }

  const value = {};
  for (const [k, v] of Object.entries(dist)) {
    value[k] = v / t;
  }
  return { ok: true, value };
}

// driftScore(distA, distB) -> {ok:true, value: 0..1} | {ok:false, why}
// Total variation distance: 0.5 * sum(|pA(label) - pB(label)|) over the
// union of labels present in either distribution. Missing labels are
// treated as probability 0 in the distribution that lacks them.
// 0 = identical distributions, 1 = fully disjoint support.
export function driftScore(distA, distB) {
  const errA = validateDist(distA, 'distA');
  if (errA) return { ok: false, why: errA };
  const errB = validateDist(distB, 'distB');
  if (errB) return { ok: false, why: errB };

  const totalA = total(distA);
  const totalB = total(distB);

  if (totalA <= 0) {
    return { ok: false, why: 'distA has zero total count; cannot normalize' };
  }
  if (totalB <= 0) {
    return { ok: false, why: 'distB has zero total count; cannot normalize' };
  }

  const labels = new Set([...Object.keys(distA), ...Object.keys(distB)]);
  let diffSum = 0;
  for (const label of labels) {
    const pA = (distA[label] ?? 0) / totalA;
    const pB = (distB[label] ?? 0) / totalB;
    diffSum += Math.abs(pA - pB);
  }

  return { ok: true, value: diffSum / 2 };
}
