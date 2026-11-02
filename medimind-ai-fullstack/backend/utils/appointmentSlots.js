export function bookingKeys(doctorId, scheduledAt, durationMinutes) {
  const start = new Date(scheduledAt).getTime();
  const duration = Number(durationMinutes);
  if (!Number.isFinite(start) || !Number.isInteger(duration) || duration < 1) return [];
  const keys = [];
  const bucketSize = 60_000;
  const end = start + duration * 60_000;
  for (let bucket = Math.floor(start / bucketSize) * bucketSize; bucket < end; bucket += bucketSize) {
    keys.push(`${doctorId}:${bucket}`);
  }
  return keys;
}

export function intervalsOverlap(startA, durationA, startB, durationB) {
  const a = new Date(startA).getTime();
  const b = new Date(startB).getTime();
  const lengthA = Number(durationA) * 60_000;
  const lengthB = Number(durationB) * 60_000;
  return Number.isFinite(a) && Number.isFinite(b)
    && Number.isFinite(lengthA) && Number.isFinite(lengthB)
    && lengthA > 0 && lengthB > 0
    && a < b + lengthB && b < a + lengthA;
}
